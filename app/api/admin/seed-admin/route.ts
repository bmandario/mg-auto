import { NextRequest, NextResponse } from "next/server";
import adminSdk from "@/lib/firebase-admin";

// One-time route to register a Firebase Auth user as an admin.
// POST { email } — looks up the user by email and adds them to the admins collection.
export async function POST(req: NextRequest) {
  const { email, secret } = await req.json();

  // Basic protection so this can't be called by anyone
  if (secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const user = await adminSdk.auth().getUserByEmail(email);
    await adminSdk.firestore().collection("admins").doc(user.uid).set({
      email: user.email,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, uid: user.uid, email: user.email });
  } catch (err: any) {
    if (err?.code === "auth/user-not-found") {
      return NextResponse.json({ error: "No Firebase Auth user found with that email." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to add admin." }, { status: 500 });
  }
}
