'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Ferme le menu si l'utilisateur clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        }
        
        if (mobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [mobileMenuOpen]);
    
    // Ferme le menu mobile quand l'URL change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);
    
    const isActive = (path: string) => {
        // Use a subtle background and bolder text for active links
        return pathname === path 
            ? 'bg-purple-100 text-purple-800 font-semibold' 
            : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 font-medium';
    };
    
    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        setMobileMenuOpen(false);
    };
    
    const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        if (!user) {
            e.preventDefault();
            router.push('/signin');
        } else {
            router.push(path);
        }
        setMobileMenuOpen(false);
    };
    
    // Variantes d'animation pour le menu mobile
    const menuVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.4,
                ease: "easeInOut",
                when: "beforeChildren",
                staggerChildren: 0.05
            }
        }
    };
    
    // Variantes d'animation pour les éléments du menu
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: {
                duration: 0.3
            }
        }
    };
    
    return (
        <nav className="w-full py-3 px-4 md:px-8 backdrop-blur-lg bg-white/90 shadow-sm sticky top-0 z-50 border-b border-gray-200">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="text-xl font-bold text-purple-800 hover:text-purple-600 flex items-center gap-2 transition-colors">
                    <Image src="/chess-knight.svg" alt="ChessApp Logo" width={32} height={32} />
                    <span className="inline">ChessApp</span>
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-2">
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
                    <Link 
                        href="/elo-calculator" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/elo-calculator')}`}
                    >
                        Elo Calculator
                    </Link>
                    <Link 
                        href="/chess-locations" 
                        className={`px-3 py-2 rounded-md transition-colors text-sm md:text-base ${isActive('/chess-locations')}`}
                    >
                        Map
                    </Link>
                </div>
                
                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex items-center space-x-2">
                    {user ? (
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 bg-purple-200">
                                <AvatarFallback className="text-sm text-purple-700">
                                    {user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">
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
                
                {/* Mobile Menu Button avec animation */}
                <div className="flex md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Toggle mobile menu"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            {mobileMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X size={24} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu size={24} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
            
            {/* Mobile Menu avec animation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        ref={menuRef}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={menuVariants}
                        className="md:hidden bg-white border-t border-gray-100 mt-3 overflow-hidden rounded-b-lg shadow-lg"
                    >
                        <div className="flex flex-col p-4">
                            <motion.div variants={itemVariants}>
                                <a 
                                    href="#"
                                    onClick={(e) => handleProtectedLink(e, '/player-search')} 
                                    className={`px-3 py-3 rounded-md text-base block ${isActive('/player-search')} ${!user ? 'opacity-80' : ''}`}
                                >
                                    Search
                                </a>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <a 
                                    href="#"
                                    onClick={(e) => handleProtectedLink(e, '/repertoire')} 
                                    className={`px-3 py-3 rounded-md text-base block ${isActive('/repertoire')} ${!user ? 'opacity-80' : ''}`}
                                >
                                    Repertoire
                                </a>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <a 
                                    href="#"
                                    onClick={(e) => handleProtectedLink(e, '/game-analysis')} 
                                    className={`px-3 py-3 rounded-md text-base block ${isActive('/game-analysis')} ${!user ? 'opacity-80' : ''}`}
                                >
                                    Analysis
                                </a>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <Link 
                                    href="/elo-calculator" 
                                    className={`px-3 py-3 rounded-md text-base block ${isActive('/elo-calculator')}`}
                                >
                                    Elo Calculator
                                </Link>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <Link 
                                    href="/chess-locations" 
                                    className={`px-3 py-3 rounded-md text-base block ${isActive('/chess-locations')}`}
                                >
                                    Map
                                </Link>
                            </motion.div>
                            
                            {/* Mobile Auth Buttons */}
                            <motion.div 
                                variants={itemVariants}
                                className="border-t border-gray-100 pt-4 mt-4"
                            >
                                {user ? (
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center space-x-3 px-3 py-2">
                                            <Avatar className="h-8 w-8 bg-purple-200">
                                                <AvatarFallback className="text-sm text-purple-700">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                                {user.email}
                                            </span>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleSignOut}
                                            className="text-sm w-full"
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-3 px-3">
                                        <Link href="/signin" className="w-full">
                                            <Button variant="outline" size="sm" className="text-sm w-full">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/signup" className="w-full">
                                            <Button size="sm" className="text-sm w-full bg-purple-600 hover:bg-purple-700">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}