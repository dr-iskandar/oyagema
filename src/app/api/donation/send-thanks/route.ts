import { NextRequest, NextResponse } from 'next/server';

const DONATION_SERVICE_URL = process.env.DONATION_SERVICE_URL || 'http://localhost:8996';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { donor_name, donor_email, amount, order_id } = body;
    
    if (!donor_name || !donor_email || !amount || !order_id) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: donor_name, donor_email, amount, order_id'
        },
        { status: 400 }
      );
    }

    // Forward request to donation service
    const response = await fetch(`${DONATION_SERVICE_URL}/donation/send-thanks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donor_name,
        donor_email,
        amount,
        transaction_id: body.transaction_id || order_id, // Gunakan order_id sebagai fallback untuk transaction_id
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: data.message || 'Failed to send thank you email'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Send thanks API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}