import { getDashboardData, getCustomerHistory, saveLead } from '../../api/leads/route';
import ClientLeadPage from './ClientLeadPage';

export default async function LeadManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.search || '';
  const selectedCustomerId = resolvedSearchParams.customerId || '';

  const { allCustomers, dueLeads } = await getDashboardData(searchQuery);
  
  const history = selectedCustomerId ? await getCustomerHistory(selectedCustomerId) : [];
  const selectedCustomer = allCustomers.find((c) => c.id === selectedCustomerId) || null;

  return (
    <ClientLeadPage
      allCustomers={allCustomers}
      dueLeads={dueLeads}
      selectedCustomerId={selectedCustomerId}
      selectedCustomer={selectedCustomer}
      history={history}
      searchQuery={searchQuery}
      saveLeadAction={saveLead}
    />
  );
}