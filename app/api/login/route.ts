import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return new Response("Invalid credentials", { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return new Response("Invalid credentials", { status: 401 });
    }

    // ✅ Create response
    const response = NextResponse.json({
      message: "Login successful",
    });

    // ✅ Set cookie (user id stored)
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;

  } catch (error) {
    console.error(error);
    return new Response("Login failed", { status: 500 });
  }
}