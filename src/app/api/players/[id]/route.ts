// app/api/players/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Props {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: Props): Promise<NextResponse> {
    try {
        const playerId = parseInt(params.id, 10);

        if (isNaN(playerId)) {
            return NextResponse.json(
                { error: 'Invalid player ID' },
                { status: 400 }
            );
        }

        const player = await prisma.player.findUnique({
            where: {
                fideid: playerId
            }
        });

        if (!player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(player);
    } catch (error) {
        console.error('Error fetching player:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
