import { NextRequest, NextResponse } from "next/server";

const API_KEY = "AIzaSyCDnqJSFiOAubJRl95pmK0tuB6Af5Q8JnA";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message ?? "Failed to send reset email.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
