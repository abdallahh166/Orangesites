import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, ChevronDown, MapPin, FileText, Users, Settings, Plus } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'site' | 'visit' | 'report' | 'user' | 'setting';
  url: string;
  icon: React.ReactNode;
  tags?: string[];
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

const searchTypes = [
  { key: 'site', label: 'Sites', icon: MapPin },
  { key: 'visit', label: 'Visits', icon: FileText },
  { key: 'report', label: 'Reports', icon: FileText },
  { key: 'user', label: 'Users', icon: Users },
  { key: 'setting', label: 'Settings', icon: Settings },
];

export function GlobalSearch({ className, placeholder = "Search sites, visits, reports..." }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock search results - in real app, this would be API calls
  const mockSearch = async (searchQuery: string, types: string[]): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allResults: SearchResult[] = [
      {
        id: '1',
        title: 'Site Alpha',
        description: 'Main distribution center in Cairo',
        type: 'site',
        url: '/sites/1',
        icon: <MapPin className="h-4 w-4" />,
        tags: ['Cairo', 'Distribution']
      },
      {
        id: '2',
        title: 'Visit Report #2024-001',
        description: 'Monthly inspection completed on Jan 15, 2024',
        type: 'visit',
        url: '/visits/2024-001',
        icon: <FileText className="h-4 w-4" />,
        tags: ['Completed', 'January']
      },
      {
        id: '3',
        title: 'System Health Report',
        description: 'Weekly system performance analysis',
        type: 'report',
        url: '/reports/health',
        icon: <FileText className="h-4 w-4" />,
        tags: ['Weekly', 'Performance']
      },
      {
        id: '4',
        title: 'User Management',
        description: 'Manage user accounts and permissions',
        type: 'setting',
        url: '/settings/users',
        icon: <Settings className="h-4 w-4" />,
        tags: ['Admin', 'Permissions']
      }
    ];

    return allResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = types.length === 0 || types.includes(result.type);
      
      return matchesQuery && matchesType;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      mockSearch(query, selectedTypes).then(results => {
        setResults(results);
        setLoading(false);
      });
    } else {
      setResults([]);
    }
  }, [query, selectedTypes]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (query.length >= 2 || selectedTypes.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            {/* Filter Types */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTypes.map(({ key, label, icon: Icon }) => (
                  <Badge
                    key={key}
                    variant={selectedTypes.includes(key) ? 'default' : 'outline'}
                    className={`cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 ${
                      selectedTypes.includes(key) ? 'bg-orange-600 text-white' : ''
                    }`}
                    onClick={() => toggleType(key)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      index === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          {result.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {result.description}
                        </p>
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : query.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              ) : null}
            </div>

            {/* Quick Actions */}
            {results.length === 0 && query.length === 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick actions:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/add-visit')}
                    className="justify-start text-left h-auto p-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <div>
                      <div className="text-sm font-medium">New Visit</div>
                      <div className="text-xs text-gray-500">Create inspection</div>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/sites')}
                    className="justify-start text-left h-auto p-2"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <div>
                      <div className="text-sm font-medium">View Sites</div>
                      <div className="text-xs text-gray-500">Browse locations</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 