'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    
    const isActive = (path: string) => {
        return pathname === path ? 'bg-purple-700 text-white' : 'text-purple-700 hover:bg-purple-100';
    };
    
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-lg bg-white/90 shadow-md rounded-b-2xl sticky top-0 z-10">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="text-2xl font-bold text-purple-700 hover:text-purple-600 flex items-center">
                    <span className="text-3xl mr-2">♔</span>
                    ChessApp
                </Link>
                
                <div className="flex space-x-2">
                    <Link 
                        href="/" 
                        className={`px-4 py-2 rounded-lg transition-colors ${isActive('/')}`}
                    >
                        Home
                    </Link>
                    <Link 
                        href="/repertoire" 
                        className={`px-4 py-2 rounded-lg transition-colors ${isActive('/repertoire')}`}
                    >
                        Repertoire
                    </Link>
                </div>
            </div>
        </nav>
    );
}