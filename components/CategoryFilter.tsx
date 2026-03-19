'use client';

import { X } from 'lucide-react';

interface FilterTag {
  name: string;
  genre: string | null;
  color: string;
}

interface CategoryFilterProps {
  filters: FilterTag[];
  activeFilters?: string[];
  onFilterChange?: (filter: string) => void;
  onReset?: () => void;
}

export default function CategoryFilter({
  filters,
  activeFilters = [],
  onFilterChange,
  onReset,
}: CategoryFilterProps) {
  const hasActive = activeFilters.length > 0;

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-6 border-b border-white/5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => onFilterChange?.(filter.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                activeFilters.includes(filter.name)
                  ? `${filter.color} ring-2 ring-offset-2 ring-offset-black`
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {hasActive && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
          >
            <X className="w-4 h-4" />
            Очистити
          </button>
        )}
      </div>
    </div>
  );
}
