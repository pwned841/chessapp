'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function GameAnalysisPage() {
    const [pgn, setPgn] = useState('');
    const [gameUrl, setGameUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    // Simuler l'analyse (à remplacer par une vraie analyse)
    const analyzeGame = () => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisComplete(false);
        
        // Simulation d'une progression d'analyse
        const interval = setInterval(() => {
            setAnalysisProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsAnalyzing(false);
                    setAnalysisComplete(true);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Analyse de parties</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Obtenez une analyse détaillée de vos parties d'échecs avec des insights sur les ouvertures, les erreurs, et des suggestions d'amélioration.
                </p>
            </div>

            <Card className="mb-8 shadow-lg border-gray-100">
                <CardHeader>
                    <CardTitle className="text-2xl">Importer une partie</CardTitle>
                    <CardDescription>
                        Importez votre partie au format PGN ou fournissez un lien vers une partie de Chess.com ou Lichess
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pgn" className="w-full">
                        <TabsList className="grid grid-cols-2 mb-6">
                            <TabsTrigger value="pgn">Format PGN</TabsTrigger>
                            <TabsTrigger value="url">URL de partie</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pgn">
                            <div className="space-y-4">
                                <Textarea 
                                    placeholder="Collez votre notation PGN ici... (ex: 1. e4 e5 2. Nf3 Nc6...)" 
                                    className="min-h-[200px] font-mono text-sm"
                                    onChange={(e) => setPgn(e.target.value)}
                                    value={pgn}
                                />
                                <Button 
                                    onClick={analyzeGame}
                                    disabled={!pgn.trim() || isAnalyzing}
                                    className="w-full bg-purple-700 hover:bg-purple-800"
                                >
                                    {isAnalyzing ? 'Analyse en cours...' : 'Analyser la partie'}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="url">
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-700">URL de la partie</label>
                                    <Input 
                                        placeholder="https://chess.com/game/live/..." 
                                        onChange={(e) => setGameUrl(e.target.value)}
                                        value={gameUrl}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Liens supportés : Chess.com et Lichess.org
                                    </p>
                                </div>
                                <Button 
                                    onClick={analyzeGame}
                                    disabled={!gameUrl.trim() || isAnalyzing}
                                    className="w-full bg-purple-700 hover:bg-purple-800"
                                >
                                    {isAnalyzing ? 'Analyse en cours...' : 'Analyser la partie'}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {isAnalyzing && (
                        <div className="mt-8 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Analyse en cours...</span>
                                <span>{analysisProgress}%</span>
                            </div>
                            <Progress value={analysisProgress} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {analysisComplete && (
                <div className="space-y-8">
                    {/* En-tête du résultat */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold">Partie analysée</h2>
                                <p className="text-gray-600">13 avril 2025 • 35 coups • 1-0</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    Télécharger l'analyse
                                </Button>
                                <Button variant="outline">
                                    Partager
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Résumé de l'analyse */}
                    <Card className="shadow-md border-gray-100">
                        <CardHeader>
                            <CardTitle>Résumé de la partie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Aperçu de la partie */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-lg mb-3">Aperçu</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ouverture</span>
                                            <span className="font-medium">Défense sicilienne, variante Najdorf</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ECO</span>
                                            <span className="font-medium">B90</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Précision</span>
                                            <div className="flex gap-4">
                                                <span className="font-medium">Blancs: 89%</span>
                                                <span className="font-medium">Noirs: 82%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistiques */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-lg mb-3">Statistiques</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Coups excellents</span>
                                                <div className="flex gap-4">
                                                    <span>Blancs: 7</span>
                                                    <span>Noirs: 5</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Progress value={70} className="h-2 bg-gray-200" />
                                                <Progress value={50} className="h-2 bg-gray-200" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Coups bons</span>
                                                <div className="flex gap-4">
                                                    <span>Blancs: 12</span>
                                                    <span>Noirs: 14</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Progress value={60} className="h-2 bg-gray-200" />
                                                <Progress value={70} className="h-2 bg-gray-200" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Erreurs</span>
                                                <div className="flex gap-4">
                                                    <span>Blancs: 2</span>
                                                    <span>Noirs: 3</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Progress value={20} className="h-2 bg-gray-200" />
                                                <Progress value={30} className="h-2 bg-gray-200" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Erreurs graves</span>
                                                <div className="flex gap-4">
                                                    <span>Blancs: 0</span>
                                                    <span>Noirs: 1</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Progress value={0} className="h-2 bg-gray-200" />
                                                <Progress value={10} className="h-2 bg-gray-200" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Graphique d'avantage - Placeholder */}
                    <Card className="shadow-md border-gray-100">
                        <CardHeader>
                            <CardTitle>Avantage au cours de la partie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-100 rounded-lg h-60 flex items-center justify-center">
                                <p className="text-gray-500">Le graphique d'avantage sera affiché ici</p>
                            </div>
                            <div className="mt-4 flex justify-between text-sm text-gray-600">
                                <div>Coup 1</div>
                                <div>Coup 18</div>
                                <div>Coup 35</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Moments clés */}
                    <Card className="shadow-md border-gray-100">
                        <CardHeader>
                            <CardTitle>Moments clés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-medium">Coup 12 - Erreur des noirs</h4>
                                        <span className="text-red-500">-1.4</span>
                                    </div>
                                    <p className="text-gray-600 mb-3">
                                        Le coup 12...Dd8 permet aux blancs de développer une forte initiative sur l'aile dame.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Voir la position</Button>
                                        <Button size="sm">Meilleur coup: 12...Cc5</Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-medium">Coup 24 - Excellent coup des blancs</h4>
                                        <span className="text-green-500">+2.3</span>
                                    </div>
                                    <p className="text-gray-600 mb-3">
                                        Le sacrifice 24.Cxe6! crée une attaque dévastatrice contre le roi noir.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Voir la position</Button>
                                        <Button size="sm" variant="outline">Voir la variante</Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-medium">Coup 30 - Erreur grave des noirs</h4>
                                        <span className="text-red-600">-5.7</span>
                                    </div>
                                    <p className="text-gray-600 mb-3">
                                        30...Ff6 perd immédiatement à cause de la combinaison tactique qui suit.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Voir la position</Button>
                                        <Button size="sm">Meilleur coup: 30...Rh8</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appel à l'action */}
                    <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-xl p-6 text-white text-center">
                        <h3 className="text-xl font-semibold mb-2">Améliorez votre jeu</h3>
                        <p className="mb-4">Analysez plus de parties pour progresser rapidement et atteindre un niveau supérieur</p>
                        <Button className="bg-white text-purple-700 hover:bg-gray-100">
                            Analyser une autre partie
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}