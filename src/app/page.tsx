import SearchBar from "@/components/SearchBar";

export default function Home() {
    return (
        <div className="flex flex-col min-h-[85vh]">
            <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center flex-grow">
                <div className="max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
                        Know everything about your next 
                        <span className="text-purple-700 block mt-2 text-6xl md:text-7xl">chess opponent</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        Search for any FIDE player and discover their ratings and profiles across Chess.com and Lichess.
                    </p>
                    
                    <div className="w-full max-w-2xl mx-auto">
                        <SearchBar/>
                    </div>
                    
                    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Find Any Player</h3>
                            <p className="text-gray-600">Search by name or FIDE ID to instantly access player information.</p>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Compare Ratings</h3>
                            <p className="text-gray-600">View FIDE, Chess.com, and Lichess ratings side by side.</p>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Build Repertoires</h3>
                            <p className="text-gray-600">Create and manage your opening repertoires based on your opponents.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
