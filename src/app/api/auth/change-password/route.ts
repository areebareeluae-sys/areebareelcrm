import { db } from "@/db"; // Apni DB configuration ka path yahan adjust kar lein
import { users } from "@/db/schema"; // Apne schema ka path yahan adjust kar lein
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId"); // Login ke waqt jo userId cookie mein save ki thi

    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirm password do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // User ko database se fetch karein
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Plain text password match check
    if (currentPassword !== user.password) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Database mein naya password plain text ki tarah update kar dein
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}