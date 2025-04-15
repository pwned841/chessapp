'use client';

import { useState } from "react";
import Player from "@/types/player";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";

export default function SearchBar() {
    const [input, setInput] = useState("");
    const [results, setResults] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const searchPlayers = async () => {
        if (!input.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const res = await fetch(`/api/players/search?q=${encodeURIComponent(input)}&exact=true`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while searching');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchPlayers();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchPlayers();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (hasSearched) {
            setHasSearched(false);
            setResults([]);
        }
    };

    const getFlagUrl = (countryCode: string) => {
        return `https://ratings.fide.com/svg/${countryCode.toUpperCase()}.svg`;
    };

    const shouldShowDropdown = results.length > 0 || error || isLoading || (hasSearched && !isLoading && input.trim());

    return (
        <div className="w-full max-w-sm min-w-[300px]">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute w-5 h-5 left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white placeholder:text-slate-400 text-slate-900 text-sm rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                            placeholder="Search players..."
                        />
                    </div>
                    <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Search'
                        )}
                    </Button>
                </div>

                {shouldShowDropdown && (
                    <div className="absolute w-full mt-1 rounded-lg border border-purple-300 shadow-lg z-50 bg-purple-950">
                        {error ? (
                            <p className="p-3 text-sm text-red-400">
                                {error}
                            </p>
                        ) : isLoading ? (
                            <p className="p-3 text-sm text-slate-300">Searching...</p>
                        ) : results.length > 0 ? (
                            <ul className="py-1 max-h-[400px] overflow-y-auto">
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
                        ) : hasSearched ? (
                            <div className="p-4 text-center">
                                <p className="text-sm text-slate-300 mb-2">
                                    No players found matching &quot;{input}&quot;
                                </p>
                                <p className="text-xs text-purple-400">
                                    Try using fewer characters or check for typos
                                </p>
                                <div className="mt-3 p-3 bg-purple-900/50 rounded-lg">
                                    <p className="text-xs text-slate-300">
                                        Search tips:
                                    </p>
                                    <ul className="text-xs text-purple-300 mt-1 space-y-1">
                                        <li>• Use last name only (e.g., &quot;Carlsen&quot;)</li>
                                        <li>• Check spelling carefully</li>
                                        <li>• Try using partial name</li>
                                    </ul>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </form>
        </div>
    );
}