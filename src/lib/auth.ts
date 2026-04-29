import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './db'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials?.email })
        if (!user) throw new Error('No user found')
        const valid = await bcrypt.compare(credentials!.password, user.password)
        if (!valid) throw new Error('Invalid password')
        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.id = user.id }
      return token
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.id }
      return session
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET
}
