'use client';

import { SearchIcon } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({ value, onChange, placeholder, autoFocus }: SearchInputProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--text-tertiary)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-9 pr-3 h-9 text-sm bg-[color:var(--surface-sunken)] rounded-md border border-transparent outline-none placeholder:text-[color:var(--text-quaternary)] focus:bg-[color:var(--surface)] focus:border-[color:var(--border)] focus:ring-2 focus:ring-[color:var(--ring)] transition-colors"
      />
    </div>
  );
}
