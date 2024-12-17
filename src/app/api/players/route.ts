
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export async function GET(request : Request) {
    const { searchParams } = new URL(request.url);
    const fideId = searchParams.get('fideid') || '';
    console.log(fideId)

    if (!fideId) {
        return NextResponse.json({ results: [] });
    }

    const player = await prisma.player.findUnique( {where: { fideid: parseInt(fideId) }});

    return NextResponse.json({ player });
}
