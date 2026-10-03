'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
// 1. Get All Users
export async function getUsers() {
  return await db.select().from(users);
}

// 2. Login User Action
export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const foundUser = await db.select().from(users).where(
      or(eq(users.email, email), eq(users.name, email))
    );

    const validUser = foundUser.find(u => u.password === password);

    if (!validUser) {
      return { error: 'Invalid email or password!' };
    }

    // Cookies set karna
    const cookieStore = await cookies();
    cookieStore.set('isLoggedIn', 'true', { httpOnly: true, path: '/' });
    cookieStore.set('userId', validUser.id, { httpOnly: true, path: '/' });
    cookieStore.set('userName', validUser.name, { httpOnly: false, path: '/' });
    cookieStore.set('userEmail', validUser.email, { httpOnly: false, path: '/' });
    
    // Image cookie set ya update karein
    if (validUser.image) {
      cookieStore.set('userImage', validUser.image, { httpOnly: false, path: '/' });
    } else {
      cookieStore.set('userImage', '', { httpOnly: false, path: '/' });
    }

  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return { error: 'Something went wrong. Please try again!' };
  }

  redirect('/');
}

// Logout User Action
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('isLoggedIn');
  cookieStore.delete('userId');
  cookieStore.delete('userName');
  cookieStore.delete('userEmail');
  cookieStore.delete('userImage');

  redirect('/');
}

// 3. Add User (Safe Duplicate Check)
export async function addUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const country = formData.get('country') as string;

  const existingUser = await db.select().from(users).where(
    or(
      eq(users.email, email),
      eq(users.name, name),
      eq(users.phone, phone)
    )
  );

  if (existingUser.length > 0) {
    console.log("Duplicate User Error: Email, Name, or Phone already exists.");
    return;
  }

  await db.insert(users).values({
    id: Date.now().toString(),
    name,
    email,
    password,
    phone,
    country,
    status: 'Active',
  });

  revalidatePath('/');
}

// 4. Update User
export async function updateUser(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const country = formData.get('country') as string;
  const password = formData.get('password') as string;

  const existingUser = await db.select().from(users).where(
    or(
      eq(users.name, name),
      eq(users.phone, phone)
    )
  );

  const duplicate = existingUser.find(u => u.id !== id);

  if (duplicate) {
    console.log("Duplicate Update Error: Name or Phone already exists.");
    return;
  }

  await db.update(users)
    .set({ name, phone, country, password })
    .where(eq(users.id, id));

  revalidatePath('/users/create');
}

// 5. Delete User
export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id));
  revalidatePath('/users/create');
}
export async function GET() {
  try {
    const data = await db.select().from(users);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}