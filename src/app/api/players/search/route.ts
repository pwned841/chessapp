// app/api/players/search/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instance unique de Prisma pour éviter trop de connexions
const prisma = new PrismaClient({
    log: ['error'],
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '5');

        console.log(`Recherche de joueurs avec la requête: "${query}"`);

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Recherche avec conditions plus flexibles
        const players = await prisma.player.findMany({
            where: {
                OR: [
                    // Recherche dans le champ name
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                        NOT: {
                            name: null,
                        },
                    },
                    // Vous pourriez ajouter d'autres conditions de recherche si nécessaire
                    // Par exemple, rechercher dans d'autres champs si vous le souhaitez
                ],
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
            take: limit,
        });

        console.log(`Résultats trouvés pour "${query}": ${players.length}`);

        // Si aucun résultat, on affiche un message pour faciliter le débogage
        if (players.length === 0) {
            console.log(`Aucun joueur trouvé avec la requête: "${query}"`);
        }

        return NextResponse.json({ results: players });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}