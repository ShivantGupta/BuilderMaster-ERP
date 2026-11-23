import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("bm_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
