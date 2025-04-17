import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  try {
    // First search for the player profile
    const profileResponse = await fetch(
      `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`
    );

    if (!profileResponse.ok) {
      return NextResponse.json({ 
        error: 'Player not found on Chess.com',
        message: 'Could not find player with this username.' 
      }, { status: 404 });
    }

    const profileData = await profileResponse.json();
    
    // Fetch player stats
    const statsResponse = await fetch(
      `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`
    );
    
    let statsData = {};
    if (statsResponse.ok) {
      statsData = await statsResponse.json();
    }
    
    // Get country info if available
    let countryName = null;
    if (profileData.country) {
      try {
        const countryResponse = await fetch(profileData.country);
        if (countryResponse.ok) {
          const countryData = await countryResponse.json();
          countryName = countryData.name;
        }
      } catch (countryError) {
        console.error(`Country error:`, countryError);
      }
    }
    
    // Return combined data in the format the frontend expects
    return NextResponse.json({
      profile: {
        ...profileData,
        countryName
      },
      stats: statsData
    });
  } catch (error) {
    console.error('Chess.com API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Chess.com API' },
      { status: 500 }
    );
  }
}