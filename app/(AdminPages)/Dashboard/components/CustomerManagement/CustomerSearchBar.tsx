import { ICustomer } from '@/app/models/Customer';
import { searchCustomers } from '@/utils/searchUtils/searchCustomers';
import { useEffect } from 'react';

interface CustomerSearchBarProps {
  customers: ICustomer[];
  onSearchResults: (filteredCustomers: ICustomer[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  customers,
  onSearchResults,
  searchQuery,
  setSearchQuery,
}) => {
  // Process search whenever query or customers change
  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    const filtered = searchCustomers(customers, normalizedQuery);
    onSearchResults(filtered);
  }, [searchQuery, customers, onSearchResults]);

  // Handle input changes with better space handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedQuery = e.target.value.replace(/\s+/g, ' ');
    setSearchQuery(sanitizedQuery);
  };

  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by name or email"
        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={searchQuery}
        onChange={handleInputChange}
        autoComplete="off"
      />
    </div>
  );
};

export default CustomerSearchBar;