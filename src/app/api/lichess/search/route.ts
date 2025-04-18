import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  try {
    // Clean up the name - remove titles and extra spaces
    let cleanName = name.replace(/\([^)]*\)/g, '').trim();
    // Remove titles like "GM", "IM", etc. from the start of the name
    cleanName = cleanName.replace(/^(GM|IM|FM|CM|WGM|WIM|WFM|WCM)\s+/i, '');
    
    // Generate name variations to try
    const nameParts = cleanName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    const variations_to_try = [
      cleanName.replace(/\s+/g, ''),           // FullNameNoSpaces
      `${firstName}${lastName}`,                // FirstNameLastName
      firstName,                                // FirstName
      lastName,                                 // LastName (if exists)
      `${firstName.charAt(0)}${lastName}`,      // InitialLastName
      `${firstName}_${lastName}`,               // FirstName_LastName
      `${lastName}${firstName}`                 // LastNameFirstName
    ].filter(Boolean); // Remove empty strings
    
    // Remove duplicates
    const uniqueVariations = [...new Set(variations_to_try)];
    
    // Use Lichess API to search for users
    const response = await fetch(`https://lichess.org/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        names: uniqueVariations
      })
    });
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch data from Lichess API',
        statusText: response.statusText
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lichess API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Lichess API' },
      { status: 500 }
    );
  }
}
