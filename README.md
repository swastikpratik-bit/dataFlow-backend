# Data Management API Server

Modern Node.js backend API server for data management with CSV upload functionality.

## Features

- CSV file upload and processing
- PostgreSQL database integration
- RESTful API endpoints
- Error handling and logging
- Security middleware (Helmet, CORS)
- Environment-based configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Health check
- `POST /api/upload` - Upload CSV file
- `GET /api/data` - Get all data
- `GET /api/data/:id` - Get data by ID

## Project Structure

```
src/
├── config/         # Database and app configuration
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Data models (future use)
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Utility functions
```