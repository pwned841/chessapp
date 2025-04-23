import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex justify-center items-center flex-col min-h-[80vh] w-full py-12">
            <div className="w-full max-w-md flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 mb-6">
                    <Image 
                        src="/chess-knight.svg" 
                        alt="ChessApp Logo" 
                        fill
                        className="opacity-75"
                    />
                </div>
                
                <h1 className="text-8xl font-bold text-purple-600 mb-4 tracking-tighter">404</h1>
                <h2 className="text-2xl font-medium text-gray-800 mb-6">Page Not Found</h2>
                
                <p className="text-gray-600 text-center mb-8 max-w-sm">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                
                <Link 
                    href="/"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors text-white rounded-lg font-medium flex items-center"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}