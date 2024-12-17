// app/components/SearchBar.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Player from "@/types/player";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function SearchBar() {
    const [input, setInput] = useState("");
    const [message, setMessage] = useState("");
    const [results, setResults] = useState([] as Player[]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setMessage(""); // Clear previous messages
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(input)}`);
        const data = await res.json();
        const results = data.results;

        if (results.length > 0) {
            console.log(results)
            setResults(results);
        } else {
            // No results found, show a message
            setMessage("No results found.");
        }
        setLoading(false);
    }

    return (
        <div className="w-full max-w-sm min-w-[200px]">
            <div className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 24 24"
                     fill="currentColor"
                     className="absolute w-5 h-5 top-2.5 left-2.5 text-slate-600"
                >
                    <path fillRule="evenodd"
                          d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                          clipRule="evenodd"/>
                </svg>

                <input
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-purple-500 focus:text-purple-500 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Ex : Magnus Carlsen"
                    value={input}
                />

                <button
                    className="rounded-md bg-purple-950 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:bg-purple-950 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2 opacity-90 hover:opacity-100"
                    type="button"
                    onClick={handleSearch}
                    disabled={!input} // disable if input is empty
                >
                    {  loading && (
                        <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                    Search
                </button>


                {message && (
                    <p className="text-red-500 text-sm mt-2">
                        {message}
                    </p>
                )}


            </div>
            {results.length > 0 && (
                <div className="w-full max-w-md mx-auto mt-14">
                    <ul>
                        {results.map((user) => (
                            <li key={user.fideid} className="py-1" >
                                <Link href={`/player/` + user.fideid} className="flex items-center space-x-4 w-full">
                                    <Avatar>
                                        <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.name}</span>
                                </Link>
                            </li>

                        ))}
                    </ul>
                </div>

            )}
        </div>
    );
}
