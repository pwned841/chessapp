// components/ChesscomSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";

interface ChesscomProfile {
    username: string;
    country?: string;
    joined?: string;
    exists: boolean;
}

interface ChesscomSearchProps {
    name: string;
    birthday?: string;
    country: string;
}

export function ChesscomSearch({ name, birthday, country }: ChesscomSearchProps) {
    const [profiles, setProfiles] = useState<Map<string, ChesscomProfile>>(new Map());
    const [stats, setStats] = useState({
        total: 0,
        found: 0,
        checked: 0
    });
    const [isSearching, setIsSearching] = useState(true);

    const generatePossibleUsernames = (name: string, birthday?: string | null) => {
        if (!name) return [];

        const cleanedName = name.toLowerCase().replace(/,/g, '');
        const names = cleanedName.split(' ');
        const year = birthday && typeof birthday === 'string' ? birthday.substring(0, 4) : '';
        const lastTwoDigitsYear = year ? year.slice(2) : '';
        const possibleNames = new Set<string>();

        if (names.length >= 2) {
            const firstName = names[0];
            const lastName = names[names.length - 1];
            const firstInitial = firstName.charAt(0);
            const lastInitial = lastName.charAt(0);

            possibleNames.add(`${firstName}${lastName}`);
            possibleNames.add(`${lastName}${firstName}`);
            possibleNames.add(`${firstName}_${lastName}`);
            possibleNames.add(`${lastName}_${firstName}`);
            possibleNames.add(`${firstName}.${lastName}`);
            possibleNames.add(`${lastName}.${firstName}`);

            for (let i = 1; i <= 9; i++) {
                possibleNames.add(`${firstName}.${lastName}${i}`);
                possibleNames.add(`${lastName}.${firstName}${i}`);
            }

            possibleNames.add(`${firstInitial}${lastName}`);
            possibleNames.add(`${firstName}${lastInitial}`);
            possibleNames.add(`${firstInitial}_${lastName}`);
            possibleNames.add(`${firstName}_${lastInitial}`);
            possibleNames.add(`${firstInitial}.${lastName}`);
            possibleNames.add(`${firstName}.${lastInitial}`);

            if (year) {
                possibleNames.add(`${firstName}${year}`);
                possibleNames.add(`${lastName}${year}`);
                possibleNames.add(`${firstName}${lastName}${year}`);
                possibleNames.add(`${lastName}${firstName}${year}`);
                possibleNames.add(`${firstName}_${lastName}${year}`);
                possibleNames.add(`${lastName}_${firstName}${year}`);
                possibleNames.add(`${firstName}.${lastName}${year}`);
                possibleNames.add(`${lastName}.${firstName}${year}`);

                possibleNames.add(`${firstName}${lastTwoDigitsYear}`);
                possibleNames.add(`${lastName}${lastTwoDigitsYear}`);
                possibleNames.add(`${firstName}${lastName}${lastTwoDigitsYear}`);
                possibleNames.add(`${lastName}${firstName}${lastTwoDigitsYear}`);
                possibleNames.add(`${firstName}_${lastName}${lastTwoDigitsYear}`);
                possibleNames.add(`${lastName}_${firstName}${lastTwoDigitsYear}`);
                possibleNames.add(`${firstName}.${lastName}${lastTwoDigitsYear}`);
                possibleNames.add(`${lastName}.${firstName}${lastTwoDigitsYear}`);
            }

            for (let i = 1; i <= 9; i++) {
                possibleNames.add(`${firstName}${lastName}${i}`);
                possibleNames.add(`${lastName}${firstName}${i}`);
                possibleNames.add(`${firstName}_${lastName}${i}`);
                possibleNames.add(`${lastName}_${firstName}${i}`);
                possibleNames.add(`${firstInitial}${lastName}${i}`);
                possibleNames.add(`${firstName}${lastInitial}${i}`);
            }
        }

        possibleNames.add(cleanedName.replace(/\s+/g, ''));

        return Array.from(possibleNames);
    };

    const checkUsername = async (username: string) => {
        try {
            const response = await fetch(`https://api.chess.com/pub/player/${username}`);
            if (response.ok) {
                const data = await response.json();
                return {
                    username,
                    exists: true,
                    country: data.country,
                    joined: data.joined
                };
            }
            return { username, exists: false };
        } catch {
            return { username, exists: false };
        }
    };

    useEffect(() => {
        let isMounted = true;
        const usernames = generatePossibleUsernames(name, birthday);

        const checkProfiles = async () => {
            setStats({ total: usernames.length, found: 0, checked: 0 });
            setProfiles(new Map());

            for (const username of usernames) {
                if (!isMounted) break;

                const result = await checkUsername(username);

                if (isMounted) {
                    setStats(prev => ({
                        ...prev,
                        checked: prev.checked + 1,
                        found: result.exists ? prev.found + 1 : prev.found
                    }));

                    if (result.exists) {
                        setProfiles(prev => {
                            const newMap = new Map(prev);
                            newMap.set(username, result);
                            return newMap;
                        });
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (isMounted) {
                setIsSearching(false);
            }
        };

        checkProfiles();

        return () => {
            isMounted = false;
        };
    }, [name, birthday]);

    const sortedProfiles = Array.from(profiles.values()).sort((a, b) =>
        a.username.localeCompare(b.username)
    );

    return (
        <div className="mt-8 border-t pt-6">
            <div className="flex flex-col items-center mb-6">
                <Image
                    src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpZA7QOK.png"
                    alt="Chess.com Logo"
                    width={200}
                    height={80}
                    className="mb-4"
                    priority
                />
            </div>

            <div className="bg-purple-900 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-white">Total</p>
                        <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white">Found</p>
                        <p className="text-xl font-bold text-green-600">{profiles.size}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white">Progress</p>
                        <p className="text-xl font-bold text-blue-600">{stats.checked}/{stats.total}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {sortedProfiles.map((profile) => (
                    <div
                        key={profile.username}
                        className="border border-purple-500 p-3 rounded-lg flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{profile.username}</span>
                            {profile.country && (
                                <span className="text-sm text-gray-500">
                                Country: {profile.country.split('/').pop()}
                            </span>
                            )}
                        </div>
                        <Link
                            href={`https://www.chess.com/member/${profile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
                        >
                            View Profile
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </Link>
                    </div>
                ))}

                {isSearching && (
                    <div className="text-center text-gray-500">
                        Checking profiles... ({stats.checked}/{stats.total})
                    </div>
                )}
            </div>
        </div>
    );
}
