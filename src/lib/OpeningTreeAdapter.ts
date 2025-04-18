import { Chess } from 'chess.js';
import { validateAndCreateChess } from './chessConfig';

export interface TreeNode {
    move: string;
    fen: string;
    san: string;
    white: number;
    draws: number;
    black: number;
    total: number;
    winRate: number;
    children: TreeNode[];
    expanded?: boolean;
}

export interface MoveStats {
    san: string;
    count: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    elo?: number;
}

export class OpeningTreeAdapter {
    private nodeMap = new Map<string, TreeNode>();
    
    constructor(data: TreeNode) {
        this.buildNodeMap(data);
    }
    
    // Construit une map pour accéder rapidement aux nœuds par FEN
    private buildNodeMap(node: TreeNode) {
        this.nodeMap.set(this.simplifyFen(node.fen), node);
        
        if (node.children) {
            node.children.forEach(childNode => {
                this.buildNodeMap(childNode);
            });
        }
    }
    
    // Simplifie une position FEN pour la mise en cache (comme dans le projet original)
    private simplifyFen(fen: string): string {
        if (fen === 'start' || fen === 'root') {
            return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        }
        
        const fenComponents = fen.split(' ');
        if (fenComponents.length <= 4) {
            return fen;
        }
        
        // Exclure les composants de mouvement et demi-mouvement (comme dans util.js)
        return `${fenComponents[0]} ${fenComponents[1]} ${fenComponents[2]}`;
    }
    
    // Trouve le nœud suivant dans l'arbre pour un coup donné à partir d'une position
    findNextNode(currentFen: string, move: string): TreeNode | null {
        try {
            const chess = validateAndCreateChess(currentFen);
            const moveResult = chess.move(move);
            
            if (!moveResult) return null;
            
            const newFen = chess.fen();
            const simplifiedFen = this.simplifyFen(newFen);
            
            return this.nodeMap.get(simplifiedFen) || null;
        } catch (error) {
            console.error('Erreur lors de la recherche du nœud suivant:', error);
            return null;
        }
    }
    
    // Convertit la structure de TreeNode vers MoveStats pour l'affichage
    convertToMoveStats(nodes: TreeNode[]): MoveStats[] {
        return nodes.map(node => ({
            san: node.san,
            count: node.total,
            wins: node.white,
            draws: node.draws,
            losses: node.black,
            winRate: node.winRate
        }));
    }
    
    // Calcule les niveaux de popularité d'un coup (comme dans OpeningGraph.js)
    calculateMoveLevel(moveCount: number, maxCount: number): 1 | 2 | 3 {
        if (maxCount <= 0 || moveCount / maxCount > 0.8) {
            return 3; // Très populaire
        }
        if (moveCount / maxCount > 0.3) {
            return 2; // Populaire
        }
        return 1; // Peu populaire
    }
    
    // Trouve tous les coups disponibles à partir d'une position FEN
    getAvailableMoves(fen: string): TreeNode[] {
        const simplifiedFen = this.simplifyFen(fen);
        const node = this.nodeMap.get(simplifiedFen);
        
        if (!node) return [];
        
        return node.children || [];
    }
}
