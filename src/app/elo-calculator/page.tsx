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
    <div className="max-w-3xl mx-auto py-10 px-2 md:px-0">
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
                <div className="flex gap-2">
                  <Input ref={input1} value={search1} onChange={e => setSearch1(e.target.value)}
                    onKeyDown={e => handleInputKey(e, search1, setResults1, setLoading1)}
                    placeholder="Name (min 3 letters)" className="bg-purple-50" />
                  <Button variant="outline" onClick={() => searchFide(search1, setResults1, setLoading1)} disabled={loading1}>
                    {loading1 ? <RefreshCw className="animate-spin" /> : <Search />}
                  </Button>
                </div>
                <AnimatePresence>
                  {results1.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-2 border rounded-md bg-white shadow animate-fade-in">
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
                <div className="flex gap-2">
                  <Input ref={input2} value={search2} onChange={e => setSearch2(e.target.value)}
                    onKeyDown={e => handleInputKey(e, search2, setResults2, setLoading2)}
                    placeholder="Name (min 3 letters)" className="bg-purple-50" />
                  <Button variant="outline" onClick={() => searchFide(search2, setResults2, setLoading2)} disabled={loading2}>
                    {loading2 ? <RefreshCw className="animate-spin" /> : <Search />}
                  </Button>
                </div>
                <AnimatePresence>
                  {results2.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-2 border rounded-md bg-white shadow animate-fade-in">
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
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}