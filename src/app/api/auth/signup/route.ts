import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    await connectDB()
    const exists = await User.findOne({ email })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, role: role || 'agent', phone })
    return NextResponse.json({ message: 'User created', id: user._id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
