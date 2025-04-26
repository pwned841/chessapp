import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="w-full bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10 px-6">
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
                            <li className="mt-4">
                                <Link
                                    href="/credits"
                                    className="bg-purple-100 hover:bg-purple-200 p-2 rounded-md transition-colors flex items-center gap-2 text-purple-700 font-medium w-fit"
                                    aria-label="Credits"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                    <span>View Credits</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Connect Section */}
                    <div>
                        <h3 className="text-gray-800 text-lg font-medium mb-4">Connect</h3>
                        <div className="flex items-center gap-3 mb-5">
                            <Link
                                href="https://github.com/pwned841"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors text-gray-700"
                                aria-label="GitHub"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                </svg>
                            </Link>
                            <Link
                                href="https://github.com/pwned841/chessapp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors text-gray-700"
                                aria-label="GitHub"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                </svg>
                            </Link>
                            <a
                                href="mailto:echeclover@gmail.com"
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors text-gray-700"
                                aria-label="Email"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </a>
                        </div>
                        <div className="mb-4">
                            <span className="text-xs text-gray-500 block">
                                <b>Open-source project</b> on <a href="https://github.com/pwned841/chessapp" className="underline hover:text-purple-700" target="_blank" rel="noopener noreferrer">GitHub</a> 
                                &nbsp;|&nbsp; <span className="inline-block">⭐️ <b>0</b> stars</span>
                                <br />
                                Found a bug or want to suggest a feature? <a href="https://github.com/pwned841/chessapp/issues" className="underline hover:text-purple-700" target="_blank" rel="noopener noreferrer">Open an issue</a>
                            </span>
                        </div>
                        <div>
                            <h4 className="text-gray-800 text-sm font-medium mb-3">Supported Platforms</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md">
                                    <Image src="/chesscom.png" alt="Chess.com" width={22} height={22} className="rounded-sm" />
                                    <span className="text-sm font-medium text-gray-700">Chess.com</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md">
                                    <Image src="/lichessorg.png" alt="Lichess.org" width={22} height={22} className="rounded-sm" />
                                    <span className="text-sm font-medium text-gray-700">Lichess</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md">
                                    <span className="text-sm font-medium text-gray-700">FIDE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Copyright Section */}
                <div className="border-t border-gray-200 py-6 px-6 text-center md:flex md:justify-between md:text-left">
                    <p className="text-sm text-gray-500">
                        © {currentYear} ChessApp. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500 mt-2 md:mt-0">
                        Built with Next.js & Tailwind CSS
                    </p>
                </div>
            </div>
        </footer>
    );
}