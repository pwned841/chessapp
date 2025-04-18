'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function GameAnalysisPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <Card className="shadow-lg border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="mb-8 relative w-28 h-28 flex items-center justify-center bg-purple-100 rounded-full">
                            <Image 
                                src="/chess-knight.svg" 
                                alt="Chess Piece" 
                                width={60} 
                                height={60} 
                                className="opacity-80"
                            />
                        </div>
                        <h1 className="text-4xl font-bold mb-6 text-gray-800">Coming Soon</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            We're currently developing an advanced game analysis feature to help you improve your chess skills.
                        </p>
                        <div className="inline-block bg-purple-100 text-purple-800 font-medium rounded-full px-4 py-1 text-sm">
                            Under Development
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}