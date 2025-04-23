// app/api/players/search/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instance unique de Prisma pour éviter trop de connexions
const prisma = new PrismaClient({
    log: ['error'],
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'standard'; // standard, rapid, blitz
    
    if (!query || query.length < 3) {
        return NextResponse.json({ 
            players: [],
            message: "Please provide at least 3 characters to search"
        }, { status: 200 });
    }

    try {
        // Search for players by name
        const players = await prisma.player.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive' // Case-insensitive search
                }
            },
            select: {
                fideid: true,
                name: true,
                country: true,
                title: true,
                rating: true,
                rapid_rating: true,
                blitz_rating: true,
                games: true,
                rapid_games: true,
                blitz_games: true,
                k: true,
                rapid_k: true,
                blitz_k: true,
                flag: true
            },
            orderBy: type === 'rapid' 
                ? { rapid_rating: 'desc' } 
                : type === 'blitz' 
                    ? { blitz_rating: 'desc' }
                    : { rating: 'desc' },
            take: 10 // Limit results
        });

        return NextResponse.json({ 
            players,
            type
        });

    } catch (error: any) {
        console.error('Error searching players:', error);
        return NextResponse.json({ 
            error: 'Failed to search players',
            message: error.message 
        }, { status: 500 });
    }
}