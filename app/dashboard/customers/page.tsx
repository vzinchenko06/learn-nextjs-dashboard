import CustomersTable from '@/app/ui/customers/table'
import { Metadata } from 'next'
import { lusitana } from '@/app/ui/fonts'
import Search from '@/app/ui/search'
import { Suspense } from 'react'
import { TableSkeleton } from '@/app/ui/dashboard/skeletons'

export const metadata: Metadata = {
  title: 'Customers',
}

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

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Customers
      </h1>
      <div className="mt-4">
        <Search placeholder="Search customers..."/>
      </div>
      <Suspense fallback={<TableSkeleton cols={[
        'Name',
        'Email',
        'Total Invoices',
        'Total Pending',
        'Total Paid']}/>}>
        <CustomersTable query={query}/>
      </Suspense>
    </div>
  )
}
