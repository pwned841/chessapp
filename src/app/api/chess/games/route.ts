import { NextRequest, NextResponse } from 'next/server';
import { Chess } from 'chess.js';

interface Game {
  id: string;
  date: string;
  white: string;
  black: string;
  result: string;
  whiteElo: number;
  blackElo: number;
  pgn: string;
  moves: string[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const platform = searchParams.get('platform');
  const color = searchParams.get('color');
  const max = parseInt(searchParams.get('max') || '200'); // Support for requesting more games

  if (!username || !platform || !color) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Function to write to the stream
  const writeToStream = async (text: string) => {
    await writer.write(encoder.encode(text));
  };

  // Function to report progress
  const reportProgress = async (progress: number) => {
    await writeToStream(`progress: ${progress}\n`);
  };

  // Function to send partial game results
  const sendPartialResults = async (games: Game[]) => {
    await writeToStream(`{"games": ${JSON.stringify(games)}}\n`);
  };

  // Asynchronous processing
  const processGames = async () => {
    try {
      let games: Game[] = [];

      // Get games based on platform
      if (platform === 'lichess') {
        games = await getLichessGames(username, color, max, reportProgress, sendPartialResults);
      } else if (platform === 'chesscom') {
        games = await getChesscomGames(username, color, max, reportProgress, sendPartialResults);
      }

      // Write final results
      await writeToStream(JSON.stringify({ games }));
      await writer.close();
    } catch (error) {
      console.error('Error processing games:', error);
      await writeToStream(JSON.stringify({ error: 'Error retrieving games' }));
      await writer.close();
    }
  };

  // Start background processing
  processGames();

  // Return the stream immediately
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    }
  });
}

async function getLichessGames(
  username: string, 
  color: string, 
  maxGames: number,
  reportProgress: (progress: number) => Promise<void>,
  sendPartialResults: (games: Game[]) => Promise<void>
): Promise<Game[]> {
  try {
    // Parameters for Lichess API
    const colorParam = color === 'white' ? 'white' : 'black';
    
    // Get games from Lichess API
    const response = await fetch(`https://lichess.org/api/games/user/${username}?max=${maxGames}&perfType=rapid,blitz,classical&color=${colorParam}&pgnInJson=true`, {
      headers: {
        'Accept': 'application/x-ndjson'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching Lichess games: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Stream unavailable');

    const decoder = new TextDecoder();
    let buffer = '';
    const games: Game[] = [];
    let gamesProcessed = 0;
    let lastSentCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const game = JSON.parse(line);
            
            // Check if the game is valid
            if (game.players && game.pgn) {
              const parsedGame = parseGameFromLichess(game);
              if (parsedGame) {
                games.push(parsedGame);
              }
            }
            
            gamesProcessed++;
            
            // Report progress periodically
            if (gamesProcessed % 5 === 0 || gamesProcessed === maxGames) {
              await reportProgress(Math.min(Math.round((gamesProcessed / maxGames) * 100), 99));
            }
            
            // Send partial results every 10 games
            if (games.length >= lastSentCount + 10 || gamesProcessed === maxGames) {
              await sendPartialResults(games);
              lastSentCount = games.length;
            }
          } catch (e) {
            console.error('Error parsing game JSON:', e);
          }
        }
      }
    }

    await reportProgress(100);
    return games;
  } catch (error) {
    console.error('Error fetching Lichess games:', error);
    throw error;
  }
}

async function getChesscomGames(
  username: string, 
  color: string, 
  maxGames: number,
  reportProgress: (progress: number) => Promise<void>,
  sendPartialResults: (games: Game[]) => Promise<void>
): Promise<Game[]> {
  try {
    // Get available archives
    const archivesResponse = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
    if (!archivesResponse.ok) {
      throw new Error(`Error fetching Chess.com archives: ${archivesResponse.statusText}`);
    }

    const archivesData = await archivesResponse.json();
    const archives = archivesData.archives || [];
    
    // Take the last 10 months at most (more data)
    const recentArchives = archives.slice(-10);
    const games: Game[] = [];
    let totalProcessed = 0;
    let lastSentCount = 0;
    
    // Process each archive
    for (let i = 0; i < recentArchives.length; i++) {
      const archiveUrl = recentArchives[i];
      await reportProgress(Math.round((i / recentArchives.length) * 30));
      
      const gameResponse = await fetch(archiveUrl);
      if (gameResponse.ok) {
        const monthData = await gameResponse.json();
        const monthGames = monthData.games || [];
        
        for (const game of monthGames) {
          const playerColor = game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
          if (playerColor === color) {
            const parsedGame = parseGameFromChessCom(game);
            if (parsedGame) {
              games.push(parsedGame);
            }
          }
          
          totalProcessed++;
          
          // Report progress periodically
          if (totalProcessed % 20 === 0) {
            await reportProgress(30 + Math.min(Math.round((totalProcessed / (monthGames.length * recentArchives.length)) * 69), 69));
          }
          
          // Send partial results every 10 games
          if (games.length >= lastSentCount + 10) {
            await sendPartialResults(games);
            lastSentCount = games.length;
          }
          
          // Limit to maxGames
          if (games.length >= maxGames) break;
        }
      }
      
      if (games.length >= maxGames) break;
    }
    
    await reportProgress(100);
    await sendPartialResults(games); // Send final results
    return games;
  } catch (error) {
    console.error('Error fetching Chess.com games:', error);
    throw error;
  }
}

// Updated types to fix ESLint errors
interface LichessGame {
  id: string;
  pgn: string;
  createdAt: number;
  status: string;
  winner?: string;
  players: {
    white: { user?: { name: string }, rating?: number };
    black: { user?: { name: string }, rating?: number };
  }
}

function parseGameFromLichess(game: LichessGame): Game | null {
  try {
    // Ensure the game has at least one move played
    if (!game.pgn || game.pgn.trim() === '') return null;
    
    // Extract moves from the game
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    const moves = chess.history({ verbose: false });
    
    return {
      id: game.id,
      date: new Date(game.createdAt).toISOString(),
      white: game.players.white.user?.name || 'Anonymous',
      black: game.players.black.user?.name || 'Anonymous',
      result: game.status === 'draw' ? '1/2-1/2' : 
              game.winner === 'white' ? '1-0' : 
              game.winner === 'black' ? '0-1' : '*',
      whiteElo: game.players.white.rating || 0,
      blackElo: game.players.black.rating || 0,
      pgn: game.pgn,
      moves: moves
    };
  } catch (error) {
    console.error('Error parsing Lichess game:', error);
    return null;
  }
}

// Updated types to fix ESLint errors
interface ChesscomGame {
  url: string;
  pgn: string;
  end_time: number;
  white: { username: string, rating: number, result?: string };
  black: { username: string, rating: number, result?: string };
}

function parseGameFromChessCom(game: ChesscomGame): Game | null {
  try {
    // Ensure the game has at least one move played
    if (!game.pgn || game.pgn.trim() === '') return null;
    
    // Extract moves from the game
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    const moves = chess.history({ verbose: false });
    
    // Extract the result
    let result;
    if (game.white.result === 'win') result = '1-0';
    else if (game.black.result === 'win') result = '0-1';
    else if (game.white.result === 'draw' || game.black.result === 'draw') result = '1/2-1/2';
    else result = '*';
    
    return {
      id: game.url.split('/').pop() || '',
      date: new Date(game.end_time * 1000).toISOString(),
      white: game.white.username,
      black: game.black.username,
      result: result,
      whiteElo: game.white.rating,
      blackElo: game.black.rating,
      pgn: game.pgn,
      moves: moves
    };
  } catch (error) {
    console.error('Error parsing Chess.com game:', error);
    return null;
  }
}
