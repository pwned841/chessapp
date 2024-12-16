"use client";

export default function Navbar() {
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-lg bg-purple-900/20 rounded-2xl">
            <div className="flex justify-between items-center max-w-6xl mx-auto">
                <a href="#" className="text-2xl font-bold text-purple-700 hover:text-purple-600">
                    ChessApp
                </a>

                <button className="bg-purple-950 hover:bg-purple-900 text-white px-4 py-2 rounded-md transition-all">
                    Sign Up
                </button>
            </div>
        </nav>
    );
}
