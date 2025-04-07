import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const color = searchParams.get('color') || 'white';

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    try {
        // Fetch user profile to verify existence
        const profileResponse = await fetch(`https://lichess.org/api/user/${username}`);
        
        if (!profileResponse.ok) {
            return NextResponse.json({ error: "User not found on Lichess" }, { status: 404 });
        }
        
        // Fetch recent games (last 100 games)
        const gamesResponse = await fetch(
            `https://lichess.org/api/games/user/${username}?max=100&perfType=rapid,blitz,classical&pgnInJson=true`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!gamesResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch games from Lichess" }, { status: 500 });
        }
        
        // Lichess API returns games as ndjson, we need to parse it
        const text = await gamesResponse.text();
        const games = text
            .trim()
            .split('\n')
            .map(line => JSON.parse(line));
        
        // Filter games by color if specified
        const filteredGames = games.filter(game => {
            if (color === 'white') {
                return game.players.white.user.name.toLowerCase() === username.toLowerCase();
            } else if (color === 'black') {
                return game.players.black.user.name.toLowerCase() === username.toLowerCase();
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
        console.error('Error fetching Lichess games:', error);
        return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
    }
}
