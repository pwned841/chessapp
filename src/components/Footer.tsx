import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-transparent mt-36">
            <div className="border-t-2 border-purple-500"></div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4">
                <p className="text-white text-sm text-center">
                    © 2024 ChessApp All rights reserved - Last database update : 2025/01/01
                </p>
                <Link
                    href="https://github.com/pwned841"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <Github size={20} />
                    <span className="text-sm">GitHub</span>
                </Link>
            </div>
        </footer>
    );
}

