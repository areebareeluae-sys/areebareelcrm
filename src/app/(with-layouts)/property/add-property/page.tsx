import { getProperties, getCustomersForModal } from '../../../api/property/route';
import PropertyClientPage from './PropertyClientPage';

export default async function PropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.search || '';

  const properties = await getProperties(searchQuery);
  const customers = await getCustomersForModal();

  return (
    <PropertyClientPage 
      initialProperties={properties || []} 
      customers={customers || []} 
      initialSearch={searchQuery}
    />
  );
}