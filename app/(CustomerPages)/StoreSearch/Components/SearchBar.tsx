import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search products...", 
  delay = 300,
  className = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Debounce search to avoid too many re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="ml-2 block w-full border-0 bg-transparent focus:outline-none focus:ring-0 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;