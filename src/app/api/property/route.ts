'use server';

import { db } from '@/db';
import { property, customer } from '@/db/schema';
import { eq, or, like } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'y556pcib',
  api_key: process.env.CLOUDINARY_API_KEY || '475551924862539',
  api_secret: process.env.CLOUDINARY_API_SECRET || '8gXwf91NPnjkSAgPGC2VzSD_sec',
});

// Helper function to extract Cloudinary Public ID from URL
function getPublicIdFromUrl(url: string) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    return publicId;
  } catch (err) {
    console.error('Error extracting public ID:', err);
    return null;
  }
}

export async function getPropertyDetails(id: string) {
  try {
    const prop = await db.select().from(property).where(eq(property.id, id));
    if (!prop || prop.length === 0) return { success: false, message: 'Property not found' };

    const propertyData = prop[0];
    let sellerData = null;
    let buyerData = null;

    if (propertyData.salescustomerid) {
      const sellerRes = await db.select().from(customer).where(eq(customer.id, propertyData.salescustomerid));
      sellerData = sellerRes[0] || null;
    }

    if (propertyData.buyercustomerid) {
      const buyerRes = await db.select().from(customer).where(eq(customer.id, propertyData.buyercustomerid));
      buyerData = buyerRes[0] || null;
    }

    return {
      success: true,
      property: propertyData,
      seller: sellerData,
      buyer: buyerData,
    };
  } catch (error) {
    console.error('Error fetching property details:', error);
    return { success: false, message: 'Internal Server Error' };
  }
}

// 1. Get All Properties with search filter
export async function getProperties(searchQuery?: string) {
  if (searchQuery && searchQuery.trim() !== '') {
    const term = `%${searchQuery}%`;
    return await db.select().from(property).where(
      or(
        like(property.title, term),
        like(property.city, term),
        like(property.address, term),
        like(property.category, term)
      )
    );
  }
  return await db.select().from(property);
}

// 2. Get Customers for Search Seller modal
export async function getCustomersForModal() {
  return await db.select().from(customer);
}

// 3. Add Property (Receives final image URLs)
export async function addProperty(formData: FormData, salescustomerid: string, imageUrls: string[]) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'admin';

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const maxprice = formData.get('maxprice') as string;
  const minprice = formData.get('minprice') as string;
  const category = formData.get('category') as string;
  const type = formData.get('type') as string;
  const country = formData.get('country') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  const bathrooms = Number(formData.get('bathrooms'));
  const bedrooms = Number(formData.get('bedrooms'));
  const area = formData.get('area') as string;
  const Garages = Number(formData.get('Garages'));
  const tags = formData.get('tags') as string || '[]';

  const refname = formData.get('refname') as string;
  const refnumber = formData.get('refnumber') as string;
  const refemail = formData.get('refemail') as string;
  const refaddress = formData.get('refaddress') as string;

  try {
    await db.insert(property).values({
      id: Date.now().toString(),
      title,
      description,
      maxprice,
      minprice,
      category,
      type,
      country,
      city,
      address,
      bathrooms,
      bedrooms,
      area,
      Garages,
      images: JSON.stringify(imageUrls),
      tags,
      Purchaseorderid: "",
      salescustomerid,
      buyercustomerid: '',
      createdby: userId,
      closedby: '',
      closedprice: '0',
      closeddate: '',
      status: 'Active',
      refname,
      refnumber,
      advance: "0",
      fullpaymentdate: "",
      refemail,
      refaddress,
      createdAt: new Date().toISOString(),
    });

    revalidatePath('/properties');
    return { success: true };
  } catch (error: any) {
    console.error('Add Property Error:', error);
    return { success: false, error: 'Failed to add property.' };
  }
}

// 4. Update Property (Deletes removed images from Cloudinary & updates URLs)
export async function updateProperty(id: string, formData: FormData, salescustomerid: string, imageUrls: string[]) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const maxprice = formData.get('maxprice') as string;
  const minprice = formData.get('minprice') as string;
  const category = formData.get('category') as string;
  const type = formData.get('type') as string;
  const country = formData.get('country') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  const bathrooms = Number(formData.get('bathrooms'));
  const bedrooms = Number(formData.get('bedrooms'));
  const area = formData.get('area') as string;
  const Garages = Number(formData.get('Garages'));
  const tags = formData.get('tags') as string || '[]';

  const refname = formData.get('refname') as string;
  const refnumber = formData.get('refnumber') as string;
  const refemail = formData.get('refemail') as string;
  const refaddress = formData.get('refaddress') as string;

  try {
    // A. Fetch existing property to check old images
    const existingProperty = await db.select().from(property).where(eq(property.id, id)).limit(1);

    if (existingProperty.length > 0) {
      let oldImages: string[] = [];
      try {
        oldImages = JSON.parse(existingProperty[0].images || '[]');
      } catch (e) {
        oldImages = [];
      }

      // B. Find images that were in the old list but are missing in the new list
      const imagesToDelete = oldImages.filter((oldUrl) => !imageUrls.includes(oldUrl));

      // C. Delete removed images from Cloudinary
      for (const imgUrl of imagesToDelete) {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // D. Update database record
    await db.update(property)
      .set({
        title,
        description,
        maxprice,
        minprice,
        category,
        type,
        country,
        city,
        address,
        bathrooms,
        bedrooms,
        area,
        Garages,
        images: JSON.stringify(imageUrls),
        tags,
        salescustomerid,
        refname,
        refnumber,
        refemail,
        refaddress,
      })
      .where(eq(property.id, id));

    revalidatePath('/properties');
    return { success: true };
  } catch (error: any) {
    console.error('Update Property Error:', error);
    return { success: false, error: 'Failed to update property.' };
  }
}

// 5. Delete Property (Cleans up all images from Cloudinary)
export async function deleteProperty(id: string) {
  try {
    const existingProperty = await db.select().from(property).where(eq(property.id, id)).limit(1);

    if (existingProperty.length > 0) {
      let images: string[] = [];
      try {
        images = JSON.parse(existingProperty[0].images || '[]');
      } catch (e) {
        images = [];
      }

      for (const imgUrl of images) {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await db.delete(property).where(eq(property.id, id));
    revalidatePath('/properties');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Property Error:', error);
    return { success: false, error: 'Failed to delete property.' };
  }
}

export async function GET() {
  try {
    const data = await db.select().from(property);
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