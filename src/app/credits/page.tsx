'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CreditsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
            >
                <div className="bg-purple-700 px-6 py-4 text-white">
                    <h1 className="text-2xl font-bold">Credits & Attributions</h1>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Icons & Graphics</h2>
                    
                    <div className="mb-8">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-shrink-0">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Image 
                                        src="/chess-knight.svg" 
                                        alt="Chess Knight Logo" 
                                        width={50} 
                                        height={50} 
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-1">Chess Knight Logo</h3>
                                <p className="text-gray-600 text-sm mb-2">
                                    Made by SVG Repo, licensed under CC0 (Public Domain)
                                </p>
                                <div>
                                    <Link 
                                        href="https://www.svgrepo.com/svg/94351/knight" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                    >
                                        <span>Original Source</span>
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
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Libraries & Frameworks</h2>
                    
                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">Next.js</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                The React framework for production - used as the foundation of this application.
                            </p>
                            <Link 
                                href="https://nextjs.org/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>Website</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">Tailwind CSS</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                A utility-first CSS framework for rapid UI development.
                            </p>
                            <Link 
                                href="https://tailwindcss.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>Website</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">Framer Motion</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                A production-ready motion library for React that powers the animations on this site.
                            </p>
                            <Link 
                                href="https://www.framer.com/motion/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>Website</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">React Chessboard</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                A responsive, customizable, React chess board library that powers the chess displays on this site.
                            </p>
                            <Link 
                                href="https://github.com/Clariity/react-chessboard" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>GitHub</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">Supabase</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                An open source Firebase alternative providing all the backend services needed for this application.
                            </p>
                            <Link 
                                href="https://supabase.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>Website</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">Stockfish</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                The world's strongest open-source chess engine, used for analysis in the Game Analysis and Repertoire features.
                            </p>
                            <Link 
                                href="https://stockfishchess.org/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>Website</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Inspirations</h2>
                    
                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-1">OpeningTree</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                The Repertoire feature was inspired by the excellent OpeningTree project, which provides opening analysis for chess players.
                            </p>
                            <Link 
                                href="https://github.com/openingtree/openingtree" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                            >
                                <span>GitHub</span>
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
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link href="/">
                            <Button className="bg-purple-700 hover:bg-purple-800">
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}