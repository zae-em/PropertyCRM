import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'
import Activity from '@/models/Activity'
import { calculateScore } from '@/lib/scoring'
import { sendNewLeadEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  // Rate limiting: agents 50/min, admins unlimited
  if (user.role === 'agent') {
    const allowed = rateLimit(`agent-${user.id}`, 50)
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const score = searchParams.get('score')

  const query: any = {}
  if (user.role === 'agent') query.assignedTo = user.id
  if (status) query.status = status
  if (score) query.score = score

  const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 })
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  if (user.role === 'agent') {
    const allowed = rateLimit(`agent-${user.id}`, 50)
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { name, email, phone, propertyInterest, budget, notes, source } = body
    if (!name || !propertyInterest || !budget) return NextResponse.json({ error: 'name, propertyInterest, budget are required' }, { status: 400 })

    await connectDB()
    const score = calculateScore(Number(budget))
    const lead = await Lead.create({ name, email, phone, propertyInterest, budget: Number(budget), notes, source, score })

    // Log activity
    await Activity.create({ lead: lead._id, action: 'created', description: `Lead created by ${user.name}`, performedBy: user.id, performedByName: user.name })

    // Send email (fire and forget)
    sendNewLeadEmail(lead).catch(console.error)

    return NextResponse.json(lead, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
