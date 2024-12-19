// app/components/FIDEInfo.tsx
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
        <>
            <div className="flex flex-col items-center mb-6">
                <Image
                    src="https://ratings.fide.com/img/logo/fide-logo.svg"
                    alt="FIDE Logo"
                    width={200}
                    height={80}
                    className="mb-4"
                    priority
                />
                <Link
                    href={`https://ratings.fide.com/profile/${playerInfo.fideid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                    View FIDE Profile
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-4">Player Profile: {playerInfo.fideid}</h1>

            <div className="mb-6 border-2 border-purple-800 rounded-md p-4">
                <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Name:</strong> {playerInfo.name}</p>
                    <p><strong>FIDE ID:</strong> {playerInfo.fideid}</p>
                    <p><strong>Country:</strong> {playerInfo.country}</p>
                    <p><strong>Sex:</strong> {playerInfo.sex}</p>
                    <p><strong>Birthday:</strong> {playerInfo.birthday || 'N/A'}</p>
                </div>
            </div>

            {(playerInfo.title || playerInfo.w_title || playerInfo.o_title || playerInfo.foa_title) && (
                <div className="mb-6 border-2 border-purple-800 rounded-md p-4">
                    <h2 className="text-xl font-semibold mb-3">Title</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {playerInfo.title && <p><strong>FIDE Title:</strong> {playerInfo.title}</p>}
                        {playerInfo.w_title && <p><strong>Women&apos;s Title:</strong> {playerInfo.w_title}</p>}
                        {playerInfo.o_title && <p><strong>Online Title:</strong> {playerInfo.o_title}</p>}
                        {playerInfo.foa_title && <p><strong>FOA Title:</strong> {playerInfo.foa_title}</p>}
                    </div>
                </div>
            )}

            <div className="mb-6 border-2 border-purple-800 rounded-md p-4">
                <h2 className="text-xl font-semibold mb-3">Rating</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Standard Rating:</strong> {playerInfo.rating || 'N/A'}</p>
                    <p><strong>Rapid Rating:</strong> {playerInfo.rapid_rating || 'N/A'}</p>
                    <p><strong>Blitz Rating:</strong> {playerInfo.blitz_rating || 'N/A'}</p>
                </div>
            </div>
        </>
    );
}
