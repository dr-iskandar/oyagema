import { NextRequest, NextResponse } from 'next/server';

const DONATION_SERVICE_URL = process.env.DONATION_SERVICE_URL || 'http://localhost:8996';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { donor_name, donor_email, amount } = body;
    
    if (!donor_name || !donor_email || !amount) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: donor_name, donor_email, amount'
        },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Minimum donation amount is Rp 1'
        },
        { status: 400 }
      );
    }

    // Forward request to donation service
    const response = await fetch(`${DONATION_SERVICE_URL}/donation/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donor_name,
        donor_email,
        amount,
        payment_method: 'QRIS',
        message: body.message || ''
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: data.message || 'Failed to create donation payment'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Donation API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}