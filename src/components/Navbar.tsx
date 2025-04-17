'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Navbar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const router = useRouter();
    
    const isActive = (path: string) => {
        // Use a subtle background and bolder text for active links
        return pathname === path 
            ? 'bg-purple-100 text-purple-800 font-semibold' 
            : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 font-medium';
    };
    
    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };
    
    const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        if (!user) {
            e.preventDefault();
            router.push('/signin');
        } else {
            router.push(path);
        }
    };
    
    return (
        <nav className="w-full py-4 px-4 md:px-8 backdrop-blur-lg bg-white/90 shadow-sm sticky top-0 z-50 border-b border-gray-200">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="text-xl font-bold text-purple-800 hover:text-purple-600 flex items-center gap-2 transition-colors">
                    <Image src="/chess-pawn.svg" alt="ChessApp Logo" width={28} height={28} />
                    <span className="hidden sm:inline">ChessApp</span>
                </Link>
                
                {/* Navigation Links - All visible, but protected with onClick handler */}
                <div className="flex space-x-1 md:space-x-2">
                    {/* Home link is always accessible */}
                    <Link 
                        href="/" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/')}`}
                    >
                        Home
                    </Link>
                    
                    {/* Protected links - visible but redirect to signin if clicked while not logged in */}
                    <a 
                        href="#"
                        onClick={(e) => handleProtectedLink(e, '/player-search')} 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/player-search')} ${!user ? 'opacity-80' : ''}`}
                    >
                        Search
                    </a>
                    <a 
                        href="#"
                        onClick={(e) => handleProtectedLink(e, '/repertoire')} 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/repertoire')} ${!user ? 'opacity-80' : ''}`}
                    >
                        Repertoire
                    </a>
                    <a 
                        href="#"
                        onClick={(e) => handleProtectedLink(e, '/game-analysis')} 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/game-analysis')} ${!user ? 'opacity-80' : ''}`}
                    >
                        Analysis
                    </a>
                </div>
                
                {/* Auth Buttons */}
                <div className="flex items-center space-x-2">
                    {user ? (
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 bg-purple-200">
                                <AvatarFallback className="text-sm text-purple-700">
                                    {user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline text-sm text-gray-700">
                                {user.email}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSignOut}
                                className="text-sm"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex space-x-2">
                            <Link href="/signin">
                                <Button variant="outline" size="sm" className="text-sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="text-sm bg-purple-600 hover:bg-purple-700">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}