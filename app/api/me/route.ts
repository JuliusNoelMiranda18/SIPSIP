import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(JSON.stringify({ id: session.user.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}