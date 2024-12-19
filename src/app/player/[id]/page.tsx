// app/player/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FIDEInfo } from '@/components/FIDEInfo';
import { ChesscomSearch } from '@/components/ChesscomSearch';

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
            <div className="backdrop-blur-lg bg-purple-900/2 shadow-md rounded-lg p-6">
                <FIDEInfo playerInfo={playerInfo} />
                <ChesscomSearch
                    name={playerInfo.name}
                    birthday={playerInfo.birthday}
                    country={playerInfo.country}
                />
            </div>
        </div>
    );
}
