// app/player/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FIDEInfo } from '@/components/FIDEInfo';
import { ChesscomSearch } from '@/components/ChesscomSearch';
import { LichessSearch } from '@/components/LichessSearch';
import Image from 'next/image';
import { Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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

interface OnlinePlatformResult {
    exists: boolean;
    username?: string;
    url?: string;
    avatar?: string | null;
    title?: string | null;
    lastOnline?: string | null;
    lastSeen?: string | null;
    online?: boolean;
}

interface PlayerExistsResponse {
    chesscom: OnlinePlatformResult;
    lichess: OnlinePlatformResult;
}

// Map player IDs for quick access to prominent players
const playerIdMap = {
    'carlsen-magnus': '1503014',
    'nakamura-hikaru': '2016192',
    'gukesh-d': '46616543',
    'erigaisi-arjun': '35009192',
    'caruana-fabiano': '2020009',
    'abdusattorov-nodirbek': '14204118',
    'praggnanandhaa-r': '25059530',
    'wei-yi': '8603405',
    'nepomniachtchi-ian': '4168119',
    'firouzja-alireza': '12573981'
};

export default function PlayerPage() {
    const params = useParams();
    const [playerInfo, setPlayerInfo] = useState<PlayerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [onlinePlatforms, setOnlinePlatforms] = useState<PlayerExistsResponse | null>(null);
    const [isCheckingPlatforms, setIsCheckingPlatforms] = useState(false);

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            if (!params?.id) return;
            
            // Check if the ID is one of our mapped prominent players
            let playerId = params.id as string;
            if (playerIdMap[playerId.toLowerCase()]) {
                playerId = playerIdMap[playerId.toLowerCase()];
            }

            try {
                const response = await fetch(`/api/players/${playerId}`);
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
                
                // If player not found in FIDE, check online platforms
                checkOnlinePlatforms(params.id as string);
            }
        };

        fetchPlayerInfo();
    }, [params?.id]);

    const checkOnlinePlatforms = async (username: string) => {
        setIsCheckingPlatforms(true);
        try {
            // Clean up the username (remove hyphens that might be in the URL)
            const cleanUsername = username.toString().replace(/-/g, ' ');
            const response = await fetch(`/api/player-exists?username=${encodeURIComponent(cleanUsername)}`);
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative h-24 w-24">
                    <Image
                        src="/chess-knight.svg"
                        alt="Loading..."
                        fill
                        className="animate-pulse"
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>

                {/* Results from online platforms */}
                <div className="mt-8 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-4">Check on other platforms</h2>
                    <p className="text-gray-600 mb-6">
                        No player found in FIDE database with this ID. Checking online chess platforms:
                    </p>

                    {isCheckingPlatforms ? (
                        <div className="flex justify-center items-center py-6">
                            <Loader2 className="animate-spin h-6 w-6 mr-2 text-purple-600" />
                            <span className="text-gray-600">Searching online platforms...</span>
                        </div>
                    ) : onlinePlatforms ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Chess.com result card */}
                            <div className={`rounded-xl shadow-lg overflow-hidden ${
                                onlinePlatforms.chesscom.exists 
                                ? "border-2 border-blue-500" 
                                : "border border-gray-200"
                            }`}>
                                <div className="bg-blue-500 p-4">
                                    <div className="flex items-center space-x-2">
                                        <Image src="/chesscom.png" alt="Chess.com" width={36} height={36} />
                                        <h3 className="text-lg font-bold text-white">Chess.com</h3>
                                    </div>
                                </div>
                                <div className="p-6 bg-white">
                                    {onlinePlatforms.chesscom.exists ? (
                                        <div>
                                            <p className="text-green-600 font-medium mb-3">
                                                ✓ Account found!
                                            </p>
                                            <div className="mb-4">
                                                <p className="font-semibold text-gray-800 text-lg">
                                                    {onlinePlatforms.chesscom.title && (
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-sm mr-2">
                                                            {onlinePlatforms.chesscom.title}
                                                        </span>
                                                    )}
                                                    {onlinePlatforms.chesscom.username}
                                                </p>
                                                {onlinePlatforms.chesscom.lastOnline && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Last online: {formatDate(onlinePlatforms.chesscom.lastOnline)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex justify-center">
                                                <a 
                                                    href={onlinePlatforms.chesscom.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                                                >
                                                    View profile on Chess.com
                                                    <ExternalLink className="h-4 w-4 ml-2" />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500">No account found on Chess.com</p>
                                            <a 
                                                href={`https://www.chess.com/members?q=${encodeURIComponent(params.id as string)}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                            >
                                                Search on Chess.com
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lichess.org result card */}
                            <div className={`rounded-xl shadow-lg overflow-hidden ${
                                onlinePlatforms.lichess.exists 
                                ? "border-2 border-green-500" 
                                : "border border-gray-200"
                            }`}>
                                <div className="bg-green-500 p-4">
                                    <div className="flex items-center space-x-2">
                                        <Image src="/lichessorg.png" alt="Lichess.org" width={36} height={36} />
                                        <h3 className="text-lg font-bold text-white">Lichess.org</h3>
                                    </div>
                                </div>
                                <div className="p-6 bg-white">
                                    {onlinePlatforms.lichess.exists ? (
                                        <div>
                                            <p className="text-green-600 font-medium mb-3">
                                                ✓ Account found!
                                            </p>
                                            <div className="mb-4">
                                                <p className="font-semibold text-gray-800 text-lg">
                                                    {onlinePlatforms.lichess.title && (
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-sm mr-2">
                                                            {onlinePlatforms.lichess.title}
                                                        </span>
                                                    )}
                                                    {onlinePlatforms.lichess.username}
                                                </p>
                                                {onlinePlatforms.lichess.lastSeen && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Last seen: {formatDate(onlinePlatforms.lichess.lastSeen)}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Status: {onlinePlatforms.lichess.online ? (
                                                        <span className="text-green-600 font-medium">Online now</span>
                                                    ) : (
                                                        <span className="text-gray-500">Offline</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex justify-center">
                                                <a 
                                                    href={onlinePlatforms.lichess.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                                                >
                                                    View profile on Lichess.org
                                                    <ExternalLink className="h-4 w-4 ml-2" />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500">No account found on Lichess.org</p>
                                            <a 
                                                href={`https://lichess.org/@/${(params.id as string).replace(/\s+/g, '')}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-green-600 hover:underline mt-2 inline-block"
                                            >
                                                Search on Lichess.org
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-xl p-6">
                                <ChesscomSearch 
                                    name={(params.id ?? '').toString().replace(/-/g, ' ')} 
                                    birthday=""
                                    country=""
                                />
                            </div>
                            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-xl p-6">
                                <LichessSearch 
                                    name={(params.id ?? '').toString().replace(/-/g, ' ')}
                                    birthday=""
                                    country=""
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link 
                        href="/player-search" 
                        className="text-purple-600 hover:text-purple-800"
                    >
                        Return to player search
                    </Link>
                </div>
            </div>
        );
    }

    if (!playerInfo) {
        return (
            <div className="container mx-auto p-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow">
                    <p className="font-bold">No data found</p>
                    <p>No player information found for this ID</p>
                </div>
                
                {/* Results from online platforms - same as above */}
                <div className="mt-8 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-4">Check on other platforms</h2>
                    <p className="text-gray-600 mb-6">
                        No player found in FIDE database with this ID. Checking online chess platforms:
                    </p>

                    {isCheckingPlatforms ? (
                        <div className="flex justify-center items-center py-6">
                            <Loader2 className="animate-spin h-6 w-6 mr-2 text-purple-600" />
                            <span className="text-gray-600">Searching online platforms...</span>
                        </div>
                    ) : onlinePlatforms ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Chess.com result card - same as above */}
                            <div className={`rounded-xl shadow-lg overflow-hidden ${
                                onlinePlatforms.chesscom.exists 
                                ? "border-2 border-blue-500" 
                                : "border border-gray-200"
                            }`}>
                                <div className="bg-blue-500 p-4">
                                    <div className="flex items-center space-x-2">
                                        <Image src="/chesscom.png" alt="Chess.com" width={36} height={36} />
                                        <h3 className="text-lg font-bold text-white">Chess.com</h3>
                                    </div>
                                </div>
                                <div className="p-6 bg-white">
                                    {onlinePlatforms.chesscom.exists ? (
                                        <div>
                                            <p className="text-green-600 font-medium mb-3">
                                                ✓ Account found!
                                            </p>
                                            <div className="mb-4">
                                                <p className="font-semibold text-gray-800 text-lg">
                                                    {onlinePlatforms.chesscom.title && (
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-sm mr-2">
                                                            {onlinePlatforms.chesscom.title}
                                                        </span>
                                                    )}
                                                    {onlinePlatforms.chesscom.username}
                                                </p>
                                                {onlinePlatforms.chesscom.lastOnline && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Last online: {formatDate(onlinePlatforms.chesscom.lastOnline)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex justify-center">
                                                <a 
                                                    href={onlinePlatforms.chesscom.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                                                >
                                                    View profile on Chess.com
                                                    <ExternalLink className="h-4 w-4 ml-2" />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500">No account found on Chess.com</p>
                                            <a 
                                                href={`https://www.chess.com/members?q=${encodeURIComponent(params.id as string)}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                            >
                                                Search on Chess.com
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lichess.org result card - same as above */}
                            <div className={`rounded-xl shadow-lg overflow-hidden ${
                                onlinePlatforms.lichess.exists 
                                ? "border-2 border-green-500" 
                                : "border border-gray-200"
                            }`}>
                                <div className="bg-green-500 p-4">
                                    <div className="flex items-center space-x-2">
                                        <Image src="/lichessorg.png" alt="Lichess.org" width={36} height={36} />
                                        <h3 className="text-lg font-bold text-white">Lichess.org</h3>
                                    </div>
                                </div>
                                <div className="p-6 bg-white">
                                    {onlinePlatforms.lichess.exists ? (
                                        <div>
                                            <p className="text-green-600 font-medium mb-3">
                                                ✓ Account found!
                                            </p>
                                            <div className="mb-4">
                                                <p className="font-semibold text-gray-800 text-lg">
                                                    {onlinePlatforms.lichess.title && (
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-sm mr-2">
                                                            {onlinePlatforms.lichess.title}
                                                        </span>
                                                    )}
                                                    {onlinePlatforms.lichess.username}
                                                </p>
                                                {onlinePlatforms.lichess.lastSeen && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Last seen: {formatDate(onlinePlatforms.lichess.lastSeen)}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Status: {onlinePlatforms.lichess.online ? (
                                                        <span className="text-green-600 font-medium">Online now</span>
                                                    ) : (
                                                        <span className="text-gray-500">Offline</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex justify-center">
                                                <a 
                                                    href={onlinePlatforms.lichess.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                                                >
                                                    View profile on Lichess.org
                                                    <ExternalLink className="h-4 w-4 ml-2" />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500">No account found on Lichess.org</p>
                                            <a 
                                                href={`https://lichess.org/@/${(params.id as string).replace(/\s+/g, '')}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-green-600 hover:underline mt-2 inline-block"
                                            >
                                                Search on Lichess.org
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-xl p-6">
                                <ChesscomSearch 
                                    name={(params?.id ?? '').toString().replace(/-/g, ' ')} 
                                    birthday=""
                                    country=""
                                />
                            </div>
                            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-xl p-6">
                                <LichessSearch 
                                    name={(params?.id ?? '').toString().replace(/-/g, ' ')}
                                    birthday=""
                                    country=""
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link 
                        href="/player-search" 
                        className="text-purple-600 hover:text-purple-800"
                    >
                        Return to player search
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-xl p-8 mb-8">
                <FIDEInfo playerInfo={playerInfo} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-xl p-6">
                    <ChesscomSearch
                        name={playerInfo.name.replace(/,$/, '') /* Remove trailing comma if present */}
                        birthday={playerInfo.birthday}
                        country={playerInfo.country}
                    />
                </div>
                <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-xl p-6">
                    <LichessSearch
                        name={playerInfo.name.replace(/,$/, '') /* Remove trailing comma if present */}
                        birthday={playerInfo.birthday}
                        country={playerInfo.country}
                    />
                </div>
            </div>
        </div>
    );
}
