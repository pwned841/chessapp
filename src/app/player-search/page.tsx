'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, ChevronDown, AlertCircle, Loader2, ArrowUpRight, Trophy, Clock, User, Calendar, MapPin, BarChart2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Type definitions for API responses
interface ChesscomProfile {
  avatar?: string;
  username: string;
  name?: string;
  status?: string;
  title?: string;
  last_online?: number; // Timestamp
  location?: string;
  joined?: number; // Timestamp
  followers?: number;
}

interface ChesscomRating {
  last?: {
    rating?: number;
  };
  best?: {
    rating?: number;
  };
  record?: {
    win: number;
    loss: number;
    draw: number;
  };
}

interface ChesscomStats {
  [key: string]: ChesscomRating;
}

interface ChesscomGamePlayer {
  username: string;
  result: string;
}

interface ChesscomGame {
  url: string;
  end_time: number; // Timestamp
  time_control: string;
  white: ChesscomGamePlayer;
  black: ChesscomGamePlayer;
}

interface ChesscomData {
  profile: ChesscomProfile;
  stats?: ChesscomStats;
  recentGames?: ChesscomGame[];
}

interface LichessProfile {
  username: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    location?: string;
    picture?: string;
  };
  createdAt?: number; // Assuming timestamp
  patron?: boolean;
  title?: string;
  playTime?: {
    total?: number; // Assuming seconds
  };
  count?: {
    all?: number;
  };
  perfs?: {
    [key: string]: {
      rating: number;
      prog?: number;
      games: number;
      rd?: number;
    };
  };
}

interface LichessGamePlayer {
  user?: {
    name?: string;
  };
}

interface LichessGame {
  id: string;
  createdAt: number; // Assuming timestamp
  players: {
    white: LichessGamePlayer;
    black: LichessGamePlayer;
  };
  winner?: 'white' | 'black';
  clock: {
    initial: number;
    increment: number;
  };
  variant: string;
}

interface LichessData {
  profile: LichessProfile;
  recentGames?: LichessGame[];
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

export default function PlayerSearchPage() {
  const [activeTab, setActiveTab] = useState('fide');
  const [chesscomUsername, setChesscomUsername] = useState('');
  const [lichessUsername, setLichessUsername] = useState('');

  // States for Chess.com player data
  const [chesscomData, setChesscomData] = useState<ChesscomData | null>(null);
  const [chesscomLoading, setChesscomLoading] = useState(false);
  const [chesscomError, setChesscomError] = useState<string | null>(null);

  // States for Lichess player data
  const [lichessData, setLichessData] = useState<LichessData | null>(null);
  const [lichessLoading, setLichessLoading] = useState(false);
  const [lichessError, setLichessError] = useState<string | null>(null);

  const topPlayers = [
    { rank: 1, name: "Carlsen, Magnus", country: "NOR", rating: 2837, birthYear: 1990 },
    { rank: 2, name: "Nakamura, Hikaru", country: "USA", rating: 2804, birthYear: 1987 },
    { rank: 3, name: "Gukesh D", country: "IND", rating: 2787, birthYear: 2006 },
    { rank: 4, name: "Erigaisi Arjun", country: "IND", rating: 2782, birthYear: 2003 },
    { rank: 5, name: "Caruana, Fabiano", country: "USA", rating: 2776, birthYear: 1992 },
    { rank: 6, name: "Abdusattorov, Nodirbek", country: "UZB", rating: 2773, birthYear: 2004 },
    { rank: 7, name: "Praggnanandhaa R", country: "IND", rating: 2758, birthYear: 2005 },
    { rank: 8, name: "Wei, Yi", country: "CHN", rating: 2758, birthYear: 1999 },
    { rank: 9, name: "Nepomniachtchi, Ian", country: "RUS", rating: 2757, birthYear: 1990 },
    { rank: 10, name: "Firouzja, Alireza", country: "FRA", rating: 2757, birthYear: 2003 }
  ];
  
  const getFlagUrl = (countryCode) => {
    return `https://ratings.fide.com/svg/${countryCode}.svg`;
  };
  
  const handleChesscomSearch = async (e) => {
    e.preventDefault();
    if (chesscomUsername.trim()) {
      setChesscomLoading(true);
      setChesscomError(null);
      setChesscomData(null);
      
      try {
        const response = await fetch(`/api/chesscom/${chesscomUsername.trim()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch Chess.com user data');
        }
        
        setChesscomData(data);
      } catch (error) {
        setChesscomError(error.message);
      } finally {
        setChesscomLoading(false);
      }
    }
  };
  
  const handleLichessSearch = async (e) => {
    e.preventDefault();
    if (lichessUsername.trim()) {
      setLichessLoading(true);
      setLichessError(null);
      setLichessData(null);
      
      try {
        const response = await fetch(`/api/lichess/${lichessUsername.trim()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch Lichess user data');
        }
        
        setLichessData(data);
      } catch (error) {
        setLichessError(error.message);
      } finally {
        setLichessLoading(false);
      }
    }
  };

  const handleChesscomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleChesscomSearch(e);
    }
  };

  const handleLichessKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLichessSearch(e);
    }
  };

  // Helper function to format ratings
  const formatRating = (rating) => {
    return rating ? rating.toString() : 'N/A';
  };

  // Helper function to get time control display name and format it
  const getTimeControlName = (key) => {
    const nameMap = {
      'chess_bullet': 'Bullet',
      'chess_blitz': 'Blitz',
      'chess_rapid': 'Rapid',
      'chess_daily': 'Daily',
      'chess960_daily': 'Chess960',
      'tactics': 'Tactics',
      'lessons': 'Lessons',
      'puzzle_rush': 'Puzzle Rush'
    };
    return nameMap[key] || key;
  };
  
  // Helper function to format time control (convert to minutes if needed)
  const formatTimeControl = (timeControl) => {
    if (!timeControl) return 'N/A';
    
    // Format like "60+0" to "1 min"
    if (timeControl.includes('+')) {
      const parts = timeControl.split('+');
      const baseTime = parseInt(parts[0]);
      const increment = parseInt(parts[1]);
      
      if (baseTime >= 60) {
        const minutes = Math.floor(baseTime / 60);
        return `${minutes} min${increment > 0 ? ` + ${increment}s` : ''}`;
      }
      return `${baseTime}s${increment > 0 ? ` + ${increment}s` : ''}`;
    }
    
    return timeControl;
  };

  // Helper to generate rating trend styles and icons
  const getRatingTrendInfo = (prog) => {
    if (!prog) return { color: 'text-gray-400', icon: null, text: '' };
    
    if (prog > 0) {
      return { 
        color: 'text-green-500', 
        icon: <span className="inline-block transform rotate-45">→</span>, 
        text: `+${prog}` 
      };
    } else if (prog < 0) {
      return { 
        color: 'text-red-500', 
        icon: <span className="inline-block transform -rotate-45">→</span>, 
        text: `${prog}` 
      };
    }
    
    return { color: 'text-gray-400', icon: <span>→</span>, text: '0' };
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Chess Player Search
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search our database of 1.5 million FIDE players and find comprehensive profiles with ratings, statistics, and online accounts.
          </p>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-4xl mx-auto mb-16 flex justify-center"
        >
          <Card className="w-full border-slate-200 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-center">Find Players</CardTitle>
              <CardDescription className="text-center">
                Search players across major chess platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="fide" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="fide" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">FIDE</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">1.5M+</Badge>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="chesscom" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                    <div className="flex items-center gap-2">
                      <Image src="/chesscom.png" alt="Chess.com" width={20} height={20} />
                      <span>Chess.com</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="lichess" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                    <div className="flex items-center gap-2">
                      <Image src="/lichessorg.png" alt="Lichess.org" width={20} height={20} />
                      <span>Lichess</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="fide" className="mt-0">
                  <div className="mb-4 flex justify-center">
                    <div className="w-full max-w-md">
                      <SearchBar />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 text-center">
                    Search by name or FIDE ID to find player profiles
                  </div>
                </TabsContent>
                
                <TabsContent value="chesscom" className="mt-0">
                  <form onSubmit={handleChesscomSearch} className="w-full">
                    <div className="flex justify-center mb-4">
                      <div className="w-full max-w-md relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute w-5 h-5 left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="text"
                            value={chesscomUsername}
                            onChange={(e) => setChesscomUsername(e.target.value)}
                            onKeyDown={handleChesscomKeyDown}
                            className="w-full bg-white placeholder:text-slate-400 text-slate-900 text-sm rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter Chess.com username..."
                          />
                        </div>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg w-24"
                          disabled={chesscomLoading}
                        >
                          {chesscomLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 text-center">
                      Enter a Chess.com username to view their profile and statistics
                    </div>
                  </form>
                  
                  {/* Chess.com Results */}
                  {chesscomError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{chesscomError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {chesscomData && (
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      variants={staggerContainer}
                      className="mt-6 border-t border-gray-200 pt-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Player Profile Card */}
                        <motion.div variants={cardVariants}>
                          <Card className="border-slate-200">
                            <CardHeader className="pb-2 space-y-0">
                              <div className="flex items-center gap-4">
                                <motion.div 
                                  variants={popIn} 
                                  className="h-16 w-16 relative rounded-full overflow-hidden"
                                >
                                  {chesscomData.profile.avatar ? (
                                    <Image 
                                      src={chesscomData.profile.avatar}
                                      alt={chesscomData.profile.username}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-800 text-lg font-bold">
                                      {chesscomData.profile.username.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </motion.div>
                                <div>
                                  <div className="flex flex-col">
                                    <motion.div variants={slideIn}>
                                      <CardTitle className="text-xl">{chesscomData.profile.username}</CardTitle>
                                    </motion.div>
                                    <motion.div variants={slideIn}>
                                      <CardDescription>
                                        {chesscomData.profile.name || 'Chess.com Player'}
                                      </CardDescription>
                                    </motion.div>
                                  </div>
                                  <motion.div variants={slideIn} className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Chess.com</Badge>
                                    {chesscomData.profile.status === "premium" && (
                                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">Premium</Badge>
                                    )}
                                    {chesscomData.profile.title && (
                                      <Badge variant="outline" className="font-semibold text-blue-700">{chesscomData.profile.title}</Badge>
                                    )}
                                  </motion.div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                              <motion.div variants={fadeIn} className="flex flex-col space-y-3">
                                {chesscomData.profile.last_online && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Last online: {new Date(chesscomData.profile.last_online * 1000).toLocaleDateString()}</span>
                                  </div>
                                )}
                                
                                {chesscomData.profile.location && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{chesscomData.profile.location}</span>
                                  </div>
                                )}
                                
                                {chesscomData.profile.joined && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Member since: {new Date(chesscomData.profile.joined * 1000).toLocaleDateString()}</span>
                                  </div>
                                )}
                                
                                {chesscomData.profile.followers && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Followers: {chesscomData.profile.followers.toLocaleString()}</span>
                                  </div>
                                )}
                              </motion.div>
                              
                              <motion.div variants={fadeIn} className="pt-2">
                                <a 
                                  href={`https://www.chess.com/member/${chesscomData.profile.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                  View on Chess.com
                                  <ArrowUpRight className="h-3 w-3 ml-1" />
                                </a>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        
                        {/* Ratings Card */}
                        <motion.div variants={cardVariants} className="col-span-1 lg:col-span-2">
                          <Card className="border-slate-200 h-full">
                            <CardHeader className="pb-2">
                              <motion.div variants={slideIn}>
                                <CardTitle className="flex items-center">
                                  <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                                  Ratings
                                </CardTitle>
                              </motion.div>
                              <motion.div variants={slideIn}>
                                <CardDescription>Performance across different time controls</CardDescription>
                              </motion.div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                              {chesscomData.stats && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.keys(chesscomData.stats).map((key, index) => {
                                    const stats = chesscomData.stats; // Ensure stats is defined in this scope
                                    if (!stats) return null; // Should not happen due to outer check, but satisfies TS

                                    if (key.startsWith('chess_') || key === 'fide') {
                                      const data = stats[key];
                                      if (!data.last || !data.last.rating) return null;
                                      
                                      const bestRating = data.best ? data.best.rating : null;
                                      
                                      return (
                                        <motion.div
                                          key={key}
                                          variants={popIn}
                                          custom={index}
                                          className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <div className="text-sm font-medium text-gray-700">{getTimeControlName(key)}</div>
                                            <div className="text-2xl font-bold text-gray-900">{data.last.rating}</div>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <div className="text-gray-500">
                                              {data.record && `${data.record.win}W / ${data.record.loss}L / ${data.record.draw}D`}
                                            </div>
                                            {bestRating && (
                                              <div className="text-blue-600">
                                                Best: {bestRating}
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                        
                        {/* Recent Games Card */}
                        {chesscomData.recentGames && chesscomData.recentGames.length > 0 && (
                          <motion.div variants={cardVariants} className="col-span-1 lg:col-span-3">
                            <Card className="border-slate-200">
                              <CardHeader className="pb-2">
                                <motion.div variants={slideIn}>
                                  <CardTitle className="flex items-center">
                                    <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                                    Recent Games
                                  </CardTitle>
                                </motion.div>
                                <motion.div variants={slideIn}>
                                  <CardDescription>Last 5 games played on Chess.com</CardDescription>
                                </motion.div>
                              </CardHeader>
                              <CardContent className="pt-4 px-0">
                                <div className="overflow-x-auto w-full">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b border-gray-200">
                                        <th className="py-2 px-6 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Opponent</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Result</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Time Control</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {chesscomData.recentGames.slice(0, 5).map((game, index) => {
                                        const playerColor = game.white.username.toLowerCase() === chesscomData.profile.username.toLowerCase() ? 'white' : 'black';
                                        const opponent = playerColor === 'white' ? game.black : game.white;
                                        const result = game.white.result === 'win' 
                                          ? (playerColor === 'white' ? 'Win' : 'Loss')
                                          : game.black.result === 'win'
                                            ? (playerColor === 'black' ? 'Win' : 'Loss')
                                            : 'Draw';
                                        
                                        const resultClass = result === 'Win' 
                                          ? 'bg-green-100 text-green-800 border-green-200' 
                                          : result === 'Loss' 
                                            ? 'bg-red-100 text-red-800 border-red-200' 
                                            : 'bg-gray-100 text-gray-800 border-gray-200';
                                        
                                        return (
                                          <motion.tr 
                                            key={index} 
                                            variants={fadeIn}
                                            custom={index}
                                            className={index % 2 === 0 ? "" : "bg-gray-50"}
                                          >
                                            <td className="py-3 px-6 text-xs text-gray-900">
                                              {new Date(game.end_time * 1000).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="flex items-center">
                                                <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center text-xs mr-2 border border-gray-200">
                                                  {opponent.username.charAt(0).toUpperCase()}
                                                </div>
                                                <a 
                                                  href={`https://www.chess.com/member/${opponent.username}`} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-gray-900 hover:text-blue-600"
                                                >
                                                  {opponent.username}
                                                </a>
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <Badge variant="outline" className={`${resultClass}`}>
                                                {result} as {playerColor.charAt(0).toUpperCase()}
                                              </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                              {formatTimeControl(game.time_control)}
                                            </td>
                                            <td className="py-3 px-4">
                                              <a 
                                                href={game.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center"
                                              >
                                                View
                                                <ArrowUpRight className="h-3 w-3 ml-1" />
                                              </a>
                                            </td>
                                          </motion.tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </TabsContent>
                
                <TabsContent value="lichess" className="mt-0">
                  <form onSubmit={handleLichessSearch} className="w-full">
                    <div className="flex justify-center mb-4">
                      <div className="w-full max-w-md relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute w-5 h-5 left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="text"
                            value={lichessUsername}
                            onChange={(e) => setLichessUsername(e.target.value)}
                            onKeyDown={handleLichessKeyDown}
                            className="w-full bg-white placeholder:text-slate-400 text-slate-900 text-sm rounded-lg pl-10 pr-4 py-2.5 border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                            placeholder="Enter Lichess username..."
                          />
                        </div>
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg w-24"
                          disabled={lichessLoading}
                        >
                          {lichessLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 text-center">
                      Enter a Lichess.org username to view their profile and statistics
                    </div>
                  </form>
                  
                  {/* Lichess Results */}
                  {lichessError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{lichessError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {lichessData && (
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      variants={staggerContainer}
                      className="mt-6 border-t border-gray-200 pt-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Player Profile Card */}
                        <motion.div variants={cardVariants}>
                          <Card className="border-slate-200">
                            <CardHeader className="pb-2 space-y-0">
                              <div className="flex items-center gap-4">
                                <motion.div 
                                  variants={popIn} 
                                  className="h-16 w-16 relative rounded-full overflow-hidden"
                                >
                                  {lichessData.profile.profile?.picture ? (
                                    <Image 
                                      src={lichessData.profile.profile.picture}
                                      alt={lichessData.profile.username}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-800 text-lg font-bold">
                                      {lichessData.profile.username.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </motion.div>
                                <div>
                                  <div className="flex flex-col">
                                    <motion.div variants={slideIn}>
                                      <CardTitle className="text-xl">{lichessData.profile.username}</CardTitle>
                                    </motion.div>
                                    <motion.div variants={slideIn}>
                                      <CardDescription>
                                        {lichessData.profile.profile?.firstName && lichessData.profile.profile?.lastName
                                          ? `${lichessData.profile.profile.firstName} ${lichessData.profile.profile.lastName}`
                                          : 'Lichess Player'
                                        }
                                      </CardDescription>
                                    </motion.div>
                                  </div>
                                  <motion.div variants={slideIn} className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">Lichess</Badge>
                                    {lichessData.profile.patron && (
                                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">Patron</Badge>
                                    )}
                                    {lichessData.profile.title && (
                                      <Badge variant="outline" className="font-semibold text-green-700">{lichessData.profile.title}</Badge>
                                    )}
                                  </motion.div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                              <motion.div variants={fadeIn} className="flex flex-col space-y-3">
                                {lichessData.profile.createdAt && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Member since: {new Date(lichessData.profile.createdAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                                
                                {lichessData.profile.profile?.location && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{lichessData.profile.profile.location}</span>
                                  </div>
                                )}
                                
                                {lichessData.profile.playTime?.total && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Playing time: {Math.floor(lichessData.profile.playTime.total / 3600)} hours</span>
                                  </div>
                                )}
                                
                                {lichessData.profile.count?.all && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <BarChart2 className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Total games: {lichessData.profile.count.all.toLocaleString()}</span>
                                  </div>
                                )}
                              </motion.div>
                              
                              <motion.div variants={fadeIn} className="pt-2">
                                <a 
                                  href={`https://lichess.org/@/${lichessData.profile.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                                >
                                  View on Lichess.org
                                  <ArrowUpRight className="h-3 w-3 ml-1" />
                                </a>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        
                        {/* Ratings Card */}
                        <motion.div variants={cardVariants} className="col-span-1 lg:col-span-2">
                          <Card className="border-slate-200 h-full">
                            <CardHeader className="pb-2">
                              <motion.div variants={slideIn}>
                                <CardTitle className="flex items-center">
                                  <Trophy className="h-5 w-5 mr-2 text-green-600" />
                                  Ratings
                                </CardTitle>
                              </motion.div>
                              <motion.div variants={slideIn}>
                                <CardDescription>Performance across different variants</CardDescription>
                              </motion.div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lichessData.profile.perfs && Object.keys(lichessData.profile.perfs).map((key, index) => {
                                  const perf = lichessData.profile.perfs![key]; // Use non-null assertion as we checked perfs exists
                                  // Skip perfs without ratings or rarely played variants
                                  if (!perf.rating || ['streak', 'puzzle', 'storm', 'racer'].includes(key)) return null;
                                    
                                  const trend = getRatingTrendInfo(perf.prog);
                                    
                                  return (
                                    <motion.div
                                      key={key}
                                      variants={popIn}
                                      custom={index}
                                      className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors"
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <div className="text-sm font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                        <div className="flex items-center gap-1">
                                          <div className="text-2xl font-bold text-gray-900">{perf.rating}</div>
                                          {perf.prog && (
                                            <div className={`text-xs ${trend.color} ml-1`}>
                                              {trend.icon} {trend.text}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center text-xs">
                                        <div className="text-gray-500">
                                          {perf.games > 0 && `${perf.games} games`}
                                        </div>
                                        {perf.rd && (
                                          <div className="text-gray-500">
                                            RD: {perf.rd}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        
                        {/* Recent Games Card */}
                        {lichessData.recentGames && lichessData.recentGames.length > 0 && (
                          <motion.div variants={cardVariants} className="col-span-1 lg:col-span-3">
                            <Card className="border-slate-200">
                              <CardHeader className="pb-2">
                                <motion.div variants={slideIn}>
                                  <CardTitle className="flex items-center">
                                    <BarChart2 className="h-5 w-5 mr-2 text-green-600" />
                                    Recent Games
                                  </CardTitle>
                                </motion.div>
                                <motion.div variants={slideIn}>
                                  <CardDescription>Last 5 games played on Lichess.org</CardDescription>
                                </motion.div>
                              </CardHeader>
                              <CardContent className="pt-4 px-0">
                                <div className="overflow-x-auto w-full">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b border-gray-200">
                                        <th className="py-2 px-6 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Opponent</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Result</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Time Control</th>
                                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {lichessData.recentGames.slice(0, 5).map((game, index) => {
                                        const playerColor = game.players.white.user?.name === lichessData.profile.username ? 'white' : 'black';
                                        const opponent = playerColor === 'white' ? game.players.black : game.players.white;
                                        
                                        let result = 'Draw';
                                        if (game.winner) {
                                          result = game.winner === playerColor ? 'Win' : 'Loss';
                                        }
                                        
                                        const resultClass = result === 'Win' 
                                          ? 'bg-green-100 text-green-800 border-green-200' 
                                          : result === 'Loss' 
                                            ? 'bg-red-100 text-red-800 border-red-200' 
                                            : 'bg-gray-100 text-gray-800 border-gray-200';
                                        
                                        return (
                                          <motion.tr 
                                            key={index} 
                                            variants={fadeIn}
                                            custom={index}
                                            className={index % 2 === 0 ? "" : "bg-gray-50"}
                                          >
                                            <td className="py-3 px-6 text-xs text-gray-900">
                                              {new Date(game.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="flex items-center">
                                                <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center text-xs mr-2 border border-gray-200">
                                                  {opponent.user?.name ? opponent.user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <a 
                                                  href={opponent.user?.name ? `https://lichess.org/@/${opponent.user.name}` : '#'}
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-gray-900 hover:text-green-600"
                                                >
                                                  {opponent.user?.name || 'Anonymous'}
                                                </a>
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <Badge variant="outline" className={`${resultClass}`}>
                                                {result} as {playerColor.charAt(0).toUpperCase()}
                                              </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                              {formatTimeControl(`${game.clock.initial}+${game.clock.increment}`)} {game.variant !== 'standard' ? game.variant : ''}
                                            </td>
                                            <td className="py-3 px-4">
                                              <a 
                                                href={`https://lichess.org/${game.id}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-green-600 hover:text-green-800 inline-flex items-center"
                                              >
                                                View
                                                <ArrowUpRight className="h-3 w-3 ml-1" />
                                              </a>
                                            </td>
                                          </motion.tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Rated Players</h2>
          
          <Card className="border-slate-200 shadow-md mb-12">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">#</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">Federation</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Rating</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Birth Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.map((player, index) => (
                      <tr 
                        key={index} 
                        className={index % 2 === 0 ? "hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">{player.rank}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          <Link href={`/player/${player.name.replace(', ', '-').toLowerCase()}`} className="hover:text-purple-700">
                            {player.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center items-center gap-2">
                            <Image
                              src={getFlagUrl(player.country)}
                              alt={`${player.country} flag`}
                              width={24}
                              height={16}
                              className="object-cover"
                            />
                            <span className="text-sm text-gray-900">{player.country}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{player.rating}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">{player.birthYear}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>About Player Search</CardTitle>
              <CardDescription>Find detailed information about chess players</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our Chess Player Search tool allows you to find detailed information about chess players from multiple sources. You can search for players in three different ways:
              </p>
              
              <div className="pl-5 border-l-2 border-purple-200">
                <h3 className="font-semibold mb-1">FIDE Database</h3>
                <p className="text-sm mb-3 text-gray-600">
                  Search our comprehensive database of over 1.5 million FIDE-registered players. Get access to their official ratings, tournament history, and performance statistics.
                </p>
                
                <h3 className="font-semibold mb-1">Chess.com Players</h3>
                <p className="text-sm mb-3 text-gray-600">
                  Enter a Chess.com username to access their online profile information, including ratings across different time controls, win/loss statistics, and game history.
                </p>
                
                <h3 className="font-semibold mb-1">Lichess.org Players</h3>
                <p className="text-sm text-gray-600">
                  Search for Lichess.org players to view their ratings, performance in different variants, and recent game statistics.
                </p>
              </div>
              
              <Separator />
              
              <p className="text-gray-700">
                The Top Rated Players table shows the current world rankings based on the latest FIDE classical ratings. These players represent the absolute elite of chess, competing at the highest level in international tournaments around the world.
              </p>
              
              <p className="text-gray-700">
                Whether you're researching top grandmasters, checking your own rating, or looking up friends and competitors, our search tools provide a convenient way to access player information from the most popular chess platforms in one place.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}