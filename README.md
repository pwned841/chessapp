# ChessApp

ChessApp is an open-source chess analytics platform. Search for FIDE players, analyze games, explore opening repertoires, and simulate Elo changes—all in one place.

- 🌐 Live: [ChessApp](https://chessapp-ksqc.vercel.app)
- 🛠️ Built with Next.js, React, Tailwind CSS, Prisma, and TypeScript
- ♟️ Supports FIDE, Chess.com, and Lichess.org data
- 📊 Features: Player search, opening explorer, game analysis, Elo calculator, and more

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables (see `.env.example`).

3. Run the development server:

```bash
# Clone the repository
git clone https://github.com/pwned841/chessapp.git

# Navigate to the folder
cd chessapp

# Create a .env file and configure your database connection 
Example: DATABASE_URL=your-database-url

# Install dependencies
npm install

# Start the project in development mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Contributing

ChessApp is open-source! Contributions, bug reports, and feature requests are welcome.

- 🐛 Report issues: [https://github.com/pwned841/chessapp/issues](https://github.com/pwned841/chessapp/issues)

## Features

- Search and view FIDE player profiles
- Find linked Chess.com and Lichess.org accounts
- Explore opening repertoires with Stockfish analysis
- Analyze games and get improvement tips
- Simulate Elo changes for matches and tournaments
- Map of chess clubs and locations

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Framer Motion
- Stockfish (browser engine)

## License

MIT

---

If you find a bug or want to suggest a feature, please open an issue on GitHub!
