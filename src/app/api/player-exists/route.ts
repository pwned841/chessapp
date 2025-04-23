import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  try {
    // Create promises for both platforms
    const chesscomPromise = checkChesscomPlayer(username);
    const lichessPromise = checkLichessPlayer(username);

    // Wait for both checks to complete
    const [chesscomResult, lichessResult] = await Promise.all([chesscomPromise, lichessPromise]);

    return NextResponse.json({
      chesscom: chesscomResult,
      lichess: lichessResult
    });
  } catch (error) {
    console.error('Player existence check error:', error);
    return NextResponse.json(
      { error: 'Failed to check player existence' },
      { status: 500 }
    );
  }
}

async function checkChesscomPlayer(username: string) {
  try {
    // Try several variations of the username
    const usernamesToTry = [
      username,
      username.replace(/\s+/g, ''),
      username.toLowerCase(),
      username.toLowerCase().replace(/\s+/g, '')
    ];

    for (const usernameVariation of usernamesToTry) {
      const response = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(usernameVariation)}`
      );

      if (response.ok) {
        const data = await response.json();
        return {
          exists: true,
          username: data.username,
          url: `https://www.chess.com/member/${data.username}`,
          avatar: data.avatar || null,
          lastOnline: data.last_online ? new Date(data.last_online * 1000).toISOString() : null,
          title: data.title || null
        };
      }
    }

    // If no variations were found
    return { exists: false };
  } catch (error) {
    console.error('Chess.com check error:', error);
    return { exists: false, error: 'Failed to check Chess.com' };
  }
}

async function checkLichessPlayer(username: string) {
  try {
    // Try several variations of the username
    const usernamesToTry = [
      username,
      username.replace(/\s+/g, ''),
      username.toLowerCase(),
      username.toLowerCase().replace(/\s+/g, '')
    ];

    for (const usernameVariation of usernamesToTry) {
      const response = await fetch(
        `https://lichess.org/api/user/${encodeURIComponent(usernameVariation)}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          exists: true,
          username: data.username,
          url: `https://lichess.org/@/${data.username}`,
          title: data.title || null,
          online: data.online || false,
          lastSeen: data.seenAt ? new Date(data.seenAt).toISOString() : null
        };
      }
    }

    // If no variations were found
    return { exists: false };
  } catch (error) {
    console.error('Lichess check error:', error);
    return { exists: false, error: 'Failed to check Lichess' };
  }
}