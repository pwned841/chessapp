'use client';

import { useState, useCallback } from "react";
import { useDebounce } from 'use-debounce';
import Player from "@/types/player";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function SearchBar() {
    const [input, setInput] = useState("");
    const [debouncedInput, setDebouncedInput] = useState("");
    const [results, setResults] = useState([] as Player[]);

    const searchPlayers = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
    }, []);

    const [debounceSearch] = useDebounce(searchPlayers, 100);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setDebouncedInput(e.target.value);
        debounceSearch(e.target.value);
    };

    return (
        <div className="w-full max-w-sm min-w-[200px]">
            <div className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                     className="absolute w-5 h-5 top-1/2 -translate-y-1/2 left-2.5 text-slate-600">
                    <path fillRule="evenodd"
                          d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                          clipRule="evenodd"/>
                </svg>
                <input
                    value={input}
                    onChange={handleChange}
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-purple-500 focus:text-purple-500 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Ex : Carlsen, Magnus"
                />
            </div>
            <div className="w-full max-w-md mx-auto mt-4">
                {results.length > 0 ? (
                    <ul>
                        {results.map((player) => (
                            <li key={player.fideid} className="py-1">
                                <Link href={`/player/${player.fideid}`} className="flex items-center space-x-4 w-full hover:bg-gray-50 p-2 rounded-md transition-colors">
                                    <Avatar>
                                        <AvatarFallback>{player.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{player.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : debouncedInput ? <p className="text-center text-gray-500">No results found</p> : null}
            </div>
        </div>
    );
}
