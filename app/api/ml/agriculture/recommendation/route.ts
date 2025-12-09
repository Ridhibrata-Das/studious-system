import { NextRequest, NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { n, p, k, temperature, humidity, soil_moisture } = body;
    
    if (typeof n !== 'number' || typeof p !== 'number' || typeof k !== 'number' || 
        typeof temperature !== 'number' || typeof humidity !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid sensor data. Required: n, p, k, temperature, humidity' },
        { status: 400 }
      );
    }

    // Forward request to ML service
    const response = await fetch(`${ML_SERVICE_URL}/agriculture/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        n,
        p,
        k,
        temperature,
        humidity,
        soil_moisture: soil_moisture || null
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ML service error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error getting agriculture recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let endpoint = '/agriculture/statistics';
    if (type === 'npk-ranges') {
      endpoint = '/agriculture/npk-ranges';
    }

    const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ML service error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching agriculture data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agriculture data' },
      { status: 500 }
    );
  }
}
