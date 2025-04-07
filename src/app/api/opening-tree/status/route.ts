import { NextRequest, NextResponse } from 'next/server';

// État global pour suivre le statut des recherches
interface SearchStatus {
  [username: string]: {
    status: string;
    progress: number;
    lastUpdate: number;
  };
}

const searchStatuses: SearchStatus = {};

// Cette fonction doit être exportée si elle est la fonction de gestionnaire HTTP
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const status = searchStatuses[username] || {
    status: 'idle',
    progress: 0,
    lastUpdate: Date.now()
  };

  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, status, progress } = body;

    if (!username || typeof status !== 'string' || typeof progress !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Mettre à jour le statut
    searchStatuses[username] = {
      status,
      progress,
      lastUpdate: Date.now()
    };

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update search status' },
      { status: 500 }
    );
  }
}

// Ne pas exporter cette fonction - elle n'est pas autorisée dans les API routes Next.js
