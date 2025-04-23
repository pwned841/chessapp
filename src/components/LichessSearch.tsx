'use client';

import React, { useState, useEffect } from 'react';

interface LichessSearchProps {
    name: string;
    birthday?: string;
    country: string;
}

interface LichessPlayer {
    id: string;
    username: string;
    perfs: {
        blitz?: { rating: number, games: number };
        rapid?: { rating: number, games: number };
        classical?: { rating: number, games: number };
        bullet?: { rating: number, games: number };
        [key: string]: { rating: number, games: number } | undefined;
    };
    title?: string;
    country?: string;
    createdAt: number;
    seenAt: number;
}

export function LichessSearch({ name }: LichessSearchProps) {
    const [players, setPlayers] = useState<LichessPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [searchProgress, setSearchProgress] = useState({
        currentVariation: '',
        totalVariations: 0,
        foundPlayers: 0,
        completed: false
    });
    const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

    useEffect(() => {
        const searchLichess = async () => {
            if (!name) return;
            
            setIsLoading(true);
            setError(null);
            setSearchAttempted(true);
            setPlayers([]);
            
            // Clean up the name - remove titles and other unnecessary elements
            let cleanName = name.trim();
            cleanName = cleanName.replace(/\([^)]*\)/g, '').trim();
            // Remove trailing commas
            cleanName = cleanName.replace(/,\s*$/, '');
            
            // Handle 'Last Name, First Name' format
            const commaMatch = cleanName.match(/^([^,]+),\s*(.+)$/);
            let firstName, lastName;
            
            if (commaMatch) {
                // Format: "Last, First"
                lastName = commaMatch[1].trim();
                firstName = commaMatch[2].trim();
                // Remove titles after properly identifying first/last name
                firstName = firstName.replace(/^(GM|IM|FM|CM|WGM|WIM|WFM|WCM)\s+/i, '');
            } else {
                // Format: "First Last"
                cleanName = cleanName.replace(/^(GM|IM|FM|CM|WGM|WIM|WFM|WCM)\s+/i, '');
                const nameParts = cleanName.trim().split(/\s+/);
                firstName = nameParts[0];
                lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
            }
            
            // List of different combinations to try (from most specific to least)
            const nameCombinations = [
                // No separators
                cleanName.replace(/\s+/g, ''),          // FullNameNoSpaces
                `${firstName}${lastName}`,               // FirstNameLastName
                `${lastName}${firstName}`,               // LastNameFirstName
                firstName,                               // FirstName
                lastName,                                // LastName (if exists)
                `${firstName.charAt(0)}${lastName}`,     // InitialLastName
                `${lastName}${firstName.charAt(0)}`,     // LastNameInitial
                `${firstName}l`,                         // First name + l (for "lichess")
                `l${firstName}`,                         // l + first name
                
                // With separators
                `${firstName}_${lastName}`,              // FirstName_LastName
                `${lastName}_${firstName}`,              // LastName_FirstName
                `${firstName}-${lastName}`,              // FirstName-LastName
                `${lastName}-${firstName}`,              // LastName-FirstName
                `${firstName}.${lastName}`,              // FirstName.LastName
                `${lastName}.${firstName}`,              // LastName.FirstName
                
                // Lowercase variations
                `${firstName.toLowerCase()}${lastName.toLowerCase()}`, // firstnamelastname
                `${lastName.toLowerCase()}${firstName.toLowerCase()}`, // lastnamefirstname
                `${firstName.toLowerCase()}_${lastName.toLowerCase()}`, // firstname_lastname
                `${lastName.toLowerCase()}_${firstName.toLowerCase()}`, // lastname_firstname
                `${firstName.toLowerCase()}-${lastName.toLowerCase()}`, // firstname-lastname
                `${lastName.toLowerCase()}-${firstName.toLowerCase()}`, // lastname-firstname
                `${firstName.toLowerCase()}.${lastName.toLowerCase()}`, // firstname.lastname
                `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`, // flastname
                `${lastName.toLowerCase()}${firstName.charAt(0).toLowerCase()}`, // lastnamef
            ].filter(n => n); // Remove empty strings
            
            // Remove duplicates
            const uniqueCombinations = [...new Set(nameCombinations)];
            
            setSearchProgress({
                currentVariation: '',
                totalVariations: uniqueCombinations.length,
                foundPlayers: 0,
                completed: false
            });
            
            let foundPlayers: LichessPlayer[] = [];
            
            // First try with single API call for all variations
            try {
                setSearchProgress(prev => ({
                    ...prev,
                    currentVariation: 'Searching Lichess API'
                }));
                
                // Use a clean version of the name without commas for the batch API call
                const batchSearchName = commaMatch ? 
                    `${firstName} ${lastName}` : 
                    cleanName;
                
                const response = await fetch(`/api/lichess/search?name=${encodeURIComponent(batchSearchName)}`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        foundPlayers = data;
                        setPlayers(data);
                        setSearchProgress(prev => ({
                            ...prev,
                            foundPlayers: data.length
                        }));
                    }
                }
            } catch (error) {
                console.error('Error in batch search:', error);
            }
            
            // If we didn't find enough players, try individual lookups
            if (foundPlayers.length < 3) {
                for (let i = 0; i < uniqueCombinations.length; i++) {
                    const combination = uniqueCombinations[i];
                    
                    setSearchProgress(prev => ({
                        ...prev,
                        currentVariation: combination,
                        foundPlayers: foundPlayers.length
                    }));
                    
                    try {
                        console.log(`Searching Lichess for: ${combination}`);
                        
                        const response = await fetch(`https://lichess.org/api/user/${combination.toLowerCase()}`);
                        
                        if (response.ok) {
                            const data = await response.json();
                            // Add if not already in the list
                            if (!foundPlayers.some(p => p.id === data.id)) {
                                foundPlayers.push(data);
                                // Update as we find players
                                setPlayers([...foundPlayers]);
                            }
                        }
                    } catch (err) {
                        console.error(`Error with ${combination}:`, err);
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            // Sort players by highest rating
            const sortedPlayers = foundPlayers.sort((a, b) => {
                const aRating = getHighestRating(a);
                const bRating = getHighestRating(b);
                return bRating - aRating;
            });
            
            setPlayers(sortedPlayers);
            setSearchProgress(prev => ({
                ...prev,
                currentVariation: 'Completed',
                foundPlayers: sortedPlayers.length,
                completed: true
            }));
            setIsLoading(false);
        };
        
        // Helper function to get highest rating
        const getHighestRating = (player: LichessPlayer): number => {
            const blitz = player.perfs?.blitz?.rating || 0;
            const rapid = player.perfs?.rapid?.rating || 0;
            const bullet = player.perfs?.bullet?.rating || 0;
            const classical = player.perfs?.classical?.rating || 0;
            return Math.max(blitz, rapid, bullet, classical);
        };

        if (name) {
            searchLichess();
        }
    }, [name]);

    const togglePlayerExpansion = (id: string) => {
        if (expandedPlayerId === id) {
            setExpandedPlayerId(null);
        } else {
            setExpandedPlayerId(id);
        }
    };

    const getHighestRating = (player: LichessPlayer): {type: string, rating: number} => {
        const ratings = [
            { type: 'Bullet', rating: player.perfs?.bullet?.rating || 0 },
            { type: 'Blitz', rating: player.perfs?.blitz?.rating || 0 },
            { type: 'Rapid', rating: player.perfs?.rapid?.rating || 0 },
            { type: 'Classical', rating: player.perfs?.classical?.rating || 0 }
        ];
        
        return ratings.reduce((highest, current) => 
            current.rating > highest.rating ? current : highest, 
            { type: 'None', rating: 0 }
        );
    };

    const getCountryFlag = (countryCode?: string): string => {
        if (!countryCode) return '🌐';
        
        // Convert country code to flag emoji
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
            
        return String.fromCodePoint(...codePoints);
    };

    return (
        <div className="h-full">
            <h2 className="text-2xl font-bold mb-4 text-purple-500 border-b border-purple-300 pb-2">Lichess Profile</h2>
            
            {/* Search Progress Bar */}
            {isLoading && (
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-purple-700">
                            Searching: {searchProgress.currentVariation}
                        </span>
                        <span className="text-sm font-medium text-purple-700">
                            {searchProgress.foundPlayers} players found
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${Math.min(
                                    (searchProgress.totalVariations > 0 
                                        ? (players.length / searchProgress.totalVariations) * 100 
                                        : 0) + 10, 
                                    100
                                )}%` 
                            }}
                        ></div>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            
            {!isLoading && !error && searchAttempted && players.length === 0 && (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-2">No players found on Lichess matching &quot;{name}&quot;</p>
                    <a 
                        href={`https://lichess.org/@/${name.replace(/\s+/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline block mb-2"
                    >
                        Try direct username search
                    </a>
                </div>
            )}
            
            {players.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500 p-3 border-b">
                        Found {players.length} players on Lichess
                    </div>
                    
                    <ul className="divide-y divide-gray-200">
                        {players.map((player) => {
                            const highestRating = getHighestRating(player);
                            return (
                                <li key={player.id} className="hover:bg-gray-50">
                                    <div 
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                        onClick={() => togglePlayerExpansion(player.id)}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mr-3">
                                                {player.title ? player.title[0] : getCountryFlag(player.country)}
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    {player.title && (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded mr-1.5">
                                                            {player.title}
                                                        </span>
                                                    )}
                                                    <h3 className="font-medium text-gray-900">{player.username}</h3>
                                                </div>
                                                {player.country && (
                                                    <p className="text-sm text-gray-500">
                                                        {getCountryFlag(player.country)} {player.country}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {highestRating.rating > 0 && (
                                                <div className="text-right mr-4">
                                                    <p className="text-sm text-gray-500">{highestRating.type}</p>
                                                    <p className="font-bold text-purple-700">{highestRating.rating}</p>
                                                </div>
                                            )}
                                            <svg 
                                                className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedPlayerId === player.id ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded details */}
                                    {expandedPlayerId === player.id && (
                                        <div className="px-4 pb-4 pt-2 bg-gray-50">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                {player.perfs?.bullet && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Bullet</p>
                                                        <p className="text-2xl font-bold text-purple-700">{player.perfs.bullet.rating}</p>
                                                        <p className="text-xs text-gray-500">{player.perfs.bullet.games} games</p>
                                                    </div>
                                                )}
                                                {player.perfs?.blitz && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Blitz</p>
                                                        <p className="text-2xl font-bold text-purple-700">{player.perfs.blitz.rating}</p>
                                                        <p className="text-xs text-gray-500">{player.perfs.blitz.games} games</p>
                                                    </div>
                                                )}
                                                {player.perfs?.rapid && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Rapid</p>
                                                        <p className="text-2xl font-bold text-purple-700">{player.perfs.rapid.rating}</p>
                                                        <p className="text-xs text-gray-500">{player.perfs.rapid.games} games</p>
                                                    </div>
                                                )}
                                                {player.perfs?.classical && (
                                                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                                                        <p className="font-medium text-gray-600">Classical</p>
                                                        <p className="text-2xl font-bold text-purple-700">{player.perfs.classical.rating}</p>
                                                        <p className="text-xs text-gray-500">{player.perfs.classical.games} games</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500 mt-2">
                                                <div>
                                                    <p>Account created: {new Date(player.createdAt).toLocaleDateString()}</p>
                                                    <p>Last seen: {new Date(player.seenAt).toLocaleDateString()}</p>
                                                </div>
                                                
                                                <a 
                                                    href={`https://lichess.org/@/${player.username}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="mt-3 md:mt-0 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors inline-block text-center"
                                                >
                                                    View Profile
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
