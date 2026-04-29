import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  await connectDB()
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const query: any = {}
  if (user.role === 'agent') query.assignedTo = user.id

  const [overdue, stale] = await Promise.all([
    // Leads with passed follow-up date
    Lead.find({ ...query, followUpDate: { $lt: now }, status: { $ne: 'Closed' } })
      .populate('assignedTo', 'name').select('name status followUpDate score assignedTo'),
    // Leads with no activity for 7 days
    Lead.find({ ...query, lastActivity: { $lt: sevenDaysAgo }, status: { $nin: ['Closed', 'Lost'] } })
      .populate('assignedTo', 'name').select('name status lastActivity score assignedTo')
  ])

  return NextResponse.json({ overdue, stale })
}
