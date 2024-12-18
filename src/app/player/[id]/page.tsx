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
    score?: number;
    country?: string;
    joined?: string;
}

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

        possibleNames.add(`${lastName}${firstInitial}`);
        if (year) {
            possibleNames.add(`${lastName}${firstInitial}${year}`);
            possibleNames.add(`${lastName}${firstInitial}${lastTwoDigitsYear}`);
        }
    }

    possibleNames.add(cleanedName.replace(/\s+/g, ''));

    return Array.from(possibleNames);
};

const evaluateProfile = (profile: any, playerCountry: string, playerBirthYear?: string) => {
    let score = 0;

    if (profile.country?.toLowerCase() === playerCountry.toLowerCase()) {
        score += 3;
    }

    if (playerBirthYear && profile.joined) {
        const joinYear = new Date(profile.joined).getFullYear();
        const birthYear = parseInt(playerBirthYear);

        if (joinYear < birthYear) {
            score -= 5;
        }
    }

    return score;
};

export default function PlayerPage() {
    const params = useParams();
    const [playerInfo, setPlayerInfo] = useState<PlayerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chesscomProfiles, setChesscomProfiles] = useState<ChesscomProfile[]>([]);
    const [showNotFound, setShowNotFound] = useState(false);

    const checkChesscomProfile = async (username: string) => {
        try {
            const response = await fetch(`/api/chess-com/check?username=${encodeURIComponent(username)}`);
            const data = await response.json();

            if (data.exists) {
                return {
                    exists: true,
                    country: data.country,
                    joined: data.joined
                };
            }

            return {exists: false};
        } catch (error) {
            console.error('Error checking Chess.com profile:', error);
            return {exists: false};
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
                setIsLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
                setIsLoading(false);
            }
        };

        fetchPlayerInfo();
    }, [params.id]);

    useEffect(() => {
        const checkChesscomAccounts = async () => {
            if (!playerInfo) return;

            const usernames = generatePossibleUsernames(playerInfo.name, playerInfo.birthday);
            setChesscomProfiles(usernames.map(username => ({
                username,
                exists: false,
                checking: true
            })));

            for (const username of usernames) {
                const profileData = await checkChesscomProfile(username);
                if (profileData.exists) {
                    const score = evaluateProfile(
                        profileData,
                        playerInfo.country,
                        playerInfo.birthday
                    );
                    setChesscomProfiles(prev =>
                        prev.map(profile =>
                            profile.username === username
                                ? {
                                    ...profile,
                                    exists: true,
                                    checking: false,
                                    score,
                                    country: profileData.country,
                                    joined: profileData.joined
                                }
                                : profile
                        )
                    );
                } else {
                    setChesscomProfiles(prev =>
                        prev.map(profile =>
                            profile.username === username
                                ? {...profile, exists: false, checking: false}
                                : profile
                        )
                    );
                }
            }
        };

        if (playerInfo) {
            checkChesscomAccounts();
        }
    }, [playerInfo]);

    if (isLoading) {
        return <div className="p-4 text-center">Loading player information...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!playerInfo) {
        return <div className="p-4">No player information found</div>;
    }

    const existingProfiles = chesscomProfiles.filter(profile => profile.exists && !profile.checking);
    const nonExistingProfiles = chesscomProfiles.filter(profile => !profile.exists && !profile.checking);

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
                    <h2 className="text-xl font-semibold mb-4">Chess.com Accounts</h2>

                    <div className="space-y-4">
                        <div className=" p-4 rounded-lg">
                            <p>Total Accounts Checked: {chesscomProfiles.filter(p => !p.checking).length}</p>
                            <p>Found Accounts: {existingProfiles.length}</p>
                            <p>Not Found: {nonExistingProfiles.length}</p>
                        </div>

                        {existingProfiles.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold">Found Accounts:</h3>
                                {existingProfiles.map((profile) => (
                                    <div
                                        key={profile.username}
                                        className="border border-green-500 p-3 rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{profile.username}</span>
                                            <span className="text-sm text-gray-500">
                                           {profile.country && `Country: ${profile.country.split('/').pop()}`}
                                       </span>
                                        </div>
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
                                                <path
                                                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                            </svg>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {nonExistingProfiles.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowNotFound(!showNotFound)}
                                    className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                                >
                                    {showNotFound ? 'Hide' : 'Show'} Non-Existing Accounts ({nonExistingProfiles.length})
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
                                        className={`transform transition-transform ${showNotFound ? 'rotate-180' : ''}`}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                                {showNotFound && (
                                    <div className="mt-2 space-y-2">
                                        {nonExistingProfiles.map((profile) => (
                                            <div
                                                key={profile.username}
                                                className="border border-gray-300 p-2 rounded-lg"
                                            >
                                                <span className="text-gray-600">{profile.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {chesscomProfiles.some(p => p.checking) && (
                            <div className="text-center text-gray-500 mt-4">
                                Checking more accounts...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
