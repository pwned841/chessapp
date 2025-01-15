import Image from 'next/image';
import Link from "next/link";

interface FIDEInfoProps {
    playerInfo: {
        fideid: number;
        name: string;
        country: string;
        sex: string;
        title?: string;
        w_title?: string;
        o_title?: string;
        foa_title?: string;
        rating?: number;
        rapid_rating?: number;
        blitz_rating?: number;
        birthday?: string;
    }
}

export function FIDEInfo({ playerInfo }: FIDEInfoProps) {
    return (
        <div className="w-full max-w-4xl mx-auto p-2 sm:p-6">
            {/* Main header with name and country */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4 sm:mb-8 bg-violet-950 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white text-center sm:text-left">{playerInfo.name}</h1>
                    <div className="flex items-center gap-3">
                        <Image
                            src={`https://ratings.fide.com/svg/${playerInfo.country}.svg`}
                            alt={`Flag of ${playerInfo.country}`}
                            width={36}
                            height={36}
                            className="object-contain"
                            priority
                        />
                        <span className="text-xl sm:text-2xl text-violet-200">{playerInfo.country}</span>
                    </div>
                </div>
            </div>

            {/* FIDE Profile Preview and Link */}
            <Link
                href={`https://ratings.fide.com/profile/${playerInfo.fideid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <div className="group border border-violet-500 rounded-lg p-4 sm:p-6 hover:bg-violet-900 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4 gap-4 sm:gap-0">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Image
                                src="https://ratings.fide.com/img/logo/fide-logo.svg"
                                alt="FIDE Logo"
                                width={60}
                                height={60}
                                className="object-contain"
                                priority
                            />
                            <div className="text-center sm:text-left">
                                <h2 className="text-lg sm:text-xl font-semibold text-violet-200">FIDE Profile</h2>
                                <p className="text-violet-300">ID: {playerInfo.fideid}</p>
                            </div>
                        </div>
                        <div className="text-violet-400 group-hover:text-white transition-colors duration-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-violet-300">
                        {playerInfo.title && (
                            <div className="bg-violet-950 bg-opacity-50 p-3 rounded">
                                <strong className="block text-violet-200">Title:</strong>
                                {playerInfo.title}
                            </div>
                        )}
                        {playerInfo.rating && (
                            <div className="bg-violet-950 bg-opacity-50 p-3 rounded">
                                <strong className="block text-violet-200">Standard Rating:</strong>
                                {playerInfo.rating}
                            </div>
                        )}
                        {playerInfo.rapid_rating && (
                            <div className="bg-violet-950 bg-opacity-50 p-3 rounded">
                                <strong className="block text-violet-200">Rapid Rating:</strong>
                                {playerInfo.rapid_rating}
                            </div>
                        )}
                        {playerInfo.blitz_rating && (
                            <div className="bg-violet-950 bg-opacity-50 p-3 rounded">
                                <strong className="block text-violet-200">Blitz Rating:</strong>
                                {playerInfo.blitz_rating}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}