import { db } from '@/db';
import { property } from '@/db/schema';
import AllPropertiesPage from './PropertyClientPage'; // Agar file ka naam PropertyClientPage.tsx rakha hai

export default async function Page() {
  const properties = await db.select().from(property);
  return <AllPropertiesPage initialProperties={properties} />;
}