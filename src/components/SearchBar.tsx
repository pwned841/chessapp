'use client';

import { useState, useCallback } from "react";
import { useDebounce } from 'use-debounce';
import Player from "@/types/player";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function SearchBar() {
    const [input, setInput] = useState("");
    const [results, setResults] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchPlayers = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while searching');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const [debouncedSearch] = useDebounce(searchPlayers, 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
        debouncedSearch(value);
    };

    const getFlagUrl = (countryCode: string) => {
        return `https://ratings.fide.com/svg/${countryCode.toUpperCase()}.svg`;
    };

    return (
        <div className="w-full max-w-sm min-w-[300px]">
            <div className="relative">
                <div className="relative flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="absolute w-5 h-5 left-3 text-slate-400"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <input
                        type="text"
                        value={input}
                        onChange={handleChange}
                        className="w-full bg-transparent placeholder:text-slate-400 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        placeholder="Search players (min. 2 characters)"
                    />
                </div>

                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                )}

                {/* Results dropdown */}
                {(results.length > 0 || error || isLoading) && (
                    <div className="absolute w-full mt-1 rounded-lg border border-purple-300 shadow-lg z-50 bg-purple-950">
                        {error ? (
                            <p className="p-3 text-sm text-red-400">
                                {error}
                            </p>
                        ) : isLoading ? (
                            <p className="p-3 text-sm text-slate-300">Searching...</p>
                        ) : results.length > 0 ? (
                            <ul className="py-1">
                                {results.map((player) => (
                                    <li key={player.fideid}>
                                        <Link
                                            href={`/player/${player.fideid}`}
                                            className="flex items-center px-4 py-2 hover:bg-purple-800 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8 mr-3">
                                                <AvatarFallback className="bg-purple-800 text-purple-100 text-xs">
                                                    {player.name?.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-white">
                                                        {player.name}
                                                    </span>
                                                    {player.country && (
                                                        <Image
                                                            src={getFlagUrl(player.country)}
                                                            alt={`${player.country} flag`}
                                                            width={24}
                                                            height={16}
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-300">
                                                    {player.title && `${player.title} • `}
                                                    {player.rating && `Rating: ${player.rating}`}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : input.length >= 2 ? (
                            <p className="p-3 text-sm text-slate-300">No results found</p>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}