import { NextRequest, NextResponse } from 'next/server';

const DONATION_SERVICE_URL = process.env.DONATION_SERVICE_URL || 'http://localhost:8996';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { order_id, transaction_id } = body;
    
    if (!order_id || !transaction_id) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: order_id, transaction_id'
        },
        { status: 400 }
      );
    }

    // Forward request to donation service
    const response = await fetch(`${DONATION_SERVICE_URL}/donation/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id,
        transaction_id
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: data.message || 'Failed to verify donation payment'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Donation verify API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}