# Orders Tracker Backend API

A simple RESTful API built with Node.js and Express.

## Features

- 🏓 Simple ping endpoint
- 📚 Swagger API documentation
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Error handling
- 🔄 Development mode with auto-restart

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: helmet
- **Development**: nodemon

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. **Navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables (optional)**

   ```bash
   cp env.example .env
   ```

   Edit the `.env` file if needed:

   ```env
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Ping

- `GET /api/ping` - Simple ping endpoint

### Documentation

- `GET /api-docs` - Swagger API documentation

## Usage Examples

### Ping the API

```bash
curl -X GET http://localhost:3000/api/ping
```

Response:

```json
{
  "success": true,
  "message": "pong",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

## Environment Variables

| Variable   | Description      | Default     |
| ---------- | ---------------- | ----------- |
| `PORT`     | Server port      | 3000        |
| `NODE_ENV` | Environment mode | development |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── swagger.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── ping.js
│   └── server.js
├── package.json
├── env.example
├── .gitignore
└── README.md
```

## Development

The server will automatically restart when you make changes to the code (in development mode).

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure reverse proxy if needed

## License

This project is licensed under the ISC License.
