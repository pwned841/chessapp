// app/api/players/search/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Fuse from 'fuse.js';
import Player from "@/types/player";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    console.log(query)

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    // Fetch all players from the database
    const players = await prisma.player.findMany({ select: { fideid: true, name: true } });

    // Configure Fuse.js for fuzzy search on the 'name' field
    const fuse = new Fuse(players, {
        keys: ['name'],
        threshold: 0.3,
    })

    // Perform fuzzy search
    const fuseresults = fuse.search(query);

    const results: Player[] = [];

    fuseresults.slice(0, 5).forEach((result) => {
        if (result.item) {
            results.push(result.item);
        }
    });

    return NextResponse.json({ results: results });
}
