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
                        className="feather feather-github"
                    >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    <span className="text-sm">GitHub</span>
                </Link>
            </div>
        </footer>
    );
}