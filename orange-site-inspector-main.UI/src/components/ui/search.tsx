import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, History, TrendingUp } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { cn } from '@/lib/api/utils';

export interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { label: string; value: string }[];
}

export interface SearchSuggestion {
  id: string;
  label: string;
  type: 'recent' | 'trending' | 'suggestion';
  value: string;
}

interface AdvancedSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilter[]) => void;
  filters?: SearchFilter[];
  suggestions?: SearchSuggestion[];
  className?: string;
  showFilters?: boolean;
  showSuggestions?: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = "Search...",
  onSearch,
  filters = [],
  suggestions = [],
  className,
  showFilters = true,
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (searchTerm: string) => {
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      saveToHistory(query.trim());
      onSearch(query.trim(), activeFilters);
      setIsOpen(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Add filter
  const addFilter = (filter: SearchFilter) => {
    if (!activeFilters.find(f => f.id === filter.id)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Remove filter
  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  // Update filter value
  const updateFilter = (filterId: string, value: string) => {
    setActiveFilters(activeFilters.map(f => 
      f.id === filterId ? { ...f, value } : f
    ));
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    handleSearch();
  };

  // Handle history click
  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showFilters && filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={cn(
                "h-6 w-6 p-0",
                activeFilters.length > 0 && "text-blue-600"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center space-x-1"
            >
              <span>{filter.label}: {filter.value}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && showFilters && filters.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  {filter.type === 'select' && filter.options ? (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      onChange={(e) => updateFilter(filter.id, e.target.value)}
                      value={activeFilters.find(f => f.id === filter.id)?.value || ''}
                    >
                      <option value="">Select...</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      onChange={(e) => updateFilter(filter.id, e.target.value)}
                      value={activeFilters.find(f => f.id === filter.id)?.value || ''}
                    />
                  ) : (
                    <Input
                      placeholder={`Enter ${filter.label.toLowerCase()}`}
                      onChange={(e) => updateFilter(filter.id, e.target.value)}
                      value={activeFilters.find(f => f.id === filter.id)?.value || ''}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      {isOpen && showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <History className="h-4 w-4" />
                  <span>Recent Searches</span>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded-md text-sm"
                      onClick={() => handleHistoryClick(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Suggestions */}
            {suggestions.filter(s => s.type === 'trending').length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trending</span>
                </div>
                <div className="space-y-1">
                  {suggestions
                    .filter(s => s.type === 'trending')
                    .slice(0, 3)
                    .map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* General Suggestions */}
            {suggestions.filter(s => s.type === 'suggestion').length > 0 && (
              <div className="p-3">
                <div className="space-y-1">
                  {suggestions
                    .filter(s => s.type === 'suggestion')
                    .slice(0, 5)
                    .map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 