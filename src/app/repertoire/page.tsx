'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Search, Rewind, ChevronLeft, ChevronRight, RotateCcw, ExternalLink, Info, Calendar, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StockfishAnalysis from '@/components/StockfishAnalysis';
import { useToast } from "@/hooks/use-toast";

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
  const [gamesLoadedCount, setGamesLoadedCount] = useState<number>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [chess, setChess] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const moveHistoryRef = useRef<string[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [availableMoves, setAvailableMoves] = useState<MoveStats[]>([]);
  const [positionGames, setPositionGames] = useState<Game[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [stockfishEnabled, setStockfishEnabled] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [stockfishAnalysisKey, setStockfishAnalysisKey] = useState<number>(0);

  const exampleUsernames = {
    lichess: ['DrNykterstein', 'penguingim1', 'RebeccaHarris', 'DanielNaroditsky'],
    chesscom: ['MagnusCarlsen', 'Hikaru', 'GothamChess', 'DanielNaroditsky']
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const { toast, dismiss } = useToast();
  const loadingToastId = useRef<string | null>(null);

  useEffect(() => {
    // Show a warning toast on mount
    toast({
      title: "Experimental Page",
      description: "This page is experimental and may have issues. If you encounter any problems, please open an issue on GitHub.",
      variant: "destructive",
      duration: 9000
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousMove();
      } else if (e.key === 'ArrowRight') {
        goToNextMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPosition, moveHistory]);

  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);

  const copyFEN = () => {
    navigator.clipboard.writeText(chess.fen())
      .then(() => {
        setCopySuccess('FEN copied!');
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy FEN: ', err);
      });
  };

  const copyPGN = () => {
    const pgn = moveHistory.map((move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      if (index % 2 === 0) {
        return `${moveNumber}. ${move}`;
      } else {
        return move;
      }
    }).join(' ');
    
    navigator.clipboard.writeText(pgn)
      .then(() => {
        setCopySuccess('PGN copied!');
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy PGN: ', err);
      });
  };

  const fetchRepertoire = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!username) {
      setError("Please enter a username");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGamesLoadedCount(0);
    setDataLoaded(false);
    setFormSubmitted(true);
    setPositionGames([]);
    if (loadingToastId.current) {
      dismiss(loadingToastId.current);
      loadingToastId.current = null;
    }
    
    const currentLoadingToast = toast({
      title: "Loading Games",
      description: `Fetching games for ${username} from ${platform}...`,
      duration: Infinity,
      variant: "default",
    });
    loadingToastId.current = currentLoadingToast.id;
    
    try {
      const url = `/api/chess/games?username=${username}&platform=${platform}&color=${side}&max=-1`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream unavailable");
      
      const decoder = new TextDecoder();
      let data = '';
      let gamesProcessed = false;
      let finalGames: Game[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkText = decoder.decode(value, { stream: true });
        data += chunkText;
        
        const lines = data.split('\n');
        data = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          if (line.startsWith('progress:')) {
            continue; 
          }
          
          if (line.startsWith('totalGames:')) {
            const gamesMatch = line.match(/totalGames:\s*(\d+)/);
            if (gamesMatch && gamesMatch[1]) {
              setGamesLoadedCount(parseInt(gamesMatch[1]));
            }
            continue;
          }
          
          try {
            const jsonData = JSON.parse(line);
            
            if (jsonData.games && Array.isArray(jsonData.games)) {
              const games = jsonData.games;
              finalGames = games;
              setGamesLoadedCount(games.length);
              
              if (!gamesProcessed && games.length >= 10) {
                processGames(games);
                setDataLoaded(true);
                gamesProcessed = true;
              } else if (gamesProcessed) {
                updateGames(games);
              }
              
              if (jsonData.isCompleted) {
                setIsLoading(false);
                
                if (loadingToastId.current) {
                  dismiss(loadingToastId.current);
                  loadingToastId.current = null;
                }

                toast({
                  title: "Analysis Complete",
                  description: `Analyzed ${finalGames.length} games successfully.`,
                  duration: 5000,
                  variant: "default",
                });
              }
            }
          } catch (parseError) {
            console.error("Error parsing JSON line:", parseError, "Line:", line);
          }
        }
      }
      
      if (isLoading) {
        setIsLoading(false);
        if (loadingToastId.current) {
          dismiss(loadingToastId.current);
          loadingToastId.current = null;
        }
        toast({
          title: "Analysis Finished",
          description: `Processed ${finalGames.length} games. Stream ended.`,
          duration: 5000,
          variant: "default",
        });
      }
      
    } catch (err) {
      console.error("Error retrieving games:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching games.");
      setIsLoading(false);
      
      if (loadingToastId.current) {
        dismiss(loadingToastId.current);
        loadingToastId.current = null;
      }

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
      if (loadingToastId.current) {
         dismiss(loadingToastId.current);
         loadingToastId.current = null;
      }
    }
  };

  const updateGames = (games: Game[]) => {
    const sortedGames = [...games].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setPositionGames(sortedGames);
    calculateMovesForPosition(
      sortedGames.filter(game => moveHistoryRef.current.every((move, idx) => game.moves[idx] === move)),
      moveHistoryRef.current.slice(0, moveHistoryRef.current.length)
    );
  };

  const processGames = (games: Game[]) => {
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
        const newHistory = [...moveHistory.slice(0, currentPosition), move];
        moveHistoryRef.current = newHistory;
        setChess(gameCopy);
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

  const handleStockfishMoveSelect = (move: string) => {
    try {
      const gameCopy = new Chess(chess.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        const newHistory = [...moveHistory.slice(0, currentPosition), result.san];
        moveHistoryRef.current = newHistory;
        setChess(gameCopy);
        setMoveHistory(newHistory);
        setCurrentPosition(newHistory.length);
        
        const relevantGames = positionGames.filter(game => 
          newHistory.every((move, index) => game.moves[index] === move)
        );
        
        calculateMovesForPosition(relevantGames, newHistory);
      }
    } catch (err) {
      console.error("Error executing Stockfish move:", err);
    }
  };

  const handleStockfishToggle = () => {
    const newState = !stockfishEnabled;
    setStockfishEnabled(newState);
    if (newState) {
      setStockfishAnalysisKey(prevKey => prevKey + 1);
    }
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
    <div className="container mx-auto px-4 py-8" ref={containerRef}>
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
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
                <div className="flex items-center gap-2">
                  <CardDescription>
                    Move sequence: {moveSequence}
                  </CardDescription>
                  <div className="flex gap-1 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={copyPGN}>
                            <span className="text-xs">Copy PGN</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy move sequence to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={copyFEN}>
                            <span className="text-xs">Copy FEN</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy position FEN to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {copySuccess && (
                      <span className="text-xs text-green-500 ml-2 font-medium">{copySuccess}</span>
                    )}
                  </div>
                </div>
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
            </CardContent>

            <div className="grid grid-cols-3 gap-2 items-center">
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
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-1 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <span className="mr-auto">Stockfish Analysis</span>
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {stockfishEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStockfishToggle}
                    className={stockfishEnabled ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-500" : "bg-green-100 dark:bg-green-900/20"}
                  >
                    {stockfishEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stockfishEnabled ? (
                  <StockfishAnalysis 
                    key={stockfishAnalysisKey}
                    fen={chess.fen()} 
                    onSelectMove={handleStockfishMoveSelect}
                  />
                ) : (
                  <div className="text-center py-2 text-muted-foreground text-sm">
                    Analysis disabled
                  </div>
                )}
              </CardContent>
            </Card>

            {formSubmitted && dataLoaded && (
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
            )}
          </div>

          {formSubmitted && dataLoaded && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Games</CardTitle>
                <CardDescription>
                  Most recent games with this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentGames.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No games found for this position.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {currentGames.slice(0, 3).map((game) => {
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
                    {currentGames.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        + {currentGames.length - 3} more games
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {formSubmitted && dataLoaded && (
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
                clicking on moves or using the arrow keys.
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
                  <h3 className="font-medium mb-1">Engine Evaluation</h3>
                  <p className="text-muted-foreground">
                    Stockfish evaluation shows the best move and score in pawns (e.g., +1.5 means white is ahead by 1.5 pawns). 
                    Positive values favor White, negative values favor Black. 
                    "M" followed by a number indicates a forced checkmate in that many moves.
                    <a href="https://stockfishchess.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      Powered by Stockfish.
                    </a>
                  </p>
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground mt-6">
                This page is inspired by <a href="https://openingtree.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  OpeningTree.com
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}