// components/ChesscomSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ChesscomSearchProps {
    name: string;
    birthday?: string;
    country: string;
}

interface ChesscomPlayer {
    player_id?: number;
    username: string;
    name?: string;
    followers?: number;
    country?: string;
    countryName?: string;
    location?: string;
    title?: string;
    status?: string;
    avatar?: string;
    last_online?: number;
    joined?: number;
    url?: string;
    stats?: {
        chess_rapid?: { 
            rating: number, 
            last?: { date: number, rating: number, rd?: number }, 
            best?: { rating: number, date: number, game?: string },
            record?: { win: number, loss: number, draw: number }
        };
        chess_blitz?: { 
            rating: number, 
            last?: { date: number, rating: number, rd?: number }, 
            best?: { rating: number, date: number, game?: string },
            record?: { win: number, loss: number, draw: number }
        };
        chess_bullet?: { 
            rating: number, 
            last?: { date: number, rating: number, rd?: number }, 
            best?: { rating: number, date: number, game?: string },
            record?: { win: number, loss: number, draw: number }
        };
        chess_daily?: { 
            last?: { date: number, rating: number, rd?: number }, 
            best?: { rating: number, date: number, game?: string },
            record?: { win: number, loss: number, draw: number }
        };
        tactics?: {
            highest?: { rating: number, date: number },
            lowest?: { rating: number, date: number }
        };
        puzzle_rush?: {
            best?: { total_attempts: number, score: number }
        };
        fide?: number;
        [key: string]: unknown;
    };
}

export function ChesscomSearch({ name }: ChesscomSearchProps) {
    const [players, setPlayers] = useState<ChesscomPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [searchProgress, setSearchProgress] = useState({
        currentVariation: '',
        totalVariations: 0,
        foundPlayers: 0,
        completed: false
    });
    const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

    useEffect(() => {
        const searchChessCom = async () => {
            if (!name) return;
            
            setIsLoading(true);
            setError(null);
            setSearchAttempted(true);
            setPlayers([]);
            
            const nameParts = name.trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
            
            const nameCombinations = [
                name.replace(/\s+/g, ''),
                `${firstName}${lastName}`,
                firstName,
                lastName,
                `${firstName.charAt(0)}${lastName}`,
                `${firstName}_${lastName}`,
                `${lastName}${firstName}`,
                `${firstName}-${lastName}`,
                `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
                `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`
            ].filter(n => n);
            
            const uniqueCombinations = [...new Set(nameCombinations)];
            
            setSearchProgress({
                currentVariation: '',
                totalVariations: uniqueCombinations.length,
                foundPlayers: 0,
                completed: false
            });
            
            const foundPlayers: ChesscomPlayer[] = [];
            
            for (let i = 0; i < uniqueCombinations.length; i++) {
                const combination = uniqueCombinations[i];
                
                setSearchProgress(prev => ({
                    ...prev,
                    currentVariation: combination,
                    foundPlayers: foundPlayers.length
                }));
                
                try {
                    console.log(`Searching Chess.com for: ${combination}`);
                    
                    const response = await fetch(`/api/chesscom/search?name=${encodeURIComponent(combination)}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data)) {
                            data.forEach(player => {
                                if (!foundPlayers.some(p => p.username === player.username)) {
                                    foundPlayers.push(player);
                                }
                            });
                            
                            setPlayers([...foundPlayers]);
                        }
                    }
                } catch (err) {
                    console.error(`Error with ${combination}:`, err);
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const sortedPlayers = sortPlayers(foundPlayers);
            
            setPlayers(sortedPlayers);
            setSearchProgress(prev => ({
                ...prev,
                currentVariation: 'Completed',
                foundPlayers: sortedPlayers.length,
                completed: true
            }));
            setIsLoading(false);
        };

        const getHighestRating = (player: ChesscomPlayer): {type: string, rating: number} => {
            const ratings = [
                { type: 'Bullet', rating: player.stats?.chess_bullet?.last?.rating || 0 },
                { type: 'Blitz', rating: player.stats?.chess_blitz?.last?.rating || 0 },
                { type: 'Rapid', rating: player.stats?.chess_rapid?.last?.rating || 0 },
                { type: 'FIDE', rating: player.stats?.fide || 0 }
            ];
            
            return ratings.reduce((highest, current) => 
                current.rating > highest.rating ? current : highest, 
                { type: 'None', rating: 0 }
            );
        };

        const sortPlayers = (players: ChesscomPlayer[]): ChesscomPlayer[] => {
            return [...players].sort((a, b) => {
                if (a.title && !b.title) return -1;
                if (!a.title && b.title) return 1;
                
                if (a.title && b.title) {
                    const titleOrder = ['GM', 'IM', 'WGM', 'FM', 'WIM', 'CM', 'WFM', 'WCM', 'NM'];
                    const aIndex = titleOrder.indexOf(a.title);
                    const bIndex = titleOrder.indexOf(b.title);
                    
                    if (aIndex !== -1 && bIndex !== -1) {
                        return aIndex - bIndex;
                    }
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    return a.title.localeCompare(b.title);
                }
                
                const aRating = getHighestRating(a).rating;
                const bRating = getHighestRating(b).rating;
                return bRating - aRating;
            });
        };

        if (name) {
            searchChessCom();
        }
    }, [name]);

    const togglePlayerExpansion = (username: string) => {
        if (expandedPlayerId === username) {
            setExpandedPlayerId(null);
        } else {
            setExpandedPlayerId(username);
        }
    };

    const getHighestRating = (player: ChesscomPlayer): {type: string, rating: number} => {
        const ratings = [
            { type: 'Bullet', rating: player.stats?.chess_bullet?.last?.rating || 0 },
            { type: 'Blitz', rating: player.stats?.chess_blitz?.last?.rating || 0 },
            { type: 'Rapid', rating: player.stats?.chess_rapid?.last?.rating || 0 },
            { type: 'FIDE', rating: player.stats?.fide || 0 }
        ];
        
        return ratings.reduce((highest, current) => 
            current.rating > highest.rating ? current : highest, 
            { type: 'None', rating: 0 }
        );
    };

    return (
        <div className="h-full">
            <h2 className="text-2xl font-bold mb-4 text-purple-500 border-b border-purple-300 pb-2">Chess.com Profile</h2>
            
            {isLoading && (
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-purple-700">
                            Searching: {searchProgress.currentVariation}
                        </span>
                        <span className="text-sm font-medium text-purple-700">
                            {searchProgress.foundPlayers} players found
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${Math.min(
                                    (searchProgress.totalVariations > 0 
                                        ? (players.length / searchProgress.totalVariations) * 100 
                                        : 0) + 10, 
                                    100
                                )}%` 
                            }}
                        ></div>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            
            {!isLoading && !error && searchAttempted && players.length === 0 && (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-2">No players found on Chess.com matching &quot;{name}&quot;</p>
                    <a 
                        href={`https://www.chess.com/members?q=${encodeURIComponent(name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                    >
                        Search on Chess.com
                    </a>
                </div>
            )}
            
            {players.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500 p-3 border-b">
                        Found {players.length} players on Chess.com
                    </div>
                    
                    <ul className="divide-y divide-gray-200">
                        {players.map((player, index) => {
                            const highestRating = getHighestRating(player);
                            const titleBadgeColor = player.title === 'GM' ? 'bg-yellow-100 text-yellow-800' :
                                                   player.title === 'IM' ? 'bg-blue-100 text-blue-800' :
                                                   player.title?.startsWith('W') ? 'bg-pink-100 text-pink-800' :
                                                   'bg-gray-100 text-gray-800';
                            
                            return (
                                <li key={index} className="hover:bg-gray-50">
                                    <div 
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                        onClick={() => togglePlayerExpansion(player.username)}
                                    >
                                        <div className="flex items-center">
                                            {player.avatar ? (
                                                <Image 
                                                    src={player.avatar} 
                                                    alt={player.username} 
                                                    width={40} 
                                                    height={40} 
                                                    className="rounded-full mr-3"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "/chess-pawn.svg";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mr-3">
                                                    ♙
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center">
                                                    {player.title && (
                                                        <span className={`${titleBadgeColor} text-xs px-1.5 py-0.5 rounded mr-1.5`}>
                                                            {player.title}
                                                        </span>
                                                    )}
                                                    <h3 className="font-medium text-gray-900">{player.username}</h3>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span>{player.countryName || player.country?.split('/').pop()}</span>
                                                    {player.stats?.fide && (
                                                        <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                                            FIDE: {player.stats.fide}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {highestRating.rating > 0 && (
                                                <div className="text-right mr-4">
                                                    <p className="text-sm text-gray-500">{highestRating.type}</p>
                                                    <p className="font-bold text-purple-700">{highestRating.rating}</p>
                                                </div>
                                            )}
                                            <svg 
                                                className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedPlayerId === player.username ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {expandedPlayerId === player.username && (
                                        <div className="px-4 pb-4 pt-2 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {player.stats?.chess_bullet?.last?.rating && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Bullet</p>
                                                        <p className="text-2xl font-bold text-purple-700">
                                                            {player.stats.chess_bullet.last.rating}
                                                        </p>
                                                        {player.stats.chess_bullet.best && (
                                                            <p className="text-xs text-gray-500">
                                                                Best: {player.stats.chess_bullet.best.rating}
                                                            </p>
                                                        )}
                                                        {player.stats.chess_bullet.record && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {player.stats.chess_bullet.record.win}W / {player.stats.chess_bullet.record.loss}L / {player.stats.chess_bullet.record.draw}D
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {player.stats?.chess_blitz?.last?.rating && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Blitz</p>
                                                        <p className="text-2xl font-bold text-purple-700">
                                                            {player.stats.chess_blitz.last.rating}
                                                        </p>
                                                        {player.stats.chess_blitz.best && (
                                                            <p className="text-xs text-gray-500">
                                                                Best: {player.stats.chess_blitz.best.rating}
                                                            </p>
                                                        )}
                                                        {player.stats.chess_blitz.record && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {player.stats.chess_blitz.record.win}W / {player.stats.chess_blitz.record.loss}L / {player.stats.chess_blitz.record.draw}D
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {player.stats?.chess_rapid?.last?.rating && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Rapid</p>
                                                        <p className="text-2xl font-bold text-purple-700">
                                                            {player.stats.chess_rapid.last.rating}
                                                        </p>
                                                        {player.stats.chess_rapid.best && (
                                                            <p className="text-xs text-gray-500">
                                                                Best: {player.stats.chess_rapid.best.rating}
                                                            </p>
                                                        )}
                                                        {player.stats.chess_rapid.record && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {player.stats.chess_rapid.record.win}W / {player.stats.chess_rapid.record.loss}L / {player.stats.chess_rapid.record.draw}D
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {player.stats?.chess_daily?.last?.rating && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Daily Chess</p>
                                                        <p className="text-xl font-bold text-purple-700">
                                                            {player.stats.chess_daily.last.rating}
                                                        </p>
                                                        {player.stats.chess_daily.record && (
                                                            <p className="text-xs text-gray-500">
                                                                {player.stats.chess_daily.record.win}W / {player.stats.chess_daily.record.loss}L / {player.stats.chess_daily.record.draw}D
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {player.stats?.tactics?.highest && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Tactics</p>
                                                        <p className="text-xl font-bold text-purple-700">
                                                            {player.stats.tactics.highest.rating}
                                                        </p>
                                                    </div>
                                                )}
                                                {player.stats?.puzzle_rush?.best && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Puzzle Rush</p>
                                                        <p className="text-xl font-bold text-purple-700">
                                                            {player.stats.puzzle_rush.best.score}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {player.stats.puzzle_rush.best.total_attempts} attempts
                                                        </p>
                                                    </div>
                                                )}
                                                {player.stats?.fide && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">FIDE Rating</p>
                                                        <p className="text-xl font-bold text-purple-700">
                                                            {player.stats.fide}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500 mt-2">
                                                <div>
                                                    {player.joined && (
                                                        <p>Joined: {new Date(player.joined * 1000).toLocaleDateString()}</p>
                                                    )}
                                                    {player.last_online && (
                                                        <p>Last online: {new Date(player.last_online * 1000).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                                
                                                <a 
                                                    href={`https://www.chess.com/member/${player.username}`}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="mt-3 md:mt-0 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors inline-block text-center"
                                                >
                                                    View Profile
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
