// app/players/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

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
    const { id } = useParams();
    const [playerInfo, setPlayerInfo] = useState<PlayerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPlayerInfo() {
            try {
                const response = await fetch(`/api/players/${id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch player information');
                }

                const data = await response.json();
                setPlayerInfo(data);
                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setIsLoading(false);
            }
        }

        fetchPlayerInfo();
    }, [id]);

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
        <div className="container mx-auto p-4 ">
            <h1 className="text-2xl font-bold mb-4 text-purple-700 mt-14">Player Profile</h1>
            <div className="shadow-md rounded-lg p-6 backdrop-blur-lg bg-purple-900/20">
                <h2 className="text-xl font-semibold mb-2">{playerInfo.name}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p><strong>FIDE ID:</strong> {playerInfo.fideid}</p>
                        <p><strong>Country:</strong> {playerInfo.country}</p>
                        <p><strong>Sex:</strong> {playerInfo.sex}</p>
                        <p><strong>Birthday:</strong> {playerInfo.birthday}</p>
                    </div>
                    <div>
                        <p><strong>Standard Rating:</strong> {playerInfo.rating || 'N/A'}</p>
                        <p><strong>Standard Games:</strong> {playerInfo.games || 'N/A'}</p>
                        {playerInfo.title && <p><strong>Title:</strong> {playerInfo.title}</p>}
                        {playerInfo.w_title && <p><strong>Women's Title:</strong> {playerInfo.w_title}</p>}
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Rapid Ratings</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>Rapid Rating:</strong> {playerInfo.rapid_rating || 'N/A'}</p>
                        <p><strong>Rapid Games:</strong> {playerInfo.rapid_games || 'N/A'}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Blitz Ratings</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>Blitz Rating:</strong> {playerInfo.blitz_rating || 'N/A'}</p>
                        <p><strong>Blitz Games:</strong> {playerInfo.blitz_games || 'N/A'}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
