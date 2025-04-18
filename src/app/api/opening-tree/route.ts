import { NextRequest, NextResponse } from 'next/server';
import { Chess } from 'chess.js';
import axios from 'axios';

// Interface pour les données de l'arbre d'ouvertures
interface OpeningNode {
  move: string;
  fen: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  total: number;
  winRate: number;
  children: OpeningNode[];
  expanded?: boolean;
}

interface Game {
  moves: string[];
  result: string;
  playerColor: 'white' | 'black';
  opponentElo?: number;
}

// Ajout des types compatibles avec chess.js
type ChessMove = {
  from: string;
  to: string;
  san: string;
};

// Fonction utilitaire locale pour mettre à jour le statut
// (Elle fait exactement la même chose, mais n'est pas importée du fichier route.ts)
async function updateSearchStatus(username: string, status: string, progress: number): Promise<void> {
  try {
    // Appel direct à l'API interne sans passer par fetch pour éviter les redirections
    await axios.post(`${process.env.NEXTAUTH_URL || ''}/api/opening-tree/status`, {
      username,
      status,
      progress
    });
  } catch (error) {
    console.error('Error updating search status:', error);
  }
}

// Fonction pour récupérer les parties du joueur
async function fetchGames(platform: string, username: string, side: string): Promise<Game[]> {
  try {
    const games: Game[] = [];
    
    if (platform === 'chesscom') {
      // Récupération des jeux de Chess.com
      console.log(`Récupération des parties pour ${username} sur Chess.com`);
      
      // Vérifier d'abord si l'utilisateur existe
      try {
        const profileCheck = await axios.get(`https://api.chess.com/pub/player/${username}`);
        console.log(`Profil trouvé pour ${username}`);
      } catch (error) {
        console.error(`Profil non trouvé pour ${username} sur Chess.com`);
        return [];
      }
      
      // Récupérer les archives disponibles
      try {
        const archivesResponse = await axios.get(`https://api.chess.com/pub/player/${username}/games/archives`);
        const archives = archivesResponse.data.archives;
        
        console.log(`${archives.length} archives trouvées pour ${username}`);
        updateSearchStatus(username, `${archives.length} archives trouvées, récupération des parties...`, 20);
        
        // Prendre les 3 dernières archives pour limiter les requêtes
        const recentArchives = archives.slice(-3);
        let gamesCount = 0;
        
        // Traiter chaque archive en parallèle
        for (let index = 0; index < recentArchives.length; index++) {
          const archiveUrl = recentArchives[index];
          try {
            console.log(`Récupération des parties de l'archive ${index + 1}/${recentArchives.length}: ${archiveUrl}`);
            updateSearchStatus(username, `Récupération des parties de l'archive ${index + 1}/${recentArchives.length}...`, 20 + ((index + 1) / recentArchives.length) * 30);
            
            const archiveResponse = await axios.get(archiveUrl);
            const archiveGames = archiveResponse.data.games || [];
            
            gamesCount += archiveGames.length;
            updateSearchStatus(username, `${gamesCount} parties trouvées, traitement en cours...`, 50 + ((index + 1) / recentArchives.length) * 10);
            
            for (const game of archiveGames) {
              if (!game.pgn) continue;
              
              const chess = new Chess();
              try {
                chess.loadPgn(game.pgn);
                const playerColor = game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
                
                // Ne traiter que les jeux où le joueur joue avec la couleur demandée
                if ((side === 'white' && playerColor === 'white') || (side === 'black' && playerColor === 'black')) {
                  games.push({
                    moves: chess.history(),
                    result: game.result,
                    playerColor,
                    opponentElo: playerColor === 'white' ? game.black.rating : game.white.rating
                  });
                }
              } catch (e) {
                console.warn('Erreur lors du chargement du PGN:', e);
              }
            }
          } catch (error) {
            console.warn(`Erreur lors de la récupération de l'archive ${archiveUrl}:`, error);
          }
        }
        
        console.log(`Au total, ${games.length} parties récupérées pour ${username} sur Chess.com`);
        updateSearchStatus(username, `${games.length} parties récupérées, filtrage par couleur...`, 60);
      } catch (error) {
        console.error(`Erreur lors de la récupération des archives pour ${username}:`, error);
      }
    } else if (platform === 'lichess') {
      // Récupération des jeux de Lichess
      const url = `https://lichess.org/api/games/user/${username}`;
      const params = {
        max: 100,
        perfType: 'rapid,blitz,classical',
        color: side === 'white' ? 'white' : 'black',
        pgnInJson: true
      };
      
      try {
        const response = await axios.get(url, { params });
        if (response.data) {
          const gamesData = response.data.split('\n').filter(Boolean);
          
          for (const gameStr of gamesData) {
            try {
              const game = JSON.parse(gameStr);
              const playerColor = game.players.white.user.name.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
              
              // Ne traiter que les jeux où le joueur joue avec la couleur demandée
              if ((side === 'white' && playerColor === 'white') || (side === 'black' && playerColor === 'black')) {
                const chess = new Chess();
                chess.loadPgn(game.pgn);
                
                games.push({
                  moves: chess.history(),
                  result: game.status,
                  playerColor,
                  opponentElo: playerColor === 'white' ? game.players.black.rating : game.players.white.rating
                });
              }
            } catch (e) {
              console.warn('Erreur lors du traitement du jeu Lichess:', e);
            }
          }
        }
      } catch (error) {
        console.warn('Impossible de récupérer les jeux de Lichess:', error);
      }
    }
    
    return games;
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    return [];
  }
}

// Mettre à jour la fonction pour construire l'arbre d'ouvertures avec une profondeur
function buildOpeningTree(games: Game[], currentFen?: string, depth: number = 5): OpeningNode {
  const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const rootNode: OpeningNode = {
    move: 'root',
    fen: currentFen || initialFen,
    san: currentFen ? 'Position actuelle' : 'Position initiale',
    white: 0,
    draws: 0,
    black: 0,
    total: 0,
    winRate: 50,
    children: [],
    expanded: true
  };
  
  // Parcourir tous les jeux pour construire l'arbre
  for (const game of games) {
    // Comptabiliser le résultat
    if (game.result === '1-0') {
      rootNode.white++;
    } else if (game.result === '0-1') {
      rootNode.black++;
    } else {
      rootNode.draws++;
    }
    rootNode.total++;
    
    // Si nous sommes à un niveau plus profond de l'arbre, ignorer les coups précédents
    let startIdx = 0;
    
    if (currentFen && currentFen !== initialFen) {
      const tempChess = new Chess();
      // On reconstruit la position actuelle et on compte combien de coups ont été joués
      for (let i = 0; i < game.moves.length; i++) {
        tempChess.move(game.moves[i]);
        if (tempChess.fen() === currentFen) {
          startIdx = i + 1;
          break;
        }
      }
      
      // Si la position n'est pas atteinte dans cette partie, l'ignorer
      if (startIdx === 0) continue;
    }
    
    // Si nous avons atteint la profondeur maximale, ne pas continuer
    if (depth <= 0) continue;
    
    // Construire l'arbre à partir de la position actuelle
    const chess = new Chess(currentFen || initialFen);
    
    let previousMoves: string[] = [];
    
    for (let i = startIdx; i < Math.min(startIdx + depth, game.moves.length); i++) {
      const move = game.moves[i];
      try {
        const moveObj = chess.move(move) as ChessMove;
        
        // Chercher si le coup existe déjà dans les enfants du nœud
        let childNode = rootNode.children.find(child => child.san === moveObj.san);
        
        // Si le coup n'existe pas, l'ajouter
        if (!childNode) {
          childNode = {
            move: moveObj.from + moveObj.to,
            fen: chess.fen(),
            san: moveObj.san,
            white: 0,
            draws: 0,
            black: 0,
            total: 0,
            winRate: 50,
            children: [],
            expanded: false
          };
          rootNode.children.push(childNode);
        }
        
        // Comptabiliser le résultat pour ce coup
        if (game.result === '1-0') {
          childNode.white++;
        } else if (game.result === '0-1') {
          childNode.black++;
        } else {
          childNode.draws++;
        }
        childNode.total++;
        
        // Calculer le taux de victoire
        const totalGames = childNode.white + childNode.draws + childNode.black;
        if (totalGames > 0) {
          if (game.playerColor === 'white') {
            childNode.winRate = Math.round(((childNode.white + childNode.draws * 0.5) / totalGames) * 100);
          } else {
            childNode.winRate = Math.round(((childNode.black + childNode.draws * 0.5) / totalGames) * 100);
          }
        }
        
        // Récursivement construire les niveaux suivants
        previousMoves.push(moveObj.san);
      } catch (e) {
        console.warn('Erreur lors de l\'exécution du coup:', e);
        break;
      }
    }
  }
  
  // Calculer le taux de victoire global
  if (rootNode.total > 0) {
    const playerIsWhite = games.length > 0 && games[0].playerColor === 'white';
    if (playerIsWhite) {
      rootNode.winRate = Math.round(((rootNode.white + rootNode.draws * 0.5) / rootNode.total) * 100);
    } else {
      rootNode.winRate = Math.round(((rootNode.black + rootNode.draws * 0.5) / rootNode.total) * 100);
    }
  }
  
  return rootNode;
}

// Gestionnaire de la route API
export async function GET(request: NextRequest) {
  // Récupération des paramètres de la requête
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const username = searchParams.get('username');
  const side = searchParams.get('side') || 'white';
  const fen = searchParams.get('fen');
  
  // Vérification des paramètres requis
  if (!platform || !username) {
    return NextResponse.json(
      { error: 'Paramètres manquants: platform et username sont requis' },
      { status: 400 }
    );
  }
  
  try {
    // Mettre à jour le statut initial
    updateSearchStatus(username, 'Vérification du profil...', 5);
    
    // Récupération des jeux du joueur
    console.log(`Début de la récupération des parties pour ${username} sur ${platform}`);
    
    if (platform === 'chesscom') {
      // Vérifier si l'utilisateur existe
      updateSearchStatus(username, 'Vérification du profil Chess.com...', 10);
      // ...
    } else {
      updateSearchStatus(username, 'Vérification du profil Lichess...', 10);
      // ...
    }
    
    // Après vérification du profil
    updateSearchStatus(username, 'Récupération des archives de parties...', 20);
    
    const games = await fetchGames(
      platform === 'chesscom' ? 'chesscom' : 'lichess', 
      username, 
      side
    );
    
    console.log(`${games.length} parties récupérées au total`);
    updateSearchStatus(username, `${games.length} parties récupérées, construction de l'arbre d'ouvertures...`, 70);
    
    if (games.length === 0) {
      console.log(`Aucune partie trouvée pour ${username}`);
      return NextResponse.json(
        { 
          error: `Aucune partie trouvée pour ${username} sur ${platform === 'chesscom' ? 'Chess.com' : 'Lichess'} en tant que ${side === 'white' ? 'Blancs' : 'Noirs'}.`,
          move: 'root',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          san: 'Position initiale',
          white: 0,
          draws: 0,
          black: 0,
          total: 0,
          winRate: 50,
          children: []
        },
        { status: 404 }
      );
    }
    
    // Construction de l'arbre d'ouvertures avec une profondeur de 10 coups
    updateSearchStatus(username, `Analyse des ${games.length} parties et construction de l'arbre...`, 80);
    const treeData = buildOpeningTree(games, fen || undefined, 10);
    
    updateSearchStatus(username, `Analyse terminée: ${treeData.total} parties dans l'arbre d'ouvertures`, 95);
    
    // Réponse avec les données
    return NextResponse.json(treeData);
  } catch (error: any) {
    console.error('Erreur dans la route API opening-tree:', error);
    
    // Gérer les erreurs spécifiques
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return NextResponse.json(
          { error: `Utilisateur ${username} non trouvé sur ${platform === 'chesscom' ? 'Chess.com' : 'Lichess'}` },
          { status: 404 }
        );
      } else if (status === 429) {
        return NextResponse.json(
          { error: `Trop de requêtes vers l'API de ${platform === 'chesscom' ? 'Chess.com' : 'Lichess'}. Veuillez réessayer plus tard.` },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Impossible de récupérer les données de l\'arbre d\'ouvertures' },
      { status: 500 }
    );
  }
}
