'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Search, Rewind, ChevronLeft, ChevronRight, RotateCcw, ExternalLink, Info, Calendar } from "lucide-react";
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false }
);

interface MoveStats {
  san: string;
  count: number;
  wins: number;
  draws: number;
  losses: number;
  elo: number;
}

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

export default function RepertoirePage() {
  const [platform, setPlatform] = useState<'chesscom' | 'lichess'>('lichess');
  const [username, setUsername] = useState('');
  const [side, setSide] = useState<'white' | 'black'>('white');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState<number>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [chess, setChess] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [availableMoves, setAvailableMoves] = useState<MoveStats[]>([]);
  const [positionGames, setPositionGames] = useState<Game[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  const exampleUsernames = {
    lichess: ['DrNykterstein', 'penguingim1', 'RebeccaHarris', 'DanielNaroditsky'],
    chesscom: ['MagnusCarlsen', 'Hikaru', 'GothamChess', 'DanielNaroditsky']
  };

  const fetchRepertoire = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!username) {
      setError("Please enter a username");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearchProgress(0);
    setDataLoaded(false);
    setFormSubmitted(true);
    setPositionGames([]); 
    
    try {
      const url = `/api/chess/games?username=${username}&platform=${platform}&color=${side}&max=200`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream unavailable");
      
      const decoder = new TextDecoder();
      let data = '';
      let gamesData: Game[] = [];
      let partialDataBuffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        data += decoder.decode(value, { stream: true });
        
        if (data.includes('progress:')) {
          const progressMatch = data.match(/progress:\s*(\d+)/);
          if (progressMatch && progressMatch[1]) {
            setSearchProgress(parseInt(progressMatch[1]));
          }
        }
        
        if (data.includes('{"games":[')) {
          const startIndex = data.indexOf('{"games":[');
          
          try {
            partialDataBuffer = data.substring(startIndex);
            const parsedData = JSON.parse(partialDataBuffer);
            if (parsedData.games && parsedData.games.length > 0) {
              gamesData = parsedData.games;
              processGames(gamesData);
              setDataLoaded(true);
            }
          } catch (e) {}
        }
      }
      
      const cleanedData = data.replace(/progress:\s*\d+\n/g, '');
      try {
        const parsedData = JSON.parse(cleanedData);
        if (parsedData.error) {
          throw new Error(parsedData.error);
        }
        
        processGames(parsedData.games);
        setDataLoaded(true);
      } catch (err) {
        if (gamesData.length === 0) {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error retrieving games:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const processGames = (games: Game[]) => {
    // Sort games by date (newest first)
    const sortedGames = [...games].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setChess(new Chess());
    setMoveHistory([]);
    setCurrentPosition(0);
    setPositionGames(sortedGames);
    setOrientation(side);
    calculateMovesForPosition(sortedGames, []);
  };

  const calculateMovesForPosition = (games: Game[], moves: string[]) => {
    const movesMap = new Map<string, { count: number; wins: number; draws: number; losses: number; elo: number }>();
    
    games.forEach(game => {
      if (moves.length < game.moves.length) {
        const nextMove = game.moves[moves.length];
        const isWhite = moves.length % 2 === 0;
        const isOurMove = (side === 'white' && isWhite) || (side === 'black' && !isWhite);
        
        if (isOurMove || true) {
          if (!movesMap.has(nextMove)) {
            movesMap.set(nextMove, { count: 0, wins: 0, draws: 0, losses: 0, elo: 0 });
          }
          
          const stats = movesMap.get(nextMove)!;
          stats.count++;
          
          if ((game.result === '1-0' && side === 'white') || (game.result === '0-1' && side === 'black')) {
            stats.wins++;
          } else if (game.result === '1/2-1/2') {
            stats.draws++;
          } else if (game.result === '*') {} else {
            stats.losses++;
          }
          
          const opponentElo = side === 'white' ? game.blackElo : game.whiteElo;
          stats.elo = Math.round((stats.elo * (stats.count - 1) + opponentElo) / stats.count);
        }
      }
    });
    
    const movesList = Array.from(movesMap.entries()).map(([san, stats]) => ({
      san,
      ...stats
    }));
    
    movesList.sort((a, b) => b.count - a.count);
    setAvailableMoves(movesList);
  };

  // Get only the relevant games and sort by date (newest first)
  const getGamesForCurrentPosition = () => {
    const games = positionGames.filter(game => 
      moveHistory.every((move, index) => game.moves[index] === move)
    );
    return games;
  };

  const makeMove = (move: string) => {
    try {
      const gameCopy = new Chess(chess.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setChess(gameCopy);
        const newHistory = [...moveHistory.slice(0, currentPosition), move];
        setMoveHistory(newHistory);
        setCurrentPosition(newHistory.length);
        
        const relevantGames = positionGames.filter(game => 
          newHistory.every((move, index) => game.moves[index] === move)
        );
        
        calculateMovesForPosition(relevantGames, newHistory);
      }
    } catch (err) {
      console.error("Error executing move:", err);
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const gameCopy = new Chess(chess.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      
      if (move) {
        makeMove(move.san);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const goToPreviousMove = () => {
    if (currentPosition > 0) {
      const newPosition = currentPosition - 1;
      setCurrentPosition(newPosition);
      
      const newChess = new Chess();
      for (let i = 0; i < newPosition; i++) {
        newChess.move(moveHistory[i]);
      }
      
      setChess(newChess);
      calculateMovesForPosition(
        positionGames,
        moveHistory.slice(0, newPosition)
      );
    }
  };

  const goToNextMove = () => {
    if (currentPosition < moveHistory.length) {
      const newPosition = currentPosition + 1;
      const move = moveHistory[currentPosition];
      
      const newChess = new Chess(chess.fen());
      newChess.move(move);
      
      setChess(newChess);
      setCurrentPosition(newPosition);
      calculateMovesForPosition(
        positionGames,
        moveHistory.slice(0, newPosition)
      );
    }
  };

  const resetPosition = () => {
    setChess(new Chess());
    setCurrentPosition(0);
    calculateMovesForPosition(positionGames, []);
  };

  const flipBoard = () => {
    setOrientation(prev => prev === 'white' ? 'black' : 'white');
  };

  const resetForm = () => {
    setUsername('');
    setPlatform('lichess');
    setSide('white');
    setFormSubmitted(false);
    setChess(new Chess());
    setMoveHistory([]);
    setCurrentPosition(0);
    setAvailableMoves([]);
    setPositionGames([]);
    setDataLoaded(false);
  };

  const moveSequence = moveHistory.map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    if (index % 2 === 0) {
      return `${moveNumber}. ${move}`;
    } else {
      return move;
    }
  }).join(' ');

  const currentGames = getGamesForCurrentPosition();
  const totalGames = positionGames.length;
  const positionFrequency = currentGames.length / (totalGames || 1);

  const isWhiteToPlay = chess.turn() === 'w';
  const playerToMove = isWhiteToPlay ? 'White' : 'Black';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Opening Repertoire Explorer
      </h1>
      <p className="text-muted-foreground mb-6">
        Analyze opening repertoires from Lichess and Chess.com players
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Repertoire Analysis</CardTitle>
          <CardDescription>
            Analyze a player's opening repertoire based on their online games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchRepertoire} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Examples: {platform === 'lichess' 
                    ? exampleUsernames.lichess.join(', ') 
                    : exampleUsernames.chesscom.join(', ')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={platform} 
                  onValueChange={(value: 'lichess' | 'chesscom') => setPlatform(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lichess">Lichess</SelectItem>
                    <SelectItem value="chesscom">Chess.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="side">Side</Label>
                <Select 
                  value={side} 
                  onValueChange={(value: 'white' | 'black') => setSide(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {formSubmitted && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Searching...' : 'Analyze'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center space-x-2">
                <span>Retrieving and analyzing games...</span>
              </div>
              <Progress value={searchProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {dataLoaded ? 
                  `Loaded ${positionGames.length} games. You can start analyzing while we continue loading.` :
                  "This operation may take a few minutes depending on the number of games."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {formSubmitted && dataLoaded && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline">
              {platform === 'lichess' ? 'Lichess' : 'Chess.com'}
            </Badge>
            <Badge variant="outline">
              {side === 'white' ? 'White' : 'Black'}
            </Badge>
            <Badge variant="outline">
              {username}
            </Badge>
            <Badge variant="outline">
              {totalGames} games analyzed
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:row-span-2">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Opening Repertoire</span>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={flipBoard}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Flip board</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {moveHistory.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={resetPosition}>
                              <Rewind className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reset to initial position</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </CardTitle>
                {moveSequence && (
                  <CardDescription>
                    Move sequence: {moveSequence}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="aspect-square max-h-[600px] w-full">
                  <Chessboard 
                    position={chess.fen()} 
                    onPieceDrop={onDrop}
                    boardOrientation={orientation}
                    customBoardStyle={{
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </div>

                {/* Navigation controls in a fixed position below the board */}
                <div className="mt-4 grid grid-cols-3 gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={goToPreviousMove}
                    disabled={currentPosition === 0}
                    className="flex items-center justify-center"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="text-center">
                    {dataLoaded && (
                      <Badge variant="outline" className="mx-auto">
                        {currentGames.length} / {totalGames} games ({(positionFrequency * 100).toFixed(1)}%)
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextMove}
                    disabled={currentPosition >= moveHistory.length}
                    className="flex items-center justify-center"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold">How to use:</span> Click on available moves in the list or drag pieces on the board to explore the repertoire. The statistics show the success rate of each move from the player's perspective.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>Moves Played</div>
                  <Badge variant={isWhiteToPlay ? "default" : "secondary"} className="text-xs">
                    {playerToMove} to play
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Statistics of moves played in this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!availableMoves.length ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No moves available in this position.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {availableMoves.map((move) => {
                      const winRate = (move.wins / move.count) * 100;
                      let colorClass = "";
                      
                      if (winRate >= 60) colorClass = "bg-green-600 text-white";
                      else if (winRate >= 50) colorClass = "bg-green-500 text-white";
                      else if (winRate >= 40) colorClass = "bg-amber-500 text-white";
                      else colorClass = "bg-red-500 text-white";
                      
                      return (
                        <div
                          key={move.san}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 cursor-pointer border border-muted/60 transition-all duration-200 hover:border-accent/60"
                          onClick={() => makeMove(move.san)}
                        >
                          <div className="font-medium">{move.san}</div>
                          <div className="flex items-center gap-2">
                            <Badge className={colorClass}>
                              {winRate.toFixed(0)}%
                            </Badge>
                            <Badge variant="outline">
                              {move.count} game{move.count > 1 ? "s" : ""}
                            </Badge>
                            {move.elo > 0 && (
                              <Badge variant="outline" className="bg-blue-500/10">
                                {move.elo} ELO
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Games</CardTitle>
                <CardDescription>
                  Games containing this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentGames.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No games found for this position.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {currentGames.slice(0, 20).map((game) => {
                      const isWin = (game.result === '1-0' && side === 'white') || 
                            (game.result === '0-1' && side === 'black');
                      const isDraw = game.result === '1/2-1/2';
                      const isOngoing = game.result === '*';
                      
                      const resultVariant = isWin ? "default" : 
                                           isDraw ? "outline" : 
                                           isOngoing ? "secondary" : "destructive";
                                           
                      const formattedDate = new Date(game.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      return (
                        <div key={game.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/5">
                          <div className="flex-1 min-w-0 mr-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={resultVariant} className="shrink-0">
                                {game.result}
                              </Badge>
                              <span className="font-medium truncate">
                                {game.white} ({game.whiteElo}) vs {game.black} ({game.blackElo})
                              </span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                <Calendar className="inline h-3 w-3 mr-1" />
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`https://${platform === 'lichess' ? 'lichess.org' : 'chess.com'}/game/${game.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 ml-auto"
                          >
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                    {currentGames.length > 20 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        + {currentGames.length - 20} more games
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                About Opening Repertoire Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This tool analyzes a player's chess games to build a comprehensive view of their opening repertoire. 
                Moves are sorted by frequency, allowing you to see which lines the player prefers. The win rate percentage 
                indicates how successful the player has been with each move. You can navigate through the move tree by 
                clicking on moves or using the navigation buttons.
              </p>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Win Rate</h3>
                  <p className="text-muted-foreground">
                    Percentage of games won after playing this move. Higher is better.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Game Count</h3>
                  <p className="text-muted-foreground">
                    Number of games where this move was played in this position.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">ELO</h3>
                  <p className="text-muted-foreground">
                    Average rating of opponents faced in these games.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
