// app/api/players/search/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const players = await prisma.player.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
                NOT: {
                    name: null,
                },
            },
            select: {
                fideid: true,
                name: true,
                country: true,
                title: true,
                rating: true,
            },
            orderBy: {
                rating: 'desc',
            },
            take: 5,
        });

        return NextResponse.json({ results: players });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        );
    }
}