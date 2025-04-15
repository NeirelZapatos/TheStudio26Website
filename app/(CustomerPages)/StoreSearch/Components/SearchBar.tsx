import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  value: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search products...",
  delay = 300,
  className = "",
  value,
}) => {
  // Local state for immediate UI updates
  const [localSearchTerm, setLocalSearchTerm] = useState(value);
  
  // Sync local state with parent value when it changes externally
  useEffect(() => {
    setLocalSearchTerm(value);
  }, [value]);
  
  // Debounce the search term updates to parent
  useEffect(() => {
    // Skip the effect if we're just initializing or syncing with parent
    if (localSearchTerm === value) return;
    
    const handler = setTimeout(() => {
      onSearch(localSearchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, delay, onSearch, value]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="ml-2 block w-full border-0 bg-transparent focus:outline-none focus:ring-0 sm:text-sm"
        />
        {localSearchTerm && (
          <button
            onClick={() => {
              setLocalSearchTerm("");
              onSearch("");
            }}
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