from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter
from supabase import create_client, Client
import os

router = APIRouter(prefix="/api", tags=["analytics"])

_supabase: Optional[Client] = None


def get_supabase() -> Optional[Client]:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            _supabase = create_client(url, key)
    return _supabase


@router.get("/analytics")
async def get_analytics(session_id: str):
    sb = get_supabase()
    if not sb:
        return {
            "overview": {"total_conversations": 0, "messages_sent": 0, "messages_received": 0, "avg_response_time_ms": 0, "active_days_streak": 0, "last_active": None, "top_topics": []},
            "daily_conversations": [],
            "messages_per_day": [],
            "mode_usage": {"platform": 50, "global": 50},
            "top_categories": [],
            "recent_conversations": [],
        }
    try:
        r = sb.table("users").select("id").eq("session_id", session_id).execute()
        if not r.data or len(r.data) == 0:
            return _empty_analytics()
        user_id = r.data[0]["id"]

        convs = sb.table("conversations").select("id,started_at,mode,message_count,title").eq("user_id", user_id).order("started_at", desc=True).execute()
        messages = []
        for c in (convs.data or []):
            mr = sb.table("messages").select("content,role,created_at,response_time_ms").eq("conversation_id", c["id"]).execute()
            messages.extend(mr.data or [])

        total_conv = len(convs.data or [])
        user_msgs = sum(1 for m in messages if m.get("role") == "user")
        bot_msgs = sum(1 for m in messages if m.get("role") == "assistant")
        times = [m.get("response_time_ms") for m in messages if m.get("response_time_ms")]
        avg_time = int(sum(times) / len(times)) if times else 0
        last_active = None
        if convs.data:
            last_active = convs.data[0].get("started_at")

        dates_seen = set()
        for c in (convs.data or []):
            d = (c.get("started_at") or "")[:10]
            if d:
                dates_seen.add(d)
        streak = 0
        d = datetime.utcnow().date()
        for _ in range(365):
            if d.isoformat() in dates_seen:
                streak += 1
                d -= timedelta(days=1)
            else:
                break

        daily_conv = {}
        for c in (convs.data or []):
            d = (c.get("started_at") or "")[:10]
            if d:
                daily_conv[d] = daily_conv.get(d, 0) + 1
        last_30 = [(datetime.utcnow() - timedelta(days=i)).date().isoformat() for i in range(30)]
        daily_conversations = [{"date": d, "count": daily_conv.get(d, 0)} for d in reversed(last_30)]

        msg_per_day = {}
        for m in messages:
            d = (m.get("created_at") or "")[:10]
            if not d:
                continue
            if d not in msg_per_day:
                msg_per_day[d] = {"sent": 0, "received": 0}
            if m.get("role") == "user":
                msg_per_day[d]["sent"] += 1
            else:
                msg_per_day[d]["received"] += 1
        last_7 = [(datetime.utcnow() - timedelta(days=i)).date() for i in range(7)]
        last_7.reverse()
        messages_per_day = [{"day": d.strftime("%A"), "date": d.isoformat(), "sent": msg_per_day.get(d.isoformat(), {}).get("sent", 0), "received": msg_per_day.get(d.isoformat(), {}).get("received", 0)} for d in last_7]

        platform_count = sum(1 for c in (convs.data or []) if c.get("mode") == "platform")
        global_count = total_conv - platform_count
        mode_usage = {"platform": round(100 * platform_count / total_conv) if total_conv else 50, "global": round(100 * global_count / total_conv) if total_conv else 50}

        topics = []
        for m in messages:
            if m.get("role") == "user":
                content = (m.get("content") or "")[:100]
                if content:
                    topics.append(content)
        from collections import Counter
        top_categories = [{"name": k, "count": v} for k, v in Counter(topics).most_common(10)]

        recent = []
        for c in (convs.data or [])[:10]:
            recent.append({
                "id": c["id"],
                "date": c.get("started_at"),
                "first_message": (c.get("title") or "Chat")[:50],
                "messages": c.get("message_count") or 0,
                "mode": c.get("mode") or "platform",
                "duration": "",
            })
        top_topics = [t["name"] for t in top_categories[:3]]

        return {
            "overview": {
                "total_conversations": total_conv,
                "messages_sent": user_msgs,
                "messages_received": bot_msgs,
                "avg_response_time_ms": avg_time,
                "active_days_streak": streak,
                "last_active": last_active,
                "top_topics": top_topics,
            },
            "daily_conversations": daily_conversations,
            "messages_per_day": messages_per_day,
            "mode_usage": mode_usage,
            "top_categories": top_categories,
            "recent_conversations": recent,
        }
    except Exception:
        return _empty_analytics()


def _empty_analytics():
    return {
        "overview": {"total_conversations": 0, "messages_sent": 0, "messages_received": 0, "avg_response_time_ms": 0, "active_days_streak": 0, "last_active": None, "top_topics": []},
        "daily_conversations": [],
        "messages_per_day": [],
        "mode_usage": {"platform": 50, "global": 50},
        "top_categories": [],
        "recent_conversations": [],
    }
