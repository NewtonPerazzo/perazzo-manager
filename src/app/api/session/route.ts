import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };

  if (!body.token) {
    return NextResponse.json({ detail: "Token required" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: body.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
