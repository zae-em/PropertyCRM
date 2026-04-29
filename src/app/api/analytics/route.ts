import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const [totalLeads, statusDist, scoreDist, agents] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$score', count: { $sum: 1 } } }]),
    User.find({ role: 'agent' }).select('_id name')
  ])

  // Agent performance: leads per agent
  const agentPerformance = await Promise.all(agents.map(async (agent) => {
    const total = await Lead.countDocuments({ assignedTo: agent._id })
    const closed = await Lead.countDocuments({ assignedTo: agent._id, status: 'Closed' })
    return { name: agent.name, total, closed }
  }))

  return NextResponse.json({ totalLeads, statusDist, scoreDist, agentPerformance })
}
