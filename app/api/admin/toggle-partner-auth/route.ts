import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { uid, disabled } = await req.json();

  if (!uid) {
    return NextResponse.json({ error: "UID is required." }, { status: 400 });
  }

  try {
    await admin.auth().updateUser(uid, { disabled });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to update auth status." }, { status: 500 });
  }
}
