"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchUsers } from "@/server/actions/search.actions";

type SearchResult = {
  username: string;
  name: string | null;
  image: string | null;
  _count: {
    followers: number;
  };
};

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatFollowers(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M followers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K followers`;
  return `${count} followers`;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(query.trim());
        setResults(data);
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  function handleSelectUser(username: string) {
    onOpenChange(false);
    router.push(`/profile/${username}`);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md max-h-[80vh] flex flex-col gap-0 p-0"
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-medium">Search</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative px-4 py-3">
          <Search
            size={16}
            className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="pl-9 pr-9 bg-gray-50 border-gray-200"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClear}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </Button>
          )}
        </div>

        <Separator />

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : !hasSearched ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Search for users</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {results.map((user) => (
                <Button
                  key={user.username}
                  variant="ghost"
                  onClick={() => handleSelectUser(user.username)}
                  className="w-full justify-start gap-3 px-3 py-3 h-auto rounded-lg cursor-pointer"
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-sm bg-muted">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user.username}
                    </span>
                    {user.name && (
                      <span className="text-xs text-muted-foreground truncate">
                        {user.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatFollowers(user._count.followers)}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}