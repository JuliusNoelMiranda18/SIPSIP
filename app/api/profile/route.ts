import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json(); 
    const image = body.image;

    if (!image) {
      return new Response("Image missing", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return new Response("Failed to update profile", { status: 500 });
  }
}