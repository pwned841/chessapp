// app/api/chess-com/check/route.ts
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ exists: false });
    }

    try {
        const response = await fetch(`https://api.chess.com/pub/player/${username}`);

        if (response.ok) {
            const data = await response.json();

            return NextResponse.json({
                exists: true,
                username,
                country: data.country,
                joined: data.joined,
                url: `https://www.chess.com/member/${username}`
            });
        }

        return NextResponse.json({ exists: false });

    } catch (error) {
        console.error('Error checking Chess.com profile:', error);
        return NextResponse.json({ exists: false });
    }
}
