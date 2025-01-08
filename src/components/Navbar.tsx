'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-lg bg-purple-900/20 rounded-2xl">
            <div className="flex justify-between items-center max-w-6xl mx-auto">
                <Link href="/" className="text-2xl font-bold text-purple-700 hover:text-purple-600">
                    ChessApp
                </Link>

                <p className="text-4xl font-bold text-purple-700 hover:text-purple-600">
                    ♔
                </p>
            </div>
        </nav>
    );
}