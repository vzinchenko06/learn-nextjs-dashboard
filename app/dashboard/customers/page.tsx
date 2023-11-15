import { fetchFilteredCustomers } from '@/app/lib/data'
import CustomersTable from '@/app/ui/customers/table'

type PageProps = {
  searchParams?: {
    query?: string;
    page?: string;
  };
}
export default async function Page ({
  searchParams,
}: PageProps) {
  const query = searchParams?.query || ''
  const customers = await fetchFilteredCustomers(query)

  return (
    <CustomersTable customers={customers}/>
  )
}
