import Image from 'next/image';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-16 h-16 animate-pulse mb-4">
                <Image 
                    src="/chess-knight.svg" 
                    alt="ChessApp Logo" 
                    fill 
                    className="opacity-70"
                />
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-md flex flex-col items-center">
                <div className="flex space-x-2 mb-2">
                    {[...Array(3)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" 
                            style={{ 
                                animationDelay: `${i * 0.15}s`,
                                animationDuration: '0.8s'
                            }}
                        />
                    ))}
                </div>
                <p className="text-gray-700 font-medium">Loading...</p>
            </div>
        </div>
    );
}