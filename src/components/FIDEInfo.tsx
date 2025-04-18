'use client';

import React from 'react';

interface PlayerDetails {
    fideid: number;
    name: string;
    country: string;
    sex: string;
    title?: string;
    w_title?: string;
    o_title?: string;
    foa_title?: string;
    rating?: number;
    games?: number;
    k?: number;
    rapid_rating?: number;
    rapid_games?: number;
    rapid_k?: number;
    blitz_rating?: number;
    blitz_games?: number;
    blitz_k?: number;
    birthday?: string;
    flag?: string;
}

interface FIDEInfoProps {
    playerInfo: PlayerDetails;
}

export function FIDEInfo({ playerInfo }: FIDEInfoProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString();
    };

    const calculateAge = (birthday?: string) => {
        if (!birthday) return 'Unknown';
        
        const birthDate = new Date(birthday);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age.toString();
    };

    return (
        <div className="rounded-lg shadow-lg bg-white p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-2">
                        {playerInfo.title && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-sm mr-2">
                                {playerInfo.title}
                            </span>
                        )}
                        {playerInfo.name}
                    </h1>
                    <div className="flex items-center text-gray-600">
                        <span className="mr-4">FIDE ID: {playerInfo.fideid}</span>
                        {playerInfo.country && <span className="mr-4">Country: {playerInfo.country}</span>}
                        {playerInfo.birthday && <span>Age: {calculateAge(playerInfo.birthday)}</span>}
                    </div>
                </div>
                <a 
                    href={`https://ratings.fide.com/profile/${playerInfo.fideid}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-center"
                >
                    View FIDE Profile
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Standard</h3>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-purple-700">{playerInfo.rating || '—'}</span>
                        {playerInfo.games && (
                            <p className="text-sm text-gray-500 mt-1">Games: {playerInfo.games}</p>
                        )}
                        {playerInfo.k && (
                            <p className="text-sm text-gray-500">K-factor: {playerInfo.k}</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Rapid</h3>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-purple-700">{playerInfo.rapid_rating || '—'}</span>
                        {playerInfo.rapid_games && (
                            <p className="text-sm text-gray-500 mt-1">Games: {playerInfo.rapid_games}</p>
                        )}
                        {playerInfo.rapid_k && (
                            <p className="text-sm text-gray-500">K-factor: {playerInfo.rapid_k}</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Blitz</h3>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-purple-700">{playerInfo.blitz_rating || '—'}</span>
                        {playerInfo.blitz_games && (
                            <p className="text-sm text-gray-500 mt-1">Games: {playerInfo.blitz_games}</p>
                        )}
                        {playerInfo.blitz_k && (
                            <p className="text-sm text-gray-500">K-factor: {playerInfo.blitz_k}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                    {playerInfo.w_title && (
                        <p className="text-gray-600">Woman title: {playerInfo.w_title}</p>
                    )}
                    {playerInfo.o_title && (
                        <p className="text-gray-600">Organizational title: {playerInfo.o_title}</p>
                    )}
                </div>
                <div>
                    {playerInfo.foa_title && (
                        <p className="text-gray-600">FIDE Office Arena title: {playerInfo.foa_title}</p>
                    )}
                    {playerInfo.birthday && (
                        <p className="text-gray-600">Birthday: {formatDate(playerInfo.birthday)}</p>
                    )}
                </div>
            </div>
        </div>
    );
}