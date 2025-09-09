import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Pesquise por músicas, artistas ou álbuns..." 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-text-muted" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-12 bg-app-surface border-app-surface-hover text-app-text-primary placeholder:text-app-text-muted focus:ring-app-accent focus:border-app-accent h-12 text-lg"
        />
      </div>
      <Button 
        type="submit" 
        variant="play" 
        className="h-12 px-8 text-lg font-semibold"
        disabled={!query.trim()}
      >
        Buscar
      </Button>
    </form>
  );
};