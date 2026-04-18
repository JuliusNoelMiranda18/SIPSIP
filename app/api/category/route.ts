import { prisma } from '@/prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { name } = await req.json()

    const category = await prisma.category.create({
      data: {
        name,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error(error)
    return new Response('Failed to create category', { status: 500 })
  }
}
