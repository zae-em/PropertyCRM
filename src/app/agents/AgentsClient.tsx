'use client'
import { useEffect, useState } from 'react'

export default function AgentsClient() {
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => setAgents(Array.isArray(d) ? d : []))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Agents</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {agents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No agents yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Phone', 'Role'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((a: any) => (
                <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.email}</td>
                  <td className="px-4 py-3 text-gray-500">{a.phone || '—'}</td>
                  <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">agent</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-sm text-gray-400">New agents can register via the signup page. Assign leads from the Leads section.</p>
    </div>
  )
}
