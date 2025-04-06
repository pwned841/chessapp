// app/player/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FIDEInfo } from '@/components/FIDEInfo';
import { ChesscomSearch } from '@/components/ChesscomSearch';
import { LichessSearch } from '@/components/LichessSearch';

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

export default function PlayerPage() {
    const params = useParams();
    const [playerInfo, setPlayerInfo] = useState<PlayerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
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
                        name={playerInfo.name}
                        birthday={playerInfo.birthday}
                        country={playerInfo.country}
                    />
                </div>
                <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-xl p-6">
                    <LichessSearch
                        name={playerInfo.name}
                        birthday={playerInfo.birthday}
                        country={playerInfo.country}
                    />
                </div>
            </div>
        </div>
    );
}
