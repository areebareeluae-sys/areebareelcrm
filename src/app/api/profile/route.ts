import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary ko direct .env ki values se configure karna
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const currentUser = userResult[0];

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, country, bio, image } = body;

    let imageUrl = image;

    // Agar image base64 format mein aayi hai toh Cloudinary par upload karein
    if (image && image.startsWith("data:image")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "profile_pictures",
        });
        imageUrl = uploadResponse.secure_url;
      } catch (cloudinaryErr) {
        console.error("Cloudinary Upload Error:", cloudinaryErr);
        return NextResponse.json(
          { error: "Cloudinary upload failed. Please check credentials." },
          { status: 403 }
        );
      }
    }

    // Database update
    await db.update(users)
      .set({
        name: name,
        country: country,
        bio: bio,
        ...(imageUrl && { image: imageUrl }),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, message: "Profile updated successfully!", imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}