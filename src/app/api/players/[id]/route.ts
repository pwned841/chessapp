// app/api/players/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const playerId = parseInt(params.id, 10);

        const player = await prisma.player.findUnique({
            where: {
                fideid: playerId
            }
        });

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json(player);
    } catch (error) {
        console.error('Error fetching player:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
