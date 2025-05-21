# Word Tower

A competitive word-guessing game where players climb the tower by guessing words of increasing difficulty.

## Features

- Progressive word difficulty (4-8 letters)
- Time-based gameplay with power-ups
- Global leaderboards
- User profiles and achievements
- Modern, responsive UI
- Real-time game state updates

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Socket.IO for real-time updates

## Project Structure

```
word-tower/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main application component
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/word-tower.git
   cd word-tower
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```

4. Create environment files:

   For the frontend (`client/.env`):
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

   For the backend (`server/.env`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/word-tower
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Game Rules

1. Players start at level 1 with 4-letter words
2. Each level increases word length by 1 (up to 8 letters)
3. Players have 6 attempts to guess each word
4. Correct letter in correct position: Green
5. Correct letter in wrong position: Yellow
6. Time limit of 60 seconds per word
7. Power-ups available:
   - Reveal a letter
   - Add 30 seconds
   - Skip to next word

## Scoring System

- Base points for correct guess
- Time bonus for quick completion
- Combo multiplier for consecutive wins
- Level bonus for higher difficulty

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Word list sourced from [SOWPODS](https://www.wordgamedictionary.com/sowpods/)
- Inspired by popular word-guessing games