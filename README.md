# Movies-API

A comprehensive RESTful API built with TypeScript and Express.js that provides movie information, ratings, and detailed movie data integration with external APIs.

## Features

- **Movie Listings**: Paginated movie listings with search and filtering capabilities
- **Movie Details**: Complete movie information including ratings from multiple sources
- **Year-based Search**: Filter movies by release year with sorting options
- **Genre-based Search**: Find movies by genre categories
- **External API Integration**: 
  - Local ratings database integration
  - OMDB API integration for Rotten Tomatoes ratings
- **Comprehensive Error Handling**: Structured error responses with logging
- **Request Logging**: Transaction-based logging for debugging and monitoring

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite3
- **External APIs**: OMDB API
- **Logging**: Custom structured logging system
- **Validation**: Custom validation middleware

## API Endpoints

### Movies
- `GET /movies` - List all movies (paginated)
- `GET /movies/details/:imdbId` - Get detailed movie information
- `GET /movies/year/:year` - Get movies by release year
- `GET /movies/genre?genre=<genre>` - Get movies by genre

### Ratings  
- `GET /ratings/:movieId` - Get ratings for a specific movie
- `GET /heartbeat` - API health check

### System
- `GET /health` - System health check and configuration status

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movie-api.git
   cd movie-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   NODE_ENV=development
   OMDB_API_KEY=your_omdb_api_key_here
   RATINGS_API_URL=http://localhost:4000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `OMDB_API_KEY` | OMDB API key for Rotten Tomatoes ratings | - |
| `RATINGS_API_URL` | URL for local ratings API | `http://localhost:4000` |

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Movie Details Response Example

```json
{
  "success": true,
  "message": "Movie details fetched successfully",
  "data": {
    "imdb_id": "tt0107286",
    "title": "Judgment Night",
    "description": "Four friends on their way to a boxing match...",
    "release_date": "1993-10-15",
    "budget": "$21,000,000",
    "runtime": 110,
    "average_rating": 3.9,
    "genres": ["Crime", "Drama", "Thriller"],
    "original_language": "en",
    "production_companies": [
      "Universal Pictures",
      "Largo Entertainment"
    ],
    "ratings": [
      {
        "source": "Local",
        "value": 3.9
      },
      {
        "source": "Rotten Tomatoes",
        "value": "36%"
      }
    ]
  }
}
```

## Database Schema

The API uses SQLite databases with the following main tables:

- **movies**: Movie information with IMDB integration
- **ratings**: User ratings linked to internal movie IDs

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite (if implemented)
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── config/          # Configuration files
├── constants/       # Error messages and constants
├── controllers/     # Route handlers
├── errors/          # Custom error classes
├── mappers/         # Data transformation logic
├── middlewares/     # Express middlewares
├── routes/          # Route definitions
├── services/        # Business logic and external API calls
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and logging
└── validators/      # Input validation logic
```

## Error Handling

The API implements comprehensive error handling with:

- Custom error classes for different error types
- Centralized error handling middleware
- Structured error logging with transaction IDs
- Graceful degradation for external API failures

## Logging

All requests are logged with:
- Unique transaction IDs
- Request/response timing
- Error tracking with context
- Structured JSON format for easy parsing

## External API Integration

### OMDB API
- Provides Rotten Tomatoes ratings
- Graceful fallback if API is unavailable
- Configurable through environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or questions, please open an issue on GitHub.
