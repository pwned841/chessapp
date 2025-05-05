import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="w-full bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 px-6">
                    {/* Logo and Description Section */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Image 
                                src="/chess-knight.svg" 
                                alt="ChessApp Logo" 
                                width={28} 
                                height={28} 
                            />
                            <span className="text-xl font-bold text-purple-800">ChessApp</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            A comprehensive chess player search platform with advanced analytics and tools to improve your game.
                        </p>
                        <p className="text-amber-600 text-xs flex items-start gap-2 bg-amber-50 p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>This site is under development. Report issues to <a href="mailto:echeclover@gmail.com" className="underline hover:text-amber-700">echeclover@gmail.com</a></span>
                        </p>
                    </div>
                    
                    {/* Quick Links Section */}
                    <div>
                        <h3 className="text-gray-800 text-lg font-medium mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-gray-600 hover:text-purple-700 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/player-search" className="text-gray-600 hover:text-purple-700 transition-colors">
                                    Player Search
                                </Link>
                            </li>
                            <li>
                                <Link href="/repertoire" className="text-gray-600 hover:text-purple-700 transition-colors">
                                    Repertoire Analysis
                                </Link>
                            </li>
                            <li>
                                <Link href="/game-analysis" className="text-gray-600 hover:text-purple-700 transition-colors">
                                    Game Analysis
                                </Link>
                            </li>
                            <li>
                                <Link href="/chess-locations" className="text-gray-600 hover:text-purple-700 transition-colors">
                                    Chess Locations Map
                                </Link>
                            </li>
                            <li>
                                <Link href="/credits" className="text-gray-600 hover:text-purple-700 transition-colors">
                                    Credits
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Copyright Section */}
                <div className="border-t border-gray-200 py-6 px-6 text-center md:flex md:justify-between md:text-left">
                    <p className="text-sm text-gray-500">
                        © {currentYear} ChessApp. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500 mt-2 md:mt-0">
                        <a href="mailto:echeclover@gmail.com" className="hover:text-purple-700 transition-colors">Contact</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}