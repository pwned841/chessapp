'use client';

import { useState, useEffect } from "react";
import Player from "@/types/player";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Search, ExternalLink } from "lucide-react";

interface OnlinePlatformResult {
    exists: boolean;
    username?: string;
    url?: string;
    avatar?: string | null;
    title?: string | null;
    lastOnline?: string | null;
    lastSeen?: string | null;
}

interface PlayerExistsResponse {
    chesscom: OnlinePlatformResult;
    lichess: OnlinePlatformResult;
}

export default function SearchBar() {
    const [input, setInput] = useState("");
    const [results, setResults] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [onlinePlatforms, setOnlinePlatforms] = useState<PlayerExistsResponse | null>(null);
    const [isCheckingPlatforms, setIsCheckingPlatforms] = useState(false);

    // Function to search for players in FIDE database
    const searchPlayers = async () => {
        if (!input.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setOnlinePlatforms(null);

        try {
            const res = await fetch(`/api/players/search?query=${encodeURIComponent(input)}&exact=true`);
            const data = await res.json();
            setResults(data.players || []);
            
            // If no FIDE players found, check online platforms
            if (!data.players || data.players.length === 0) {
                checkOnlinePlatforms(input);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while searching');
            setResults([]);
            
            // Try checking online platforms even if there was an error with FIDE
            checkOnlinePlatforms(input);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to check if player exists on Chess.com and Lichess
    const checkOnlinePlatforms = async (username: string) => {
        setIsCheckingPlatforms(true);
        try {
            const response = await fetch(`/api/player-exists?username=${encodeURIComponent(username)}`);
            if (response.ok) {
                const data = await response.json();
                setOnlinePlatforms(data);
            }
        } catch (err) {
            console.error('Error checking online platforms:', err);
        } finally {
            setIsCheckingPlatforms(false);
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
            setOnlinePlatforms(null);
        }
    };

    const getFlagUrl = (countryCode: string) => {
        return `https://ratings.fide.com/svg/${countryCode.toUpperCase()}.svg`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
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
                                
                                {/* Online platform results */}
                                {(isCheckingPlatforms || onlinePlatforms) && (
                                    <div className="mt-4 border-t border-purple-800 pt-4">
                                        <p className="text-sm text-slate-300 mb-3">
                                            {isCheckingPlatforms 
                                                ? "Checking online chess platforms..." 
                                                : "Player not found in FIDE database. Results from online platforms:"}
                                        </p>
                                        
                                        {isCheckingPlatforms ? (
                                            <div className="flex justify-center items-center py-3">
                                                <Loader2 className="animate-spin h-5 w-5 mr-2 text-slate-300" />
                                                <span className="text-xs text-slate-300">Searching online platforms...</span>
                                            </div>
                                        ) : onlinePlatforms && (
                                            <div className="grid grid-cols-1 gap-3 mt-3">
                                                {/* Chess.com results */}
                                                <div className={`p-3 rounded-lg ${onlinePlatforms.chesscom.exists 
                                                    ? "bg-blue-900/40 border border-blue-700" 
                                                    : "bg-gray-800 border border-gray-700"}`}
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <Image src="/chesscom.png" alt="Chess.com" width={64} height={32} className="mr-2" />
                                                    </div>
                                                    
                                                    {onlinePlatforms.chesscom.exists ? (
                                                        <div>
                                                            <p className="text-xs text-green-400 mb-2">Account found !</p>
                                                            <div className="flex items-center mb-2">
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-white font-semibold">
                                                                        {onlinePlatforms.chesscom.username}
                                                                    </p>
                                                                    {onlinePlatforms.chesscom.lastOnline && (
                                                                        <p className="text-xs text-slate-400">
                                                                            Last online: {formatDate(onlinePlatforms.chesscom.lastOnline)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <a 
                                                                    href={onlinePlatforms.chesscom.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center"
                                                                >
                                                                    Visit
                                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400">No account found</p>
                                                    )}
                                                </div>

                                                {/* Lichess results */}
                                                <div className={`p-3 rounded-lg ${onlinePlatforms.lichess.exists 
                                                    ? "bg-green-900/40 border border-green-700" 
                                                    : "bg-gray-800 border border-gray-700"}`}
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <Image src="/lichessorg.png" alt="Lichess.org" width={64} height={32} className="mr-2" />
                                                        <h3 className="text-sm font-medium text-slate-200">Lichess.org</h3>
                                                    </div>
                                                    
                                                    {onlinePlatforms.lichess.exists ? (
                                                        <div>
                                                            <p className="text-xs text-green-400 mb-2">Account found!</p>
                                                            <div className="flex items-center mb-2">
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-white font-semibold">
                                                                        {onlinePlatforms.lichess.title && (
                                                                            <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 text-xs mr-1 rounded">
                                                                                {onlinePlatforms.lichess.title}
                                                                            </span>
                                                                        )}
                                                                        {onlinePlatforms.lichess.username}
                                                                    </p>
                                                                    {onlinePlatforms.lichess.lastSeen && (
                                                                        <p className="text-xs text-slate-400">
                                                                            Last seen: {formatDate(onlinePlatforms.lichess.lastSeen)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <a 
                                                                    href={onlinePlatforms.lichess.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center"
                                                                >
                                                                    Visit
                                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400">No account found</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
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