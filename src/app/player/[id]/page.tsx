// app/player/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from "next/link";

interface PlayerDetails {
    fideid: number;
    name: string;
    country: string;
    sex: string;
    title?: string;
    w_title?: string;
    o_title?: string;
    foa_title?: string;
    rating?: number;
    games?: number;
    k?: number;
    rapid_rating?: number;
    rapid_games?: number;
    rapid_k?: number;
    blitz_rating?: number;
    blitz_games?: number;
    blitz_k?: number;
    birthday?: string;
    flag?: string;
}

interface ChesscomProfile {
    username: string;
    exists: boolean;
    checking: boolean;
}

const generatePossibleUsernames = (name: string, birthday?: string | null) => {
    if (!name) return [];

    const names = name.toLowerCase().split(' ');
    const year = birthday && typeof birthday === 'string' ? birthday.substring(0, 4) : '';
    const lastTwoDigitsYear = year ? year.slice(2) : '';
    const possibleNames = new Set<string>();

    if (names.length >= 2) {
        const firstName = names[0];
        const lastName = names[names.length - 1];
        const firstInitial = firstName.charAt(0);
        const lastInitial = lastName.charAt(0);

        // Basic combinations
        possibleNames.add(`${firstName}${lastName}`);
        possibleNames.add(`${lastName}${firstName}`);
        possibleNames.add(`${firstName}_${lastName}`);
        possibleNames.add(`${lastName}_${firstName}`);
        possibleNames.add(`${firstName}.${lastName}`);
        possibleNames.add(`${lastName}.${firstName}`);
        possibleNames.add(`${firstInitial}${lastName}`);
        possibleNames.add(`${firstName}${lastInitial}`);
        possibleNames.add(`${firstInitial}_${lastName}`);
        possibleNames.add(`${firstName}_${lastInitial}`);
        possibleNames.add(`${firstInitial}.${lastName}`);
        possibleNames.add(`${firstName}.${lastInitial}`);

        // With year combinations
        if (year) {
            possibleNames.add(`${firstName}${lastName}${year}`);
            possibleNames.add(`${lastName}${firstName}${year}`);
            possibleNames.add(`${firstName}_${lastName}${year}`);
            possibleNames.add(`${lastName}_${firstName}${year}`);
            possibleNames.add(`${firstName}.${lastName}${year}`);
            possibleNames.add(`${lastName}.${firstName}${year}`);
            possibleNames.add(`${firstInitial}${lastName}${year}`);
            possibleNames.add(`${firstName}${lastInitial}${year}`);

            // With last two digits of year
            possibleNames.add(`${firstName}${lastName}${lastTwoDigitsYear}`);
            possibleNames.add(`${lastName}${firstName}${lastTwoDigitsYear}`);
            possibleNames.add(`${firstName}_${lastName}${lastTwoDigitsYear}`);
            possibleNames.add(`${lastName}_${firstName}${lastTwoDigitsYear}`);
            possibleNames.add(`${firstName}.${lastName}${lastTwoDigitsYear}`);
            possibleNames.add(`${lastName}.${firstName}${lastTwoDigitsYear}`);
            possibleNames.add(`${firstInitial}${lastName}${lastTwoDigitsYear}`);
            possibleNames.add(`${firstName}${lastInitial}${lastTwoDigitsYear}`);
        }

        // Number combinations
        for (let i = 1; i <= 5; i++) {
            possibleNames.add(`${firstName}${lastName}${i}`);
            possibleNames.add(`${lastName}${firstName}${i}`);
            possibleNames.add(`${firstName}_${lastName}${i}`);
            possibleNames.add(`${lastName}_${firstName}${i}`);
            possibleNames.add(`${firstInitial}${lastName}${i}`);
            possibleNames.add(`${firstName}${lastInitial}${i}`);
        }

        // Chess-related combinations
        const chessTerms = ['chess', 'player', 'master'];
        chessTerms.forEach(term => {
            possibleNames.add(`${firstName}${term}`);
            possibleNames.add(`${lastName}${term}`);
            possibleNames.add(`${term}${firstName}`);
            possibleNames.add(`${term}${lastName}`);
            possibleNames.add(`${firstName}${lastName}${term}`);
            possibleNames.add(`${term}${firstName}${lastName}`);
        });

        // Initial combinations
        possibleNames.add(`${firstInitial}${lastInitial}`);
        possibleNames.add(`${firstInitial}${lastInitial}${year}`);
        possibleNames.add(`${firstInitial}${lastInitial}${lastTwoDigitsYear}`);
        for (let i = 1; i <= 5; i++) {
            possibleNames.add(`${firstInitial}${lastInitial}${i}`);
        }

        // Reverse combinations
        possibleNames.add(`${lastName}${firstInitial}`);
        possibleNames.add(`${lastName}${firstInitial}${year}`);
        possibleNames.add(`${lastName}${firstInitial}${lastTwoDigitsYear}`);
    }

    // Full name without spaces
    possibleNames.add(name.toLowerCase().replace(/\s+/g, ''));

    // Convert Set back to array and return
    return Array.from(possibleNames);
};

export default function PlayerPage() {
    const params = useParams();
    const [playerInfo, setPlayerInfo] = useState<PlayerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chesscomProfiles, setChesscomProfiles] = useState<ChesscomProfile[]>([]);

    const checkChesscomProfile = async (username: string) => {
        try {
            const response = await fetch(`/api/chess-com/check?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking Chess.com profile:', error);
            return false;
        }
    };

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            if (!params.id) return;

            try {
                const response = await fetch(`/api/players/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch player information');
                }

                setPlayerInfo(data);

                const usernames = generatePossibleUsernames(data.name, data.birthday);
                setChesscomProfiles(usernames.map(username => ({
                    username,
                    exists: false,
                    checking: true
                })));

                for (const username of usernames) {
                    const exists = await checkChesscomProfile(username);
                    setChesscomProfiles(prev =>
                        prev.map(profile =>
                            profile.username === username
                                ? { ...profile, exists, checking: false }
                                : profile
                        )
                    );
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
                setIsLoading(false);
            }
        };

        fetchPlayerInfo();
    }, [params.id]);

    if (isLoading) {
        return <div className="p-4 text-center">Loading player information...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!playerInfo) {
        return <div className="p-4">No player information found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col items-center mb-6">
                <Image
                    src="https://ratings.fide.com/img/logo/fide-logo.svg"
                    alt="FIDE Logo"
                    width={200}
                    height={80}
                    className="mb-4"
                    priority
                />
                <Link
                    href={`https://ratings.fide.com/profile/${playerInfo.fideid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                    View FIDE Profile
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

            <h1 className="text-2xl font-bold mb-4">Player Profile : {playerInfo.fideid} </h1>
            <div className="backdrop-blur-lg bg-purple-900/2 shadow-md rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Name:</strong> {playerInfo.name}</p>
                        <p><strong>FIDE ID:</strong> {playerInfo.fideid}</p>
                        <p><strong>Country:</strong> {playerInfo.country}</p>
                        <p><strong>Sex:</strong> {playerInfo.sex}</p>
                        <p><strong>Birthday:</strong> {playerInfo.birthday || 'N/A'}</p>
                        <p><strong>Flag:</strong> {playerInfo.flag || 'N/A'}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Titles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {playerInfo.title && <p><strong>FIDE Title:</strong> {playerInfo.title}</p>}
                        {playerInfo.w_title && <p><strong>Women&apos;s Title:</strong> {playerInfo.w_title}</p>}
                        {playerInfo.o_title && <p><strong>Online Title:</strong> {playerInfo.o_title}</p>}
                        {playerInfo.foa_title && <p><strong>FOA Title:</strong> {playerInfo.foa_title}</p>}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Standard Rating</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Rating:</strong> {playerInfo.rating || 'N/A'}</p>
                        <p><strong>Games Played:</strong> {playerInfo.games || 'N/A'}</p>
                        <p><strong>K-factor:</strong> {playerInfo.k || 'N/A'}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Rapid Rating</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Rapid Rating:</strong> {playerInfo.rapid_rating || 'N/A'}</p>
                        <p><strong>Rapid Games:</strong> {playerInfo.rapid_games || 'N/A'}</p>
                        <p><strong>Rapid K-factor:</strong> {playerInfo.rapid_k || 'N/A'}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Blitz Rating</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Blitz Rating:</strong> {playerInfo.blitz_rating || 'N/A'}</p>
                        <p><strong>Blitz Games:</strong> {playerInfo.blitz_games || 'N/A'}</p>
                        <p><strong>Blitz K-factor:</strong> {playerInfo.blitz_k || 'N/A'}</p>
                    </div>
                </div>

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
                    <h2 className="text-xl font-semibold mb-4">Possible Chess.com Accounts</h2>
                    <div className="grid gap-3">
                        {chesscomProfiles.map((profile) => (
                            <div
                                key={profile.username}
                                className={`flex items-center justify-between border p-3 rounded-lg ${
                                    profile.checking
                                        ? 'bg-gray-100'
                                        : profile.exists
                                            ? 'bg-purple-950-50 border-green-600'
                                            : 'bg-purple-950-50 border-red-600'
                                }`}
                            >
                                <span className="font-medium">{profile.username}</span>
                                {profile.checking ? (
                                    <span className="text-gray-500">Checking...</span>
                                ) : profile.exists ? (
                                    <Link
                                        href={`https://www.chess.com/member/${profile.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800 flex items-center gap-2"
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
                                ) : (
                                    <span className="text-red-500">Account not found</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
