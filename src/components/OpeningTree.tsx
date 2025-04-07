'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Move } from 'chess.js';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface TreeNode {
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

interface OpeningTreeProps {
    data: TreeNode;
    initialSide?: 'white' | 'black';
}

export default function OpeningTree({ data, initialSide = 'white' }: OpeningTreeProps) {
    const chess = useRef(new Chess());
    const busy = useRef(false);
    const componentId = useRef(`board-${Math.random().toString(36).substring(2, 9)}`);
    
    const treeDataRef = useRef<TreeNode>(data);
    
    const [fen, setFen] = useState<string>('start');
    const [lastMove, setLastMove] = useState<any>(null);
    const [currentNode, setCurrentNode] = useState<TreeNode>(data);
    const [path, setPath] = useState<TreeNode[]>([data]);
    const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(initialSide);
    const [pendingMove, setPendingMove] = useState<{ from: string, to: string } | null>(null);
    
    useEffect(() => {
        treeDataRef.current = data;
    }, [data]);
    
    const simplifyFen = useCallback((fen: string) => {
        if (fen === 'start' || fen === 'root') {
            return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        }
        
        const fenParts = fen.split(' ');
        return fenParts.length > 2 ? `${fenParts[0]} ${fenParts[1]} ${fenParts[2]}` : fen;
    }, []);
    
    const findNodeByFen = useCallback((searchFen: string, rootNode: TreeNode = treeDataRef.current): TreeNode | null => {
        const simplifiedSearchFen = simplifyFen(searchFen);
        
        const search = (node: TreeNode): TreeNode | null => {
            if (simplifyFen(node.fen) === simplifiedSearchFen) {
                return node;
            }
            
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    const result = search(child);
                    if (result) return result;
                }
            }
            
            return null;
        };
        
        return search(rootNode);
    }, [simplifyFen]);
    
    useEffect(() => {
        try {
            if (currentNode?.fen && currentNode.fen !== 'start' && currentNode.fen !== 'root') {
                chess.current = new Chess(currentNode.fen);
            } else {
                chess.current = new Chess();
            }
            setFen(chess.current.fen());
            
            console.log('Current node updated:', { 
                fen: currentNode.fen,
                children: currentNode.children?.length || 0,
                move: currentNode.move
            });
        } catch (error) {
            console.error("Erreur lors du chargement de la position:", error);
            chess.current = new Chess();
            setFen(chess.current.fen());
        }
    }, [currentNode?.fen]);
    
    const onMove = useCallback((moveObj: any) => {
        if (busy.current) return false;
        
        busy.current = true;
        try {
            let move: Move | null = null;
            
            if (typeof moveObj === 'string') {
                move = chess.current.move(moveObj);
            } else if (moveObj.from && moveObj.to) {
                move = chess.current.move({
                    from: moveObj.from,
                    to: moveObj.to,
                    promotion: moveObj.promotion || 'q'
                });
            } else {
                move = chess.current.move(moveObj);
            }
            
            if (!move) {
                busy.current = false;
                return false;
            }
            
            setFen(chess.current.fen());
            setLastMove(move);
            return true;
        } catch (error) {
            console.error("Erreur lors de l'exécution du coup:", error);
            return false;
        } finally {
            setTimeout(() => {
                busy.current = false;
            }, 50);
        }
    }, []);
    
    const handleMoveClick = useCallback((node: TreeNode) => {
        if (busy.current) return;
        
        busy.current = true;
        try {
            if (currentNode && currentNode.fen) {
                chess.current = new Chess(currentNode.fen);
            }
            
            let success = false;
            
            try {
                chess.current.move(node.san);
                success = true;
            } catch (e) {
                if (node.move && node.move.length >= 4) {
                    try {
                        const from = node.move.substring(0, 2);
                        const to = node.move.substring(2, 4);
                        const promotion = node.move.length > 4 ? node.move.substring(4, 5) : 'q';
                        
                        chess.current.move({ from, to, promotion });
                        success = true;
                    } catch (e2) {
                        console.error("Erreur lors du coup:", e2);
                    }
                }
            }
            
            if (success) {
                const newFen = chess.current.fen();
                
                let nextNode = node;
                
                if (!nextNode.children || nextNode.children.length === 0) {
                    const foundNode = findNodeByFen(newFen);
                    if (foundNode) {
                        console.log('Found alternative node in tree with matching position');
                        nextNode = foundNode;
                    }
                }
                
                setFen(newFen);
                setCurrentNode(nextNode);
                setPath(prev => [...prev, nextNode]);
                setPendingMove(null);
            }
        } catch (error) {
            console.error("Erreur lors du traitement du coup:", error);
        } finally {
            setTimeout(() => {
                busy.current = false;
            }, 50);
        }
    }, [currentNode, findNodeByFen]);
    
    const navigateToPosition = useCallback((index: number) => {
        if (busy.current) return;
        if (index < 0 || index >= path.length) return;
        
        busy.current = true;
        try {
            const targetNode = path[index];
            
            if (targetNode.fen && targetNode.fen !== 'start' && targetNode.fen !== 'root') {
                chess.current = new Chess(targetNode.fen);
            } else {
                chess.current = new Chess();
            }
            
            setFen(chess.current.fen());
            setCurrentNode(targetNode);
            setPath(prevPath => prevPath.slice(0, index + 1));
            setPendingMove(null);
        } catch (error) {
            console.error("Erreur de navigation:", error);
        } finally {
            setTimeout(() => {
                busy.current = false;
            }, 50);
        }
    }, [path]);
    
    const undoMove = useCallback(() => {
        if (path.length <= 1 || busy.current) return;
        navigateToPosition(path.length - 2);
    }, [navigateToPosition, path.length]);
    
    const resetBoard = useCallback(() => {
        if (busy.current) return;
        
        busy.current = true;
        try {
            chess.current = new Chess();
            setFen(chess.current.fen());
            setCurrentNode(data);
            setPath([data]);
            setLastMove(null);
            setPendingMove(null);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation:", error);
        } finally {
            setTimeout(() => {
                busy.current = false;
            }, 50);
        }
    }, [data]);
    
    const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
        if (busy.current) return false;
        
        const tempChess = new Chess(chess.current.fen());
        const moveResult = tempChess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        });
        
        if (!moveResult) return false;
        
        const matchingChild = currentNode.children?.find(child => {
            return child.san === moveResult.san || 
                  (child.move.startsWith(sourceSquare) && child.move.includes(targetSquare));
        });
        
        if (matchingChild) {
            handleMoveClick(matchingChild);
            return true;
        } else {
            setPendingMove({
                from: sourceSquare,
                to: targetSquare
            });
            return false;
        }
    }, [currentNode, handleMoveClick]);
    
    const flipBoard = useCallback(() => {
        setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
    }, []);
    
    const calculateWinRate = useCallback((node: TreeNode) => {
        if (node.total === 0) return 50;
        return node.winRate || 50;
    }, []);
    
    const getScoreDisplay = useCallback((node: TreeNode) => {
        if (node.total === 0) return '+0 =0 -0';
        return `+${node.white} =${node.draws} -${node.black}`;
    }, []);
    
    const renderMoveList = useCallback(() => {
        console.log('Rendering move list for position:', { 
            fen: currentNode.fen,
            children: currentNode.children,
            hasMoves: !!(currentNode.children && currentNode.children.length > 0)
        });
        
        if (!currentNode.children || currentNode.children.length === 0) {
            const simplifiedCurrentFen = simplifyFen(chess.current.fen());
            const alternativeNode = findNodeByFen(simplifiedCurrentFen);
            
            if (alternativeNode && alternativeNode.children && alternativeNode.children.length > 0) {
                console.log('Found alternative node with moves:', alternativeNode.children.length);
                
                const sortedMoves = [...alternativeNode.children]
                    .sort((a, b) => b.total - a.total);
                
                return (
                    <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                        <div className="bg-blue-50 p-2 mb-2 border border-blue-200 rounded text-sm">
                            Trouvé {sortedMoves.length} coup(s) alternatifs pour cette position
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coup
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parties
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Taux de victoire
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedMoves.map((node, index) => (
                                    <tr 
                                        key={`${node.move}-${index}`}
                                        onClick={() => handleMoveClick(node)}
                                        className="hover:bg-purple-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {node.san}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {node.total}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getScoreDisplay(node)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${
                                                            node.winRate > 60 ? 'bg-green-500' : 
                                                            node.winRate > 40 ? 'bg-purple-600' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${node.winRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-500">{node.winRate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            
            return (
                <div className="text-gray-500 italic p-4 text-center">
                    Aucun coup trouvé dans cette position
                </div>
            );
        }
        
        const sortedMoves = [...currentNode.children]
            .sort((a, b) => b.total - a.total);
        
        return (
            <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Coup
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Parties
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Taux de victoire
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedMoves.map((node, index) => (
                            <tr 
                                key={`${node.move}-${index}`}
                                onClick={() => handleMoveClick(node)}
                                className="hover:bg-purple-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {node.san}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {node.total}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getScoreDisplay(node)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                            <div 
                                                className={`h-2.5 rounded-full ${
                                                    node.winRate > 60 ? 'bg-green-500' : 
                                                    node.winRate > 40 ? 'bg-purple-600' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${node.winRate}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-500">{node.winRate.toFixed(1)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }, [currentNode, getScoreDisplay, handleMoveClick, chess, findNodeByFen, simplifyFen]);
    
    return (
        <div className="opening-tree">
            <div className="bg-gray-100 p-4 rounded-md mb-4 flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center">
                    <span className="mr-2 font-medium">Chemin:</span>
                    {path.map((node, index) => (
                        <React.Fragment key={`path-${index}`}>
                            {index > 0 && <span className="mx-1 text-gray-400">→</span>}
                            <button
                                onClick={() => navigateToPosition(index)}
                                className={`px-2 py-1 rounded-md ${
                                    index === path.length - 1 
                                        ? 'bg-purple-100 text-purple-700 font-medium' 
                                        : 'hover:bg-gray-200'
                                }`}
                            >
                                {index === 0 ? 'Départ' : node.san}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={undoMove} 
                        disabled={path.length <= 1 || busy.current}
                        className={`p-2 rounded text-sm flex items-center ${
                            path.length <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                        title="Retour"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={resetBoard}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center text-gray-700"
                        title="Réinitialiser"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={flipBoard}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center text-gray-700"
                        title="Retourner l'échiquier"
                    >
                        <ArrowRight className="h-4 w-4 transform rotate-90" />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="w-full mx-auto">
                            <Chessboard 
                                id={componentId.current}
                                position={fen}
                                boardOrientation={boardOrientation}
                                areArrowsAllowed={true}
                                onPieceDrop={onDrop}
                                customBoardStyle={{
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                }}
                                animationDuration={200}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4 bg-white border border-gray-200 rounded-lg">
                        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                            <h3 className="font-medium">Statistiques de la position</h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-md text-center">
                                    <div className="text-sm text-gray-500">Total des parties</div>
                                    <div className="text-xl font-bold text-purple-700">{currentNode.total}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md text-center">
                                    <div className="text-sm text-gray-500">Taux de victoire</div>
                                    <div className="text-xl font-bold text-purple-700">
                                        {calculateWinRate(currentNode).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 bg-gray-50 p-3 rounded-md">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Résultats</h4>
                                <div className="flex items-center mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                        <div className="bg-green-500 h-2.5 rounded-l-full" style={{ 
                                            width: `${currentNode.total ? (currentNode.white / currentNode.total) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                    <span className="text-sm text-gray-500 w-9">{currentNode.white}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                        <div className="bg-gray-500 h-2.5" style={{ 
                                            width: `${currentNode.total ? (currentNode.draws / currentNode.total) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                    <span className="text-sm text-gray-500 w-9">{currentNode.draws}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                        <div className="bg-red-500 h-2.5 rounded-r-full" style={{ 
                                            width: `${currentNode.total ? (currentNode.black / currentNode.total) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                    <span className="text-sm text-gray-500 w-9">{currentNode.black}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="md:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-lg h-full">
                        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                            <h3 className="font-medium">Coups disponibles</h3>
                        </div>
                        {pendingMove ? (
                            <div className="p-4">
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
                                    <p className="text-yellow-800 text-sm">
                                        Le coup {`${pendingMove.from}-${pendingMove.to}`} n'est pas dans le répertoire d'ouvertures.
                                    </p>
                                    <button 
                                        onClick={() => setPendingMove(null)}
                                        className="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-sm text-yellow-800"
                                    >
                                        Revenir
                                    </button>
                                </div>
                            </div>
                        ) : renderMoveList()}
                    </div>
                </div>
            </div>
        </div>
    );
}
