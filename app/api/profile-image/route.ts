import { prisma } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { image } = await req.json();

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: { image },
  });

  return NextResponse.json(updatedUser);
}