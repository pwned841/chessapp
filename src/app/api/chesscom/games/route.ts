import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const color = searchParams.get('color') || 'white';

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    try {
        // First check if the user exists
        const profileResponse = await fetch(`https://api.chess.com/pub/player/${username}`);
        
        if (!profileResponse.ok) {
            return NextResponse.json({ error: "User not found on Chess.com" }, { status: 404 });
        }
        
        // Fetch all archives (monthly game collections)
        const archivesResponse = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
        
        if (!archivesResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch game archives" }, { status: 500 });
        }
        
        const archivesData = await archivesResponse.json();
        
        // Get the most recent archives (limit to last 3 months to avoid rate limiting)
        const recentArchives = archivesData.archives.slice(-3);
        
        // Fetch games from each recent archive
        const gamesPromises = recentArchives.map((archiveUrl: string) => 
            fetch(archiveUrl)
                .then(res => res.json())
                .catch(err => {
                    console.error(`Error fetching archive ${archiveUrl}:`, err);
                    return { games: [] };
                })
        );
        
        const archiveResults = await Promise.all(gamesPromises);
        
        // Combine all games
        let allGames: any[] = [];
        
        archiveResults.forEach(archive => {
            if (archive && archive.games) {
                allGames = [...allGames, ...archive.games];
            }
        });
        
        // Filter games by color if specified
        const filteredGames = allGames.filter(game => {
            if (color === 'white') {
                return game.white.username.toLowerCase() === username.toLowerCase();
            } else if (color === 'black') {
                return game.black.username.toLowerCase() === username.toLowerCase();
            }
            return true;
        });
        
        return NextResponse.json({
            username,
            color,
            totalGames: filteredGames.length,
            games: filteredGames
        });

    } catch (error) {
        console.error('Error fetching Chess.com games:', error);
        return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
    }
}
