'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { Chess } from 'chess.js';
import { useToast } from "@/hooks/use-toast";

interface StockfishAnalysisProps {
  fen: string;
  onSelectMove?: (move: string) => void;
}

interface EvaluatedMove {
  move: string;
  score: number;
  mate?: number;
  san: string;
}

interface StockfishResponse {
  success: boolean;
  evaluation?: number;
  mate?: number | null;
  bestmove: string;
  continuation: string;
  data?: string;
}

const StockfishAnalysis: React.FC<StockfishAnalysisProps> = ({ fen, onSelectMove }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bestMove, setBestMove] = useState<EvaluatedMove | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Utiliser des refs pour suivre l'état au lieu des variables d'état supplémentaires
  const analysisInProgress = useRef(false);
  const previousFen = useRef<string | null>(null);

  // Analyser automatiquement quand la position change
  useEffect(() => {
    // Éviter les analyses répétées pour le même FEN et éviter les rendus supplémentaires
    if (fen === previousFen.current || analysisInProgress.current) {
      return;
    }

    previousFen.current = fen;
    analysisInProgress.current = true;
    
    // Début de l'analyse
    setIsAnalyzing(true);
    setBestMove(null);
    setError(null);
    
    // Afficher le toast d'analyse démarrée une seule fois
    toast({
      title: "Analyse en cours",
      description: "Stockfish analyse la position actuelle...",
      duration: 2000,
      variant: "default",
    });
    
    // Variable pour suivre si le composant est toujours monté
    let mounted = true;
    
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(
          `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=10`, 
          { method: 'GET' }
        );
        
        if (!mounted) return; // Ne pas continuer si le composant est démonté
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data: StockfishResponse = await response.json();
        
        if (!mounted) return;
        
        if (!data.success) {
          throw new Error(data.data || 'Échec de l\'analyse');
        }
        
        // Extraction du meilleur coup
        const moveMatch = data.bestmove.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbnk]?)/i);
        if (!moveMatch) {
          throw new Error('Format de réponse inattendu');
        }
        
        const bestMoveUci = moveMatch[1];
        
        // Conversion du format UCI en notation SAN
        let san = bestMoveUci;
        try {
          const chessCopy = new Chess(fen);
          const moveResult = chessCopy.move({
            from: bestMoveUci.substring(0, 2),
            to: bestMoveUci.substring(2, 4),
            promotion: bestMoveUci.length === 5 ? bestMoveUci.substring(4, 5) : undefined,
          });
          
          if (moveResult) {
            san = moveResult.san;
          }
        } catch (err) {
          // Gestion silencieuse de l'erreur
        }
        
        // Création du meilleur coup trouvé
        const evaluatedMove: EvaluatedMove = {
          move: bestMoveUci,
          score: data.evaluation || 0,
          mate: data.mate !== null ? data.mate : undefined,
          san: san
        };
        
        if (!mounted) return;
        
        setBestMove(evaluatedMove);
        setIsAnalyzing(false);
        
        // Afficher le toast de fin
        toast({
          title: "Analyse terminée",
          description: `Meilleur coup trouvé: ${san}`,
          variant: "default",
          duration: 3000,
        });
      } catch (err) {
        if (!mounted) return;
        
        // Gestion silencieuse des erreurs dans la console uniquement
        console.error("Erreur lors de l'analyse Stockfish:", err);
        setError("Erreur d'analyse");
        setIsAnalyzing(false);
        
        // Afficher le toast d'erreur
        toast({
          title: "Erreur d'analyse",
          description: "Impossible d'analyser cette position",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        if (mounted) {
          analysisInProgress.current = false;
        }
      }
    };
    
    fetchAnalysis();
    
    // Nettoyage: annuler toutes opérations en cours si le composant est démonté
    return () => {
      mounted = false;
      analysisInProgress.current = false;
    };
  }, [fen, toast]);

  const handleMoveClick = () => {
    if (onSelectMove && bestMove) {
      onSelectMove(bestMove.move);
    }
  };

  const formatScore = (move: EvaluatedMove) => {
    if (move.mate !== undefined) {
      return `M${Math.abs(move.mate)}`;
    }
    return move.score > 0 ? `+${move.score.toFixed(2)}` : move.score.toFixed(2);
  };
  
  const getScoreColor = (score: number) => {
    if (score > 3) return "bg-emerald-500 text-white";
    if (score > 1.5) return "bg-green-500 text-white";
    if (score > 0.5) return "bg-green-400 text-white";
    if (score > -0.5) return "bg-gray-500 text-white";
    if (score > -1.5) return "bg-orange-400 text-white";
    if (score > -3) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };
  
  return (
    <div className="w-full">
      {error ? (
        <div className="text-center py-2 text-red-500 text-sm">Erreur d'analyse</div>
      ) : isAnalyzing ? (
        <div className="flex justify-center items-center py-2">
          <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Analyse...</span>
        </div>
      ) : bestMove ? (
        <div 
          className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 cursor-pointer border border-muted/60 transition-all duration-200 hover:border-accent/60"
          onClick={handleMoveClick}
        >
          <span className="font-medium text-base">{bestMove.san}</span>
          <Badge className={getScoreColor(bestMove.score)}>
            {formatScore(bestMove)}
          </Badge>
        </div>
      ) : (
        <div className="text-center py-2 text-muted-foreground text-sm">
          Aucune analyse disponible
        </div>
      )}
    </div>
  );
};

export default StockfishAnalysis;