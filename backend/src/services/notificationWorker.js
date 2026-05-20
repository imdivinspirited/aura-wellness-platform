/**
 * Background fan-out: per-user in-app rows for YouTube + event schedules.
 * Each user gets their own documents (read state, TTL). Global worker state avoids duplicate spam.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  purgeExpiredNotifications,
  upsertNotificationForUser,
} from '../lib/inAppNotificationsRepo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cachedEvents = null;

function loadEventSchedule() {
  if (cachedEvents) return cachedEvents;
  try {
    const p = path.join(__dirname, '..', 'data', 'eventNotificationSchedule.json');
    const raw = readFileSync(p, 'utf8');
    cachedEvents = JSON.parse(raw);
    if (!Array.isArray(cachedEvents)) cachedEvents = [];
  } catch {
    cachedEvents = [];
  }
  return cachedEvents;
}

async function getYoutubeBroadcastState() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const channelId =
    process.env.YOUTUBE_CHANNEL_ID?.trim() ||
    process.env.YOUTUBE_NOTIFICATION_CHANNEL_ID?.trim() ||
    'UCd5YO7yBBpkjKtfVAkBpnVA';
  if (!apiKey) {
    return { kind: 'idle' };
  }
  const base = 'https://www.googleapis.com/youtube/v3';
  const headers = { Accept: 'application/json' };

  const liveSearch = await fetch(
    `${base}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&type=video&eventType=live&maxResults=1&key=${encodeURIComponent(apiKey)}`,
    { headers }
  );
  if (!liveSearch.ok) return { kind: 'idle' };
  const liveJson = await liveSearch.json();
  const liveId = liveJson.items?.[0]?.id?.videoId;
  if (liveId) {
    const vd = await fetch(
      `${base}/videos?part=snippet,liveStreamingDetails&id=${encodeURIComponent(liveId)}&key=${encodeURIComponent(apiKey)}`,
      { headers }
    );
    if (vd.ok) {
      const vj = await vd.json();
      const item = vj.items?.[0];
      if (item?.snippet?.liveBroadcastContent === 'live') {
        return {
          kind: 'live',
          videoId: liveId,
          title: item.snippet?.title?.trim() || 'Live',
          description: (item.snippet?.description || '').slice(0, 400),
        };
      }
    }
  }

  const upSearch = await fetch(
    `${base}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&type=video&eventType=upcoming&maxResults=1&key=${encodeURIComponent(apiKey)}`,
    { headers }
  );
  if (!upSearch.ok) return { kind: 'idle' };
  const upJson = await upSearch.json();
  const upId = upJson.items?.[0]?.id?.videoId;
  if (!upId) return { kind: 'idle' };
  const vd2 = await fetch(
    `${base}/videos?part=snippet,liveStreamingDetails&id=${encodeURIComponent(upId)}&key=${encodeURIComponent(apiKey)}`,
    { headers }
  );
  if (!vd2.ok) return { kind: 'idle' };
  const vj2 = await vd2.json();
  const item2 = vj2.items?.[0];
  const sched = item2?.liveStreamingDetails?.scheduledStartTime;
  if (item2?.snippet?.liveBroadcastContent === 'upcoming' && sched) {
    const t = new Date(sched).getTime();
    if (t > Date.now() - 60_000) {
      return {
        kind: 'scheduled',
        videoId: upId,
        title: item2.snippet?.title?.trim() || 'Scheduled live',
        description: (item2.snippet?.description || '').slice(0, 400),
        scheduledStartTime: sched,
      };
    }
  }
  return { kind: 'idle' };
}

async function fanoutAllUsers(db, buildPayload) {
  const users = db.collection('users');
  const cursor = users.find({ deleted_at: null }, { projection: { id: 1 } });
  // eslint-disable-next-line no-restricted-syntax
  for await (const u of cursor) {
    if (!u?.id) continue;
    const payload = buildPayload(u);
    if (payload) {
      // eslint-disable-next-line no-await-in-loop
      await upsertNotificationForUser(db, u.id, payload);
    }
  }
}

async function runYoutubeFanout(db) {
  const state = await getYoutubeBroadcastState();
  const fingerprint =
    state.kind === 'idle'
      ? 'idle'
      : state.kind === 'live'
        ? `live:${state.videoId}`
        : `scheduled:${state.videoId}`;

  const col = db.collection('notification_worker_state');
  const prev = await col.findOne({ _id: 'youtube_broadcast' });
  if (prev?.fingerprint === fingerprint) return;

  await col.updateOne(
    { _id: 'youtube_broadcast' },
    { $set: { fingerprint, updated_at: new Date(), payload: state } },
    { upsert: true }
  );

  if (state.kind === 'live') {
    const dedupe_key = `yt:live:${state.videoId}`;
    await fanoutAllUsers(db, () => ({
      dedupe_key,
      type: 'program',
      title: 'Live — Art of Living International Center',
      message: state.title,
      action_url: `/events/youtube/${state.videoId}`,
      action_label: 'Watch',
    }));
  } else if (state.kind === 'scheduled') {
    const dedupe_key = `yt:scheduled:${state.videoId}`;
    const start = new Date(state.scheduledStartTime);
    await fanoutAllUsers(db, () => ({
      dedupe_key,
      type: 'info',
      title: 'Scheduled live stream',
      message: `${state.title} — starts ${start.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`,
      action_url: `/events/youtube/${state.videoId}`,
      action_label: 'Open',
    }));
  }
}

function inWindow(now, target, windowMs) {
  const t = target.getTime();
  return now >= t - windowMs && now <= t + windowMs;
}

async function runEventFanout(db) {
  const events = loadEventSchedule();
  const now = Date.now();
  const dispatch = db.collection('notification_dispatch_log');

  for (const ev of events) {
    const start = new Date(ev.startDate);
    const end = ev.endDate ? new Date(ev.endDate) : null;
    if (!Number.isFinite(start.getTime())) continue;

    const baseUrl = `/events/${ev.slug}`;

    /** @type {Array<{ key: string; title: string; message: string; type: string }>} */
    const shots = [];

    if (inWindow(now, new Date(start.getTime() - 24 * 60 * 60 * 1000), 30 * 60 * 1000)) {
      shots.push({
        key: `evt:${ev.id}:remind24h`,
        type: 'registration',
        title: `Starting tomorrow — ${ev.title}`,
        message: 'Your saved event is coming up in about 24 hours.',
      });
    }
    if (inWindow(now, new Date(start.getTime() - 60 * 60 * 1000), 12 * 60 * 1000)) {
      shots.push({
        key: `evt:${ev.id}:remind1h`,
        type: 'registration',
        title: `Starting in about 1 hour — ${ev.title}`,
        message: 'Join from the event page when you are ready.',
      });
    }
    if (inWindow(now, new Date(start.getTime() - 5 * 60 * 1000), 6 * 60 * 1000)) {
      shots.push({
        key: `evt:${ev.id}:remind5m`,
        type: 'registration',
        title: `Starting in 5 minutes — ${ev.title}`,
        message: 'The programme window is opening shortly.',
      });
    }
    if (inWindow(now, start, 4 * 60 * 1000)) {
      shots.push({
        key: `evt:${ev.id}:start`,
        type: 'success',
        title: `Started — ${ev.title}`,
        message: 'The event window has begun. Open the page for the latest details.',
      });
    }
    if (end && Number.isFinite(end.getTime()) && inWindow(now, end, 4 * 60 * 1000)) {
      shots.push({
        key: `evt:${ev.id}:end`,
        type: 'info',
        title: `Ended — ${ev.title}`,
        message: 'This programme time block has ended. Thank you for participating.',
      });
    }

    for (const shot of shots) {
      const globalKey = shot.key;
      try {
        await dispatch.insertOne({ key: globalKey, created_at: new Date() });
      } catch (e) {
        if (e?.code !== 11000) throw e;
        // eslint-disable-next-line no-continue
        continue;
      }
      await fanoutAllUsers(db, () => ({
        dedupe_key: globalKey,
        type: shot.type,
        title: shot.title,
        message: shot.message,
        action_url: baseUrl,
        action_label: 'Event page',
      }));
    }
  }
}

/**
 * @param {() => import('mongodb').Db} getDatabase
 * @param {{ intervalMs?: number }} opts
 */
export function startNotificationWorker(getDatabase, opts = {}) {
  const intervalMs = opts.intervalMs ?? 90_000;

  const tick = async () => {
    try {
      const db = getDatabase();
      await purgeExpiredNotifications(db);
      await runYoutubeFanout(db);
      await runEventFanout(db);
    } catch (e) {
      console.error('[notificationWorker]', e);
    }
  };

  tick();
  const id = setInterval(tick, intervalMs);
  return () => clearInterval(id);
}
