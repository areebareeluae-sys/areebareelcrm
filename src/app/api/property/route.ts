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

    // 'upload' ke baad version (jaise v12345678) hota hai, uske baad folder/public_id hota hai
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

    // Seller data fetch
    if (propertyData.salescustomerid) {
      const sellerRes = await db.select().from(customer).where(eq(customer.id, propertyData.salescustomerid));
      sellerData = sellerRes[0] || null;
    }

    // Buyer data fetch (Agar property sold hai aur buyercustomerid mojood hai)
    if (propertyData.buyercustomerid) {
      const buyerRes = await db.select().from(customer).where(eq(customer.id, propertyData.buyercustomerid));
      buyerData = buyerRes[0] || null;
    }

    return {
      success: true,
      property: propertyData,
      seller: sellerData,
      buyer: buyerData, // 👈 Buyer data yahan return hoga
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

// 3. Server action to upload a single image to Cloudinary securely
export async function uploadImageToCloudinary(base64Image: string) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'aap_crm_properties',
    });
    return { success: true, url: uploadResponse.secure_url };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    return { success: false, error: error.message || 'Image upload failed' };
  }
}

// 4. Add Property
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
  
  // 👈 Tags handle karna yahan add kiya gaya hai
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
      tags, // 👈 Insert mein tags pass kar diye
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

// 5. Update Property (With Cloudinary Image Deletion)
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

  // 👈 Tags handle karna update mein bhi add kiya gaya hai
  const tags = formData.get('tags') as string || '[]';

  const refname = formData.get('refname') as string;
  const refnumber = formData.get('refnumber') as string;
  const refemail = formData.get('refemail') as string;
  const refaddress = formData.get('refaddress') as string;

  try {
    // A. Database se pehle ki purani property details mangwayen
    const existingProperty = await db.select().from(property).where(eq(property.id, id)).limit(1);

    if (existingProperty.length > 0) {
      let oldImages: string[] = [];
      try {
        oldImages = JSON.parse(existingProperty[0].images || '[]');
      } catch (e) {
        oldImages = [];
      }

      // B. Jo images purani list mein thi lekin naye list mein nahi hain unko filter karein
      const imagesToDelete = oldImages.filter((oldUrl) => !imageUrls.includes(oldUrl));

      // C. Cloudinary se wo images delete karein
      for (const imgUrl of imagesToDelete) {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // D. Database record update karein
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
        tags, // 👈 Update mein tags save kar diye
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

// 6. Delete Property (With Cloudinary Images Cleanup)
export async function deleteProperty(id: string) {
  try {
    // A. Pehle property fetch karein taaki image URLs mil saken
    const existingProperty = await db.select().from(property).where(eq(property.id, id)).limit(1);

    if (existingProperty.length > 0) {
      let images: string[] = [];
      try {
        images = JSON.parse(existingProperty[0].images || '[]');
      } catch (e) {
        images = [];
      }

      // B. Saari images ko Cloudinary se delete karein
      for (const imgUrl of images) {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // C. Database se property record delete karein
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