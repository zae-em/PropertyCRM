import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'
import Activity from '@/models/Activity'
import User from '@/models/User'
import { calculateScore } from '@/lib/scoring'
import { sendAssignmentEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const lead = await Lead.findById(params.id).populate('assignedTo', 'name email phone')
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  const user = session.user as any
  if (user.role === 'agent' && lead.assignedTo?._id?.toString() !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const activities = await Activity.find({ lead: params.id }).sort({ createdAt: -1 })
  return NextResponse.json({ lead, activities })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  if (user.role === 'agent') {
    const allowed = rateLimit(`agent-${user.id}`, 50)
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  await connectDB()
  const body = await req.json()
  const existing = await Lead.findById(params.id)
  if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  // Agents can only update leads assigned to them
  if (user.role === 'agent' && existing.assignedTo?.toString() !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Recalculate score if budget changed
  if (body.budget) body.score = calculateScore(Number(body.budget))
  body.lastActivity = new Date()

  // Track assignment
  if (body.assignedTo && body.assignedTo !== existing.assignedTo?.toString()) {
    const agent = await User.findById(body.assignedTo)
    if (agent) {
      const action = existing.assignedTo ? 'reassigned' : 'assigned'
      await Activity.create({ lead: params.id, action, description: `Lead ${action} to ${agent.name}`, performedBy: user.id, performedByName: user.name })
      sendAssignmentEmail(existing, agent.email, agent.name).catch(console.error)
    }
  } else if (body.status && body.status !== existing.status) {
    await Activity.create({ lead: params.id, action: 'status_updated', description: `Status changed to ${body.status}`, performedBy: user.id, performedByName: user.name })
  } else if (body.notes && body.notes !== existing.notes) {
    await Activity.create({ lead: params.id, action: 'notes_updated', description: 'Notes updated', performedBy: user.id, performedByName: user.name })
  }

  const updated = await Lead.findByIdAndUpdate(params.id, body, { new: true }).populate('assignedTo', 'name email')
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await connectDB()
  await Lead.findByIdAndDelete(params.id)
  await Activity.deleteMany({ lead: params.id })
  return NextResponse.json({ message: 'Lead deleted' })
}
