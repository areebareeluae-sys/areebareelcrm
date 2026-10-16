import { db } from '@/db';
import { property } from '@/db/schema';
import AllPropertiesPage from './PropertyClientPage';

// Forces Next.js to treat this page as dynamic and fetch fresh data every time
export const dynamic = 'force-dynamic';

export default async function Page() {
  const properties = await db.select().from(property);
  return <AllPropertiesPage initialProperties={properties} />;
}