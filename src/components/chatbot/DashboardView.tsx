import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics } from '@/hooks/useChatAnalytics';
import { useHistory } from '@/hooks/useChatHistory';
import { useChatSettings } from '@/hooks/useChatSettings';
import { getSessionId } from '@/lib/chat/backendChatApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

const SAFFRON = '#FF6B35';
const GOLD = '#C9A227';

interface DashboardViewProps {
  onBack: () => void;
}

export function DashboardView({ onBack }: DashboardViewProps) {
  const sessionId = getSessionId();
  const { data: analytics, loading: analyticsLoading } = useAnalytics(sessionId);
  const { conversations, loading: historyLoading, search, setSearch, deleteConversation, clearAllHistory } = useHistory(sessionId);
  const { settings, updateSetting } = useChatSettings();

  const overview = analytics?.overview ?? null;
  const dailyConv = analytics?.daily_conversations ?? [];
  const msgPerDay = analytics?.messages_per_day ?? [];
  const modeUsage = analytics?.mode_usage ?? { platform: 50, global: 50 };

  return (
    <div className="flex h-full flex-col bg-[#FAFAF8] dark:bg-[#1A1A2E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to chat">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Profile & Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="flex flex-1 flex-col min-h-0">
        <TabsList className="mx-3 mt-2 shrink-0 w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          <TabsContent value="overview" className="mt-2 space-y-4">
            {analyticsLoading && !overview ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : overview ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Total Conversations" value={String(overview.total_conversations)} />
                  <StatCard label="Messages Sent" value={String(overview.messages_sent)} />
                  <StatCard label="Messages Received" value={String(overview.messages_received)} />
                  <StatCard label="Avg Response (ms)" value={String(overview.avg_response_time_ms)} />
                  <StatCard label="Active Days Streak" value={String(overview.active_days_streak)} />
                  <StatCard label="Last Active" value={overview.last_active ? new Date(overview.last_active).toLocaleString() : '—'} />
                </div>
                {dailyConv.length > 0 && (
                  <div className="rounded-2xl border bg-card p-3">
                    <h3 className="text-sm font-semibold mb-2">Last 7 days activity</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={dailyConv.slice(-7)}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill={SAFFRON} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {overview.top_topics?.length > 0 && (
                  <div className="rounded-2xl border bg-card p-3">
                    <h3 className="text-sm font-semibold mb-2">Top topics</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {overview.top_topics.slice(0, 3).map((t, i) => (
                        <li key={i} className="truncate">🔹 {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Connect the chat backend to see analytics.</p>
            )}
          </TabsContent>
          <TabsContent value="analytics" className="mt-2 space-y-4">
            {analyticsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : analytics ? (
              <>
                {dailyConv.length > 0 && (
                  <div className="rounded-2xl border bg-card p-3">
                    <h3 className="text-sm font-semibold mb-2">Daily Conversations (last 30 days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={dailyConv}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="count" stroke={SAFFRON} strokeWidth={2} dot={{ fill: SAFFRON }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {msgPerDay.length > 0 && (
                  <div className="rounded-2xl border bg-card p-3">
                    <h3 className="text-sm font-semibold mb-2">Messages per day (last 7 days)</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={msgPerDay}>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="sent" fill={SAFFRON} name="Sent" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="received" fill={GOLD} name="Received" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="rounded-2xl border bg-card p-3">
                  <h3 className="text-sm font-semibold mb-2">Mode usage</h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Platform', value: modeUsage.platform, color: SAFFRON },
                          { name: 'Global', value: modeUsage.global, color: GOLD },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {[SAFFRON, GOLD].map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {analytics.recent_conversations?.length > 0 && (
                  <div className="rounded-2xl border bg-card p-3">
                    <h3 className="text-sm font-semibold mb-2">Recent conversations</h3>
                    <div className="text-xs overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1">Date</th>
                            <th className="text-left py-1">First message</th>
                            <th className="text-left py-1">Messages</th>
                            <th className="text-left py-1">Mode</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recent_conversations.map((c) => (
                            <tr key={c.id} className="border-b">
                              <td className="py-1">{c.date ? new Date(c.date).toLocaleDateString() : '—'}</td>
                              <td className="py-1 truncate max-w-[120px]">{c.first_message}</td>
                              <td className="py-1">{c.messages}</td>
                              <td className="py-1">{c.mode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No analytics data. Use the chat to generate some.</p>
            )}
          </TabsContent>
          <TabsContent value="history" className="mt-2 space-y-3">
            <input
              type="search"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <Button variant="outline" size="sm" onClick={() => clearAllHistory()} className="w-full">
              Clear all history
            </Button>
            {historyLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past conversations.</p>
            ) : (
              <ul className="space-y-2">
                {conversations.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{c.title || 'Chat'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.started_at).toLocaleString()} · {c.message_count} messages · {c.mode}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => deleteConversation(c.id)}
                      aria-label="Delete"
                    >
                      🗑️
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="settings" className="mt-2 space-y-4">
            <SettingRow label="Theme">
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark' | 'auto')}
                className="rounded-lg border bg-background px-2 py-1 text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </SettingRow>
            <SettingRow label="Font size">
              <select
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value as 'S' | 'M' | 'L')}
                className="rounded-lg border bg-background px-2 py-1 text-sm"
              >
                <option value="S">Small (13px)</option>
                <option value="M">Medium (15px)</option>
                <option value="L">Large (17px)</option>
              </select>
            </SettingRow>
            <SettingRow label="Chat sound">
              <input
                type="checkbox"
                checked={settings.chatSound}
                onChange={(e) => updateSetting('chatSound', e.target.checked)}
              />
            </SettingRow>
            <SettingRow label="Default mode">
              <select
                value={settings.defaultMode}
                onChange={(e) => updateSetting('defaultMode', e.target.value as 'platform' | 'global')}
                className="rounded-lg border bg-background px-2 py-1 text-sm"
              >
                <option value="platform">Platform Only</option>
                <option value="global">Global Search</option>
              </select>
            </SettingRow>
            <SettingRow label="Show typing indicator">
              <input
                type="checkbox"
                checked={settings.showTypingIndicator}
                onChange={(e) => updateSetting('showTypingIndicator', e.target.checked)}
              />
            </SettingRow>
            <SettingRow label="Show timestamps">
              <input
                type="checkbox"
                checked={settings.showTimestamps}
                onChange={(e) => updateSetting('showTimestamps', e.target.checked)}
              />
            </SettingRow>
            <SettingRow label="Auto-suggest follow-ups">
              <input
                type="checkbox"
                checked={settings.autoSuggestQuestions}
                onChange={(e) => updateSetting('autoSuggestQuestions', e.target.checked)}
              />
            </SettingRow>
            <SettingRow label="Notification badge">
              <input
                type="checkbox"
                checked={settings.notificationBadge}
                onChange={(e) => updateSetting('notificationBadge', e.target.checked)}
              />
            </SettingRow>
            <p className="text-xs text-muted-foreground">Your conversations are stored to improve your experience.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
