import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(
    request: NextRequest,
    { params }: {params: Promise<{
        id: string;
    }>}
): Promise<NextResponse> {
    try {
        const id = (await params).id;
        const playerId = parseInt(id, 10);

        if (isNaN(playerId)) {
            return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 });
        }

        const player = await prisma.player.findUnique({
            where: { fideid: playerId },
        });

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json(player, { status: 200 });
    } catch (error) {
        console.error('Error fetching player:', error.message, error.stack);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
