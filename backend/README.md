# Orders Tracker Backend API

A RESTful API built with Node.js, Express, and PostgreSQL for managing orders and tracking.

## Features

- 🏓 Simple ping endpoint
- 📊 PostgreSQL database with Docker
- 📚 Swagger API documentation
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Error handling
- 🔄 Development mode with auto-restart
- 🐳 Docker Compose for database

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: helmet
- **Development**: nodemon
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js (v14 or higher)
- Docker & Docker Compose
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
   cp env.template .env
   ```

   Edit the `.env` file if needed:

   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=orders_tracker
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

4. **Start the PostgreSQL database with Docker**

   ```bash
   npm run docker:up
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

## Database Schema

### Orders Table

- `id` - UUID primary key
- `customer_name` - Customer name (nullable)
- `address` - Delivery address
- `status` - Order status ('CREATED', 'PREPARING', 'DISPATCHED', 'DELIVERED')
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Order Events Table

- `id` - Serial primary key
- `order_id` - UUID foreign key to orders
- `event_type` - Event type (same as status values)
- `timestamp` - Event timestamp
- Unique constraint on (order_id, event_type)

### Alert Rules Table

- `id` - Serial primary key
- `rule_type` - Rule type (e.g., 'NOT_DISPATCHED_IN_X_DAYS')
- `threshold` - Threshold value (days/hours)
- `active` - Whether rule is active

### Alerts Table

- `id` - Serial primary key
- `order_id` - UUID foreign key to orders
- `alert_type` - Alert type
- `message` - Alert message
- `triggered_at` - When alert was triggered
- `resolved` - Whether alert is resolved

## API Endpoints

### Ping

- `GET /api/ping` - Simple ping endpoint

### Health Check

- `GET /api/health` - Database health check

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

### Check Database Health

```bash
curl -X GET http://localhost:3000/api/health
```

Response:

```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

## Environment Variables

| Variable      | Description       | Default        |
| ------------- | ----------------- | -------------- |
| `PORT`        | Server port       | 3000           |
| `NODE_ENV`    | Environment mode  | development    |
| `DB_HOST`     | Database host     | localhost      |
| `DB_PORT`     | Database port     | 5432           |
| `DB_NAME`     | Database name     | orders_tracker |
| `DB_USER`     | Database user     | postgres       |
| `DB_PASSWORD` | Database password | postgres       |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run docker:up` - Start PostgreSQL with Docker
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:logs` - View Docker logs

## Docker Commands

### Start Database

```bash
docker-compose up -d
```

### Stop Database

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── swagger.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── ping.js
│   └── server.js
├── docker-compose.yml
├── package.json
├── env.template
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
5. Use production PostgreSQL instance
6. Set up proper database backups

## License

This project is licensed under the ISC License.
