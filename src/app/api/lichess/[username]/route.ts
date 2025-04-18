import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  try {
    // Fetch player profile from Lichess API
    const profileResponse = await fetch(
      `https://lichess.org/api/user/${encodeURIComponent(username.toLowerCase())}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.json({ 
        error: 'Player not found on Lichess',
        message: 'Could not find player with this username.' 
      }, { status: 404 });
    }

    const profileData = await profileResponse.json();
    
    // Try to fetch recent games
    let recentGames: any[] = [];
    try {
      const gamesResponse = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(username.toLowerCase())}?max=5&pgnInJson=false`,
        {
          headers: {
            'Accept': 'application/x-ndjson'
          }
        }
      );
      
      if (gamesResponse.ok) {
        const text = await gamesResponse.text();
        // Parse NDJSON format (each line is a separate JSON object)
        recentGames = text.trim().split('\n').map(line => JSON.parse(line));
      }
    } catch (gamesError) {
      console.error('Error fetching Lichess games:', gamesError);
    }
    
    // Return combined data in the format the frontend expects
    return NextResponse.json({
      profile: profileData,
      recentGames: recentGames
    });
  } catch (error) {
    console.error('Lichess API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Lichess API' },
      { status: 500 }
    );
  }
}