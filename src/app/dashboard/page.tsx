'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import Link from 'next/link'

const COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }
const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444']

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [analytics, setAnalytics] = useState<any>(null)
  const [reminders, setReminders] = useState<any>(null)
  const [recentLeads, setRecentLeads] = useState<any[]>([])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/analytics').then(r => r.json()).then(setAnalytics)
    }
    fetch('/api/reminders').then(r => r.json()).then(setReminders)
    fetch('/api/leads').then(r => r.json()).then(d => setRecentLeads(Array.isArray(d) ? d.slice(0, 5) : []))
  }, [user?.role])

  const scoreData = analytics?.scoreDist?.map((s: any) => ({ name: s._id, value: s.count })) || []
  const statusData = analytics?.statusDist?.map((s: any) => ({ name: s._id, count: s.count })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {user?.role === 'admin' ? 'Admin Dashboard' : `Welcome, ${user?.name}`}
        </h1>
        {user?.role === 'admin' && (
          <a href="/api/leads/export" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
            ⬇ Export Excel
          </a>
        )}
      </div>

      {/* Alert banners */}
      {reminders?.overdue?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-medium">⚠️ {reminders.overdue.length} overdue follow-up{reminders.overdue.length > 1 ? 's' : ''}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {reminders.overdue.map((l: any) => (
              <Link key={l._id} href={`/leads/${l._id}`} className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">{l.name}</Link>
            ))}
          </div>
        </div>
      )}
      {reminders?.stale?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-700 font-medium">🕐 {reminders.stale.length} stale lead{reminders.stale.length > 1 ? 's' : ''} (no activity for 7+ days)</p>
        </div>
      )}

      {/* Admin analytics */}
      {user?.role === 'admin' && analytics && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Leads" value={analytics.totalLeads} color="blue" />
            <StatCard label="High Priority" value={analytics.scoreDist?.find((s: any) => s._id === 'High')?.count || 0} color="red" />
            <StatCard label="Closed" value={analytics.statusDist?.find((s: any) => s._id === 'Closed')?.count || 0} color="green" />
            <StatCard label="Agents" value={analytics.agentPerformance?.length || 0} color="purple" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Status distribution */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4">Lead Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority pie */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={scoreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {scoreData.map((entry: any, i: number) => (
                      <Cell key={i} fill={(COLORS as any)[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent performance */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Agent Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Agent</th><th className="pb-2">Total Leads</th><th className="pb-2">Closed</th><th className="pb-2">Success Rate</th>
                </tr></thead>
                <tbody>
                  {analytics.agentPerformance?.map((a: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 font-medium">{a.name}</td>
                      <td className="py-2">{a.total}</td>
                      <td className="py-2 text-green-600">{a.closed}</td>
                      <td className="py-2">{a.total > 0 ? Math.round((a.closed / a.total) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Recent leads for agents */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Recent Leads</h3>
          <Link href="/leads" className="text-blue-600 text-sm hover:underline">View all →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="text-gray-400 text-sm">No leads yet.</p>
        ) : (
          <div className="space-y-2">
            {recentLeads.map((lead: any) => (
              <Link key={lead._id} href={`/leads/${lead._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
                <div>
                  <p className="font-medium text-gray-800">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.propertyInterest} • {lead.budget}M PKR</p>
                </div>
                <div className="flex gap-2 items-center">
                  <ScoreBadge score={lead.score} />
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{lead.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: any = { blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700', green: 'bg-green-50 text-green-700', purple: 'bg-purple-50 text-purple-700' }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

function ScoreBadge({ score }: { score: string }) {
  const c = score === 'High' ? 'bg-red-100 text-red-700' : score === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{score}</span>
}
