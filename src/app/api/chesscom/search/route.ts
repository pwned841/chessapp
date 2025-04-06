import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  try {
    // First search for the player
    const searchResponse = await fetch(
      `https://api.chess.com/pub/player/${encodeURIComponent(name.toLowerCase())}`
    );

    if (!searchResponse.ok) {
      // If direct player lookup fails, try a general search
      const playerSearchResponse = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(name.toLowerCase())}/stats`
      );
      
      if (!playerSearchResponse.ok) {
        return NextResponse.json({ 
          error: 'Player not found on Chess.com',
          message: 'Could not find an exact match. Try a different username.' 
        }, { status: 404 });
      }
      
      const statsData = await playerSearchResponse.json();
      const profileResponse = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(name.toLowerCase())}`
      );
      
      if (!profileResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch player profile' }, { status: 404 });
      }
      
      const profileData = await profileResponse.json();
      
      // Return combined data
      return NextResponse.json([{
        ...profileData,
        stats: statsData
      }]);
    }

    const playerData = await searchResponse.json();
    
    // Fetch player stats
    const statsResponse = await fetch(
      `https://api.chess.com/pub/player/${encodeURIComponent(name.toLowerCase())}/stats`
    );
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      playerData.stats = statsData;
    }
    
    // Get country info if available
    if (playerData.country) {
      try {
        const countryResponse = await fetch(playerData.country);
        if (countryResponse.ok) {
          const countryData = await countryResponse.json();
          playerData.countryName = countryData.name;
        }
      } catch (countryError) {
        console.error(`Country error:`, countryError);
      }
    }
    
    return NextResponse.json([playerData]);
  } catch (error) {
    console.error('Chess.com API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Chess.com API' },
      { status: 500 }
    );
  }
}
