'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
    const pathname = usePathname();
    
    const isActive = (path: string) => {
        // Use a subtle background and bolder text for active links
        return pathname === path 
            ? 'bg-purple-100 text-purple-800 font-semibold' 
            : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 font-medium';
    };
    
    return (
        // Increased z-index to 50, adjusted padding
        <nav className="w-full py-4 px-4 md:px-8 backdrop-blur-lg bg-white/90 shadow-sm sticky top-0 z-50 border-b border-gray-200">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="text-xl font-bold text-purple-800 hover:text-purple-600 flex items-center gap-2 transition-colors">
                    <Image src="/chess-pawn.svg" alt="ChessApp Logo" width={28} height={28} />
                    <span className="hidden sm:inline">ChessAnalyzer</span> 
                    {/* Renamed for clarity, adjust if needed */}
                </Link>
                
                {/* Adjusted spacing and link styling */}
                <div className="flex space-x-1 md:space-x-2">
                    <Link 
                        href="/" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/')}`}
                    >
                        Accueil
                    </Link>
                    <Link 
                        href="/player-search" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/player-search')}`}
                    >
                        Recherche
                    </Link>
                    <Link 
                        href="/repertoire" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/repertoire')}`}
                    >
                        Répertoire
                    </Link>
                    <Link 
                        href="/game-analysis" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/game-analysis')}`}
                    >
                        Analyse
                    </Link>
                </div>
            </div>
        </nav>
    );
}