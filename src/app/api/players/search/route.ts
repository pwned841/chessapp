// app/api/players/search/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    console.log(query);

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    // Fetch a limited number of players directly with a partial match
    const players = await prisma.player.findMany({
        where: {
            name: {
                contains: query,
                mode: 'insensitive', // Case-insensitive search
            },
        },
        select: {
            fideid: true,
            name: true,
        },
        take: 5, // Fetch only the top 5 results
    });

    return NextResponse.json({ results: players });
}
