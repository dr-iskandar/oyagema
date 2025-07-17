# Donation Service

A Node.js Express microservice for handling QRIS donations integrated with the Oyagema music platform.

## Features

- **QRIS Payment Integration**: Direct integration with PVPG payment gateway for QRIS payments
- **Email Notifications**: Automated thank you emails sent to donors upon successful payment
- **Donation Tracking**: Order ID generation and payment verification
- **Webhook Support**: Real-time payment status updates from payment gateway
- **API Integration**: RESTful API endpoints for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (optional - for donation tracking)
- PVPG payment gateway credentials
- Email service credentials (SMTP)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=8996
PAYMENT_URL=https://api.pvpg.id
CLIENT_ID=your_pvpg_client_id
CLIENT_SECRET=your_pvpg_client_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
DONATION_SERVICE_URL=http://localhost:8996
```

3. Start the service:
```bash
npm start
```

The service will run on `http://localhost:8996`

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Donation Operations
- **POST** `/donation/create` - Create new donation payment
- **POST** `/donation/verify` - Verify payment status
- **POST** `/donation/webhook` - Handle payment gateway webhooks
- **POST** `/donation/send-thanks` - Send thank you email
- **GET** `/donation/status/:orderId` - Get donation status

## Frontend Integration

The service integrates with the Next.js frontend through API routes:

- `/api/donation/create` - Creates donation payment
- `/api/donation/verify` - Verifies payment status
- `/api/donation/send-thanks` - Sends thank you email

## Usage Example

### Creating a Donation

```javascript
const response = await fetch('/api/donation/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    donor_name: 'John Doe',
    donor_email: 'john@example.com',
    amount: 50000,
    message: 'Keep up the great work!'
  }),
});

const data = await response.json();
// Redirect to data.data.redirectUrl for payment
```

## Payment Flow

1. **Donation Creation**: User fills donation form and submits
2. **Payment Gateway**: Service creates payment request with PVPG
3. **QRIS Display**: User scans QR code to complete payment
4. **Webhook Notification**: Payment gateway sends status update
5. **Email Confirmation**: Thank you email sent to donor

## Error Handling

The service includes comprehensive error handling:
- Input validation using Joi schemas
- Custom error classes for different error types
- Proper HTTP status codes and error messages
- Logging for debugging and monitoring

## Security Features

- HMAC-SHA256 signature verification for payment gateway
- Input sanitization and validation
- CORS configuration for frontend integration
- Environment variable protection for sensitive data

## Development

### Running in Development Mode
```bash
npm run dev
```

### Project Structure
```
donation-service/
├── controllers/          # Request handlers
├── services/            # Business logic
├── routes/              # API routes
├── validators/          # Input validation schemas
├── helpers/             # Utility functions
├── middlewares/         # Express middlewares
├── errors/              # Custom error classes
├── models/              # Database models (Sequelize)
├── config/              # Database configuration
└── index.js             # Application entry point
```

## Contributing

1. Follow the existing code structure and patterns
2. Add proper error handling and validation
3. Include appropriate logging for debugging
4. Test API endpoints thoroughly
5. Update documentation for any new features

## License

This project is part of the Oyagema music platform.