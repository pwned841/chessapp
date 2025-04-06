'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Repertoire {
    id: string;
    name: string;
    description: string;
    color: 'white' | 'black';
    openings: string[];
    createdAt: string;
}

export default function RepertoirePage() {
    const [repertoires, setRepertoires] = useState<Repertoire[]>([
        {
            id: '1',
            name: 'Sicilian Defense',
            description: 'My repertoire against 1.e4 as Black',
            color: 'black',
            openings: ['Najdorf Variation', 'Sveshnikov Variation'],
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Queen\'s Gambit',
            description: 'My white repertoire starting with 1.d4',
            color: 'white',
            openings: ['Queen\'s Gambit Accepted', 'Queen\'s Gambit Declined'],
            createdAt: new Date().toISOString()
        }
    ]);

    const [showNewForm, setShowNewForm] = useState(false);
    const [newRepertoire, setNewRepertoire] = useState({
        name: '',
        description: '',
        color: 'white' as 'white' | 'black',
        openings: ['']
    });

    const handleCreateRepertoire = (e: React.FormEvent) => {
        e.preventDefault();
        const repertoire: Repertoire = {
            id: Date.now().toString(),
            ...newRepertoire,
            openings: newRepertoire.openings.filter(o => o.trim() !== ''),
            createdAt: new Date().toISOString()
        };
        
        setRepertoires([...repertoires, repertoire]);
        setNewRepertoire({
            name: '',
            description: '',
            color: 'white',
            openings: ['']
        });
        setShowNewForm(false);
    };

    const handleAddOpening = () => {
        setNewRepertoire({
            ...newRepertoire,
            openings: [...newRepertoire.openings, '']
        });
    };

    const handleOpeningChange = (index: number, value: string) => {
        const updatedOpenings = [...newRepertoire.openings];
        updatedOpenings[index] = value;
        setNewRepertoire({
            ...newRepertoire,
            openings: updatedOpenings
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Opening Repertoires</h1>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                    {showNewForm ? 'Cancel' : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Repertoire
                        </>
                    )}
                </button>
            </div>

            {showNewForm && (
                <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Repertoire</h2>
                    <form onSubmit={handleCreateRepertoire}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={newRepertoire.name}
                                onChange={(e) => setNewRepertoire({...newRepertoire, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                value={newRepertoire.description}
                                onChange={(e) => setNewRepertoire({...newRepertoire, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Color</span>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="color"
                                        value="white"
                                        checked={newRepertoire.color === 'white'}
                                        onChange={() => setNewRepertoire({...newRepertoire, color: 'white'})}
                                        className="mr-2"
                                    />
                                    White
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="color"
                                        value="black"
                                        checked={newRepertoire.color === 'black'}
                                        onChange={() => setNewRepertoire({...newRepertoire, color: 'black'})}
                                        className="mr-2"
                                    />
                                    Black
                                </label>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Openings</label>
                            {newRepertoire.openings.map((opening, index) => (
                                <div key={index} className="flex mb-2">
                                    <input
                                        type="text"
                                        value={opening}
                                        onChange={(e) => handleOpeningChange(index, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., Queen's Gambit Declined"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddOpening}
                                className="text-purple-600 mt-2 flex items-center text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add Another Opening
                            </button>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                            >
                                Create Repertoire
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {repertoires.map(repertoire => (
                    <div key={repertoire.id} className="bg-white/90 backdrop-blur-lg shadow-md rounded-xl p-6">
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-xl font-bold">{repertoire.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                                repertoire.color === 'white' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'
                            }`}>
                                {repertoire.color.charAt(0).toUpperCase() + repertoire.color.slice(1)}
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4">{repertoire.description}</p>
                        
                        <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">Openings:</h3>
                            <ul className="list-disc pl-5">
                                {repertoire.openings.map((opening, i) => (
                                    <li key={i} className="text-gray-700">{opening}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-4">
                            <span className="text-sm text-gray-500">
                                Created {new Date(repertoire.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                                <button className="text-purple-600 hover:text-purple-800">Edit</button>
                                <button className="text-red-600 hover:text-red-800">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {repertoires.length === 0 && !showNewForm && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">You haven't created any repertoires yet.</p>
                    <button
                        onClick={() => setShowNewForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                    >
                        Create Your First Repertoire
                    </button>
                </div>
            )}
        </div>
    );
}
