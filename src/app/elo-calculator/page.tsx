"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, RefreshCw, Calculator } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function getWinProbability(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

const kOptions = [
  { value: 40, label: "40 - New player" },
  { value: 30, label: "30 - U2000 (classical)" },
  { value: 20, label: "20 - Standard" },
  { value: 10, label: "10 - Elite (2400+)" },
];

export default function EloCalculatorPage() {
  // Time control
  const [timeControl, setTimeControl] = useState<"standard" | "rapid" | "blitz">("standard");

  // Player 1
  const [player1, setPlayer1] = useState({ name: "", rating: 1500, k: 20 });
  const [search1, setSearch1] = useState("");
  const [results1, setResults1] = useState<any[]>([]);
  const [loading1, setLoading1] = useState(false);
  const input1 = useRef<HTMLInputElement>(null);

  // Player 2
  const [player2, setPlayer2] = useState({ name: "", rating: 1500, k: 20 });
  const [search2, setSearch2] = useState("");
  const [results2, setResults2] = useState<any[]>([]);
  const [loading2, setLoading2] = useState(false);
  const input2 = useRef<HTMLInputElement>(null);

  // Match
  const [result, setResult] = useState<null | 1 | 0.5 | 0>(null);
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Tournament state
  const [tournamentTab, setTournamentTab] = useState<'match'|'tournament'>("match");
  const [mainPlayer, setMainPlayer] = useState({ name: "", rating: 1500, k: 20 });
  const [mainPlayerSearch, setMainPlayerSearch] = useState("");
  const [mainPlayerResults, setMainPlayerResults] = useState<any[]>([]);
  const [mainPlayerLoading, setMainPlayerLoading] = useState(false);
  const [tournamentTimeControl, setTournamentTimeControl] = useState<"standard"|"rapid"|"blitz">("standard");
  const [opponents, setOpponents] = useState<Array<{ name: string, rating: number, result: 1|0.5|0 }>>([]);
  const [opponentSearch, setOpponentSearch] = useState("");
  const [opponentResults, setOpponentResults] = useState<any[]>([]);
  const [opponentLoading, setOpponentLoading] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [opponentRating, setOpponentRating] = useState(1500);
  const [opponentResult, setOpponentResult] = useState<1|0.5|0>(1);
  const [tournamentShow, setTournamentShow] = useState(false);

  // Search FIDE
  async function searchFide(q: string, setter: any, setLoading: any) {
    if (!q.trim() || q.length < 3) return;
    setLoading(true);
    setter([]);
    try {
      const res = await fetch(`/api/players/search?query=${encodeURIComponent(q)}&type=${timeControl}`);
      const data = await res.json();
      if (data.players && data.players.length > 0) setter(data.players.slice(0, 5));
      else setter([]);
    } catch {
      setter([]);
    } finally {
      setLoading(false);
    }
  }

  // Elo calculation
  function calculateElo(p1: typeof player1, p2: typeof player2, res: 1 | 0.5 | 0) {
    const expected1 = getWinProbability(p1.rating, p2.rating);
    const expected2 = getWinProbability(p2.rating, p1.rating);
    const change1 = Math.round(p1.k * (res - expected1));
    const change2 = Math.round(p2.k * ((1 - res) - expected2));
    return {
      player1: { ...p1, expected: expected1, newRating: p1.rating + change1, change: change1 },
      player2: { ...p2, expected: expected2, newRating: p2.rating + change2, change: change2 },
    };
  }

  // Tournament Elo calculation
  function calculateTournamentElo(player: typeof mainPlayer, opps: typeof opponents) {
    let totalChange = 0;
    let currentRating = player.rating;
    const k = player.k;
    const details = opps.map(opp => {
      const expected = getWinProbability(currentRating, opp.rating);
      const change = Math.round(k * (opp.result - expected));
      const before = currentRating;
      currentRating += change;
      totalChange += change;
      return { ...opp, expected, change, before, after: currentRating };
    });
    return { totalChange, newRating: currentRating, details };
  }

  // Handlers
  function handleSelectPlayer(p: any, setPlayer: any, setSearch: any, setResults: any) {
    setPlayer({
      name: p.name,
      rating: timeControl === "blitz" ? p.blitz_rating : timeControl === "rapid" ? p.rapid_rating : p.rating,
      k: 20,
    });
    setSearch(p.name);
    setResults([]);
  }

  function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>, search: string, setter: any, setLoading: any) {
    if (e.key === "Enter") searchFide(search, setter, setLoading);
  }

  // UI
  const canCalculate = player1.name && player2.name && result !== null;
  const calc = canCalculate ? calculateElo(player1, player2, result as 1 | 0.5 | 0) : null;

  return (
    <>
      <div className="max-w-3xl mx-auto py-10 px-2 md:px-0">
        <Tabs defaultValue="match" value={tournamentTab} onValueChange={v => setTournamentTab(v as any)} className="mb-8">
          <TabsList className="w-full flex justify-center mb-6">
            <TabsTrigger value="match">Single Match</TabsTrigger>
          <TabsTrigger value="tournament">Tournament</TabsTrigger>
        </TabsList>
        <TabsContent value="match">
          <Card className="shadow-xl border-2 border-purple-100 bg-white/90">
            <CardHeader>
              <CardTitle className="text-3xl text-purple-700 font-bold text-center">Elo Match Calculator</CardTitle>
              <CardDescription className="text-center text-gray-600">Calculate FIDE Elo changes for any two players</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Time control selector */}
              <div className="flex flex-col items-center gap-2 mb-8">
                <Label className="text-lg text-purple-700 font-semibold">Time Control</Label>
                <Select value={timeControl} onValueChange={v => setTimeControl(v as any)}>
                  <SelectTrigger className="w-48 bg-purple-50 border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Classical)</SelectItem>
                    <SelectItem value="rapid">Rapid</SelectItem>
                    <SelectItem value="blitz">Blitz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Player 1 */}
                <Card className="border border-purple-100 bg-white/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-purple-700">Player 1</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Label>Search FIDE Player</Label>
                    <div className="relative flex gap-2">
                      <Input ref={input1} value={search1} onChange={e => setSearch1(e.target.value)}
                        onKeyDown={e => handleInputKey(e, search1, setResults1, setLoading1)}
                        placeholder="Name (min 3 letters)" className="bg-purple-50" />
                      <Button variant="outline" onClick={() => searchFide(search1, setResults1, setLoading1)} disabled={loading1}>
                        {loading1 ? <RefreshCw className="animate-spin" /> : <Search />}
                      </Button>
                      <AnimatePresence>
                        {results1.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 top-full mt-1 w-full z-30 border rounded-md bg-white shadow animate-fade-in">
                            <Table>
                              <TableBody>
                                {results1.map((p, i) => (
                                  <TableRow key={i} className="hover:bg-purple-50 cursor-pointer" onClick={() => handleSelectPlayer(p, setPlayer1, setSearch1, setResults1)}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{p.title || ""}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{timeControl === "blitz" ? p.blitz_rating : timeControl === "rapid" ? p.rapid_rating : p.rating}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <Input value={player1.name} onChange={e => setPlayer1({ ...player1, name: e.target.value })} className="bg-purple-50" />
                    <Label className="text-xs text-gray-500">Rating</Label>
                    <Input type="number" value={player1.rating} onChange={e => setPlayer1({ ...player1, rating: parseInt(e.target.value) || 0 })} className="bg-purple-50" />
                    <Label className="text-xs text-gray-500">K Factor</Label>
                    <Select value={player1.k.toString()} onValueChange={v => setPlayer1({ ...player1, k: parseInt(v) })}>
                      <SelectTrigger className="bg-purple-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kOptions.map(opt => <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                {/* Player 2 */}
                <Card className="border border-purple-100 bg-white/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-purple-700">Player 2</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Label>Search FIDE Player</Label>
                    <div className="relative flex gap-2">
                      <Input ref={input2} value={search2} onChange={e => setSearch2(e.target.value)}
                        onKeyDown={e => handleInputKey(e, search2, setResults2, setLoading2)}
                        placeholder="Name (min 3 letters)" className="bg-purple-50" />
                      <Button variant="outline" onClick={() => searchFide(search2, setResults2, setLoading2)} disabled={loading2}>
                        {loading2 ? <RefreshCw className="animate-spin" /> : <Search />}
                      </Button>
                      <AnimatePresence>
                        {results2.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 top-full mt-1 w-full z-30 border rounded-md bg-white shadow animate-fade-in">
                            <Table>
                              <TableBody>
                                {results2.map((p, i) => (
                                  <TableRow key={i} className="hover:bg-purple-50 cursor-pointer" onClick={() => handleSelectPlayer(p, setPlayer2, setSearch2, setResults2)}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{p.title || ""}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{timeControl === "blitz" ? p.blitz_rating : timeControl === "rapid" ? p.rapid_rating : p.rating}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <Input value={player2.name} onChange={e => setPlayer2({ ...player2, name: e.target.value })} className="bg-purple-50" />
                    <Label className="text-xs text-gray-500">Rating</Label>
                    <Input type="number" value={player2.rating} onChange={e => setPlayer2({ ...player2, rating: parseInt(e.target.value) || 0 })} className="bg-purple-50" />
                    <Label className="text-xs text-gray-500">K Factor</Label>
                    <Select value={player2.k.toString()} onValueChange={v => setPlayer2({ ...player2, k: parseInt(v) })}>
                      <SelectTrigger className="bg-purple-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kOptions.map(opt => <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {/* Match result selector */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                <Label className="text-lg text-purple-700 font-semibold">Match Result</Label>
                <Select value={result === null ? "" : result.toString()} onValueChange={v => setResult(parseFloat(v) as 1 | 0.5 | 0)}>
                  <SelectTrigger className="w-32 bg-purple-50 border-purple-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Player 1 wins</SelectItem>
                    <SelectItem value="0.5">Draw</SelectItem>
                    <SelectItem value="0">Player 2 wins</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6" size="lg" disabled={!canCalculate} onClick={() => setShow(true)}>
                  <Calculator className="mr-2" /> Calculate
                </Button>
              </div>

              {/* Result card */}
              <AnimatePresence>
                {show && canCalculate && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                    <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 shadow-2xl mb-8">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-purple-700 font-bold">Elo Change Result</CardTitle>
                          <CardDescription className="text-gray-600">{player1.name} vs {player2.name} ({timeControl.charAt(0).toUpperCase() + timeControl.slice(1)})</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-purple-600" onClick={() => setShowDetails(v => !v)}>
                          <span className="mr-1">Details</span>
                          <motion.span animate={{ rotate: showDetails ? 180 : 0 }}><ChevronDown /></motion.span>
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-purple-700">{player1.name}</span>
                              <span className="text-xs bg-purple-100 text-purple-700 rounded px-2 py-0.5">K={player1.k}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 text-sm">Initial: <span className="font-semibold text-gray-800">{player1.rating}</span></span>
                              <span className="text-gray-500 text-sm">New: <span className="font-semibold text-green-700">{calc!.player1.newRating}</span></span>
                              <span className="text-gray-500 text-sm">Change: <span className={`font-semibold ${calc!.player1.change > 0 ? "text-green-700" : calc!.player1.change < 0 ? "text-red-600" : "text-gray-700"}`}>{calc!.player1.change > 0 ? "+" : ""}{calc!.player1.change}</span></span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-purple-700">{player2.name}</span>
                              <span className="text-xs bg-purple-100 text-purple-700 rounded px-2 py-0.5">K={player2.k}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 text-sm">Initial: <span className="font-semibold text-gray-800">{player2.rating}</span></span>
                              <span className="text-gray-500 text-sm">New: <span className="font-semibold text-green-700">{calc!.player2.newRating}</span></span>
                              <span className="text-gray-500 text-sm">Change: <span className={`font-semibold ${calc!.player2.change > 0 ? "text-green-700" : calc!.player2.change < 0 ? "text-red-600" : "text-gray-700"}`}>{calc!.player2.change > 0 ? "+" : ""}{calc!.player2.change}</span></span>
                            </div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {showDetails && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 bg-white border rounded-lg p-4 shadow-inner">
                              <div className="text-sm text-gray-700 space-y-2">
                                <div className="font-semibold text-purple-700 mb-2">Calculation Details</div>
                                <div><b>Expected score (Player 1):</b> {calc!.player1.expected.toFixed(3)}</div>
                                <div><b>Expected score (Player 2):</b> {calc!.player2.expected.toFixed(3)}</div>
                                <div><b>Formula:</b> <span className="font-mono">new_rating = old_rating + K × (score - expected)</span></div>
                                <div><b>How expected score is calculated:</b> <span className="font-mono">1 / (1 + 10^((opponent_rating - player_rating)/400))</span></div>
                                <div><b>Win probability (Player 1):</b> {(calc!.player1.expected * 100).toFixed(1)}%</div>
                                <div><b>Win probability (Player 2):</b> {(calc!.player2.expected * 100).toFixed(1)}%</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tournament">
          <Card className="shadow-xl border-2 border-purple-100 bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700 font-bold text-center">Tournament Elo Calculator</CardTitle>
              <CardDescription className="text-center text-gray-600">Enter all your results for a tournament and get your total Elo change</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Main player and time control */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-center">
                <div className="flex-1">
                  <Label className="text-sm text-purple-700">Your Name (FIDE search)</Label>
                  <div className="relative flex gap-2">
                    <Input value={mainPlayerSearch} onChange={e => setMainPlayerSearch(e.target.value)}
                      onKeyDown={e => handleInputKey(e, mainPlayerSearch, setMainPlayerResults, setMainPlayerLoading)}
                      placeholder="Name (min 3 letters)" className="bg-purple-50" />
                    <Button variant="outline" onClick={() => searchFide(mainPlayerSearch, setMainPlayerResults, setMainPlayerLoading)} disabled={mainPlayerLoading}>
                      {mainPlayerLoading ? <RefreshCw className="animate-spin" /> : <Search />}
                    </Button>
                    <AnimatePresence>
                      {mainPlayerResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-1 w-full z-30 border rounded-md bg-white shadow animate-fade-in">
                          <Table>
                            <TableBody>
                              {mainPlayerResults.map((p, i) => (
                                <TableRow key={i} className="hover:bg-purple-50 cursor-pointer" onClick={() => { setMainPlayer({ name: p.name, rating: tournamentTimeControl === "blitz" ? p.blitz_rating : tournamentTimeControl === "rapid" ? p.rapid_rating : p.rating, k: 20 }); setMainPlayerSearch(p.name); setMainPlayerResults([]); }}>
                                  <TableCell className="font-medium">{p.name}</TableCell>
                                  <TableCell className="text-xs text-gray-500">{p.title || ""}</TableCell>
                                  <TableCell className="text-xs text-gray-500">{tournamentTimeControl === "blitz" ? p.blitz_rating : tournamentTimeControl === "rapid" ? p.rapid_rating : p.rating}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-sm text-purple-700">Time Control</Label>
                  <Select value={tournamentTimeControl} onValueChange={v => setTournamentTimeControl(v as any)}>
                    <SelectTrigger className="w-48 bg-purple-50 border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Classical)</SelectItem>
                      <SelectItem value="rapid">Rapid</SelectItem>
                      <SelectItem value="blitz">Blitz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-sm text-purple-700">K Factor</Label>
                  <Select value={mainPlayer.k.toString()} onValueChange={v => setMainPlayer({ ...mainPlayer, k: parseInt(v) })}>
                    <SelectTrigger className="bg-purple-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kOptions.map(opt => <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                <div className="flex-1">
                  <Label className="text-sm text-purple-700">Opponent (FIDE search)</Label>
                  <div className="relative flex gap-2">
                    <Input value={opponentSearch} onChange={e => setOpponentSearch(e.target.value)}
                      onKeyDown={e => handleInputKey(e, opponentSearch, setOpponentResults, setOpponentLoading)}
                      placeholder="Name (min 3 letters)" className="bg-purple-50" />
                    <Button variant="outline" onClick={() => searchFide(opponentSearch, setOpponentResults, setOpponentLoading)} disabled={opponentLoading}>
                      {opponentLoading ? <RefreshCw className="animate-spin" /> : <Search />}
                    </Button>
                    <AnimatePresence>
                      {opponentResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-1 w-full z-30 border rounded-md bg-white shadow animate-fade-in">
                          <Table>
                            <TableBody>
                              {opponentResults.map((p, i) => (
                                <TableRow key={i} className="hover:bg-purple-50 cursor-pointer" onClick={() => { setOpponentName(p.name); setOpponentRating(tournamentTimeControl === "blitz" ? p.blitz_rating : tournamentTimeControl === "rapid" ? p.rapid_rating : p.rating); setOpponentSearch(p.name); setOpponentResults([]); }}>
                                  <TableCell className="font-medium">{p.name}</TableCell>
                                  <TableCell className="text-xs text-gray-500">{p.title || ""}</TableCell>
                                  <TableCell className="text-xs text-gray-500">{tournamentTimeControl === "blitz" ? p.blitz_rating : tournamentTimeControl === "rapid" ? p.rapid_rating : p.rating}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Name</Label>
                  <Input value={opponentName} onChange={e => setOpponentName(e.target.value)} className="bg-purple-50" />
                  <Label className="text-xs text-gray-500">Rating</Label>
                  <Input type="number" value={opponentRating} onChange={e => setOpponentRating(parseInt(e.target.value) || 0)} className="bg-purple-50" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Result</Label>
                  <Select value={opponentResult.toString()} onValueChange={v => setOpponentResult(parseFloat(v) as 1|0.5|0)}>
                    <SelectTrigger className="bg-purple-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Win</SelectItem>
                      <SelectItem value="0.5">Draw</SelectItem>
                      <SelectItem value="0">Loss</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white w-full" onClick={() => {
                    if(opponentName && opponentRating) {
                      setOpponents([...opponents, { name: opponentName, rating: opponentRating, result: opponentResult }]);
                      setOpponentName(""); setOpponentRating(1500); setOpponentResult(1); setOpponentSearch("");
                    }
                  }}>Add Opponent</Button>
                </div>
              </div>
              {/* List of matches */}
              {opponents.length > 0 && (
                <div className="mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Opponent</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opponents.map((opp, i) => (
                        <TableRow key={i}>
                          <TableCell>{opp.name}</TableCell>
                          <TableCell>{opp.rating}</TableCell>
                          <TableCell>{opp.result === 1 ? "Win" : opp.result === 0.5 ? "Draw" : "Loss"}</TableCell>
                          <TableCell><Button variant="ghost" className="text-red-500" onClick={() => setOpponents(opponents.filter((_, idx) => idx !== i))}>Remove</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full mb-6" size="lg" disabled={!mainPlayer.name || !opponents.length} onClick={() => setTournamentShow(true)}>
                <Calculator className="mr-2" /> Calculate Tournament Elo
              </Button>
              {/* Results */}
              <AnimatePresence>
                {tournamentShow && mainPlayer.name && opponents.length > 0 && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                    <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 shadow-2xl mb-8">
                      <CardHeader>
                        <CardTitle className="text-2xl text-purple-700 font-bold">Tournament Result</CardTitle>
                        <CardDescription className="text-gray-600">{mainPlayer.name} ({mainPlayer.rating} → {calculateTournamentElo(mainPlayer, opponents).newRating})</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 text-lg font-semibold text-purple-700">Total Elo change: <span className={calculateTournamentElo(mainPlayer, opponents).totalChange > 0 ? "text-green-700" : calculateTournamentElo(mainPlayer, opponents).totalChange < 0 ? "text-red-600" : "text-gray-700"}>{calculateTournamentElo(mainPlayer, opponents).totalChange > 0 ? "+" : ""}{calculateTournamentElo(mainPlayer, opponents).totalChange}</span></div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Opponent</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Expected</TableHead>
                              <TableHead>Change</TableHead>
                              <TableHead>Before</TableHead>
                              <TableHead>After</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {calculateTournamentElo(mainPlayer, opponents).details.map((d, i) => (
                              <TableRow key={i}>
                                <TableCell>{d.name}</TableCell>
                                <TableCell>{d.rating}</TableCell>
                                <TableCell>{d.result === 1 ? "Win" : d.result === 0.5 ? "Draw" : "Loss"}</TableCell>
                                <TableCell>{d.expected.toFixed(2)}</TableCell>
                                <TableCell className={d.change > 0 ? "text-green-700" : d.change < 0 ? "text-red-600" : "text-gray-700"}>{d.change > 0 ? "+" : ""}{d.change}</TableCell>
                                <TableCell>{d.before}</TableCell>
                                <TableCell>{d.after}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
    {/* Elo System Explanation (English) */}
    <div className="max-w-3xl mx-auto mt-10 mb-8 p-6 bg-purple-50 border border-purple-200 rounded-lg shadow">
      <h2 className="text-xl font-bold text-purple-700 mb-2">How does the Elo system work?</h2>
      <p className="text-gray-700 mb-2">
        The Elo system is a mathematical method used to calculate the relative strength of chess players (and other games). After each game, each player's rating is adjusted based on the result and the rating difference between the two opponents.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-2">
        <li>If you beat a higher-rated opponent, you gain more Elo points.</li>
        <li>If you lose to a lower-rated opponent, you lose more points.</li>
        <li>A draw results in a small adjustment depending on the rating gap.</li>
      </ul>
      <p className="text-gray-700 mb-2">
        <b>Main formula:</b> <span className="font-mono">new_rating = old_rating + K × (score - expected_score)</span>
      </p>
      <p className="text-gray-700 mb-2">
        <b>Expected score:</b> <span className="font-mono">1 / (1 + 10^((opponent_rating - player_rating)/400))</span>
      </p>
      <p className="text-gray-700">
        The <b>K factor</b> determines how much the rating changes (higher K means faster changes).
      </p>
    </div>
    </>
  );
}