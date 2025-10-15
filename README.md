# Typing Master - Solana Edition

A competitive typing game built on the Solana blockchain with Next.js frontend.

## Project Structure

```
typing-master-solana/
├── program/                 # Solana smart contract (native, no Anchor)
│   ├── src/
│   │   ├── lib.rs          # Program entry point
│   │   ├── instruction.rs  # Instruction definitions
│   │   ├── processor.rs    # Business logic
│   │   ├── state.rs        # Account structures
│   │   └── error.rs        # Custom errors
│   └── Cargo.toml         # Rust dependencies
├── app/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── hooks/         # Custom hooks for Solana integration
│   ├── package.json       # Node.js dependencies
│   └── tsconfig.json      # TypeScript configuration
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## Features

### Solana Smart Contract
- **Player Accounts**: Store typing statistics on-chain
- **Contest System**: Create and join multiplayer typing contests
- **Performance Tracking**: WPM, accuracy, and progress tracking
- **Wallet Integration**: Phantom and Solflare wallet support

### Frontend Features
- **Practice Mode**: Improve typing skills with immediate feedback
- **Contest Mode**: Compete with other players in real-time
- **Statistics Dashboard**: View performance metrics and progress
- **Wallet Connection**: Seamless Solana wallet integration

## Prerequisites

1. **Rust & Cargo** (for Solana program)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Solana CLI Tools**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
   ```

3. **Node.js & npm** (for frontend)
   ```bash
   # Install Node.js 18+ from https://nodejs.org/
   ```

4. **Solana Wallet** (for testing)
   - Install [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)

## Quick Start

### 1. Install Dependencies
```bash
# Install Solana dependencies
cd program && cargo build

# Install frontend dependencies  
cd ../app && npm install
```

### 2. Start Development
```bash
# Start the Next.js development server
cd app && npm run dev
```

Visit http://localhost:3000 to see the application.

## Usage

1. **Connect Wallet**: Click "Select Wallet" and connect your Solana wallet
2. **Initialize Account**: First-time users need to initialize their player account
3. **Practice**: Use the Practice tab to improve typing skills
4. **Compete**: Join or create contests in the Contests tab
5. **Track Progress**: View statistics and progress in the Statistics tab

## Technology Stack

- **Blockchain**: Solana (native programs, no Anchor)
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Wallet Integration**: Solana Wallet Adapter
- **Build Tools**: Cargo (Rust), npm (Node.js)

## Development Status

✅ **Completed:**
- Solana smart contract with player accounts and contests
- Next.js frontend with wallet integration
- Practice typing interface
- Contest creation and management UI
- Statistics dashboard
- Wallet connection and authentication

🚧 **In Progress:**
- Solana program deployment and testing
- Real-time contest functionality
- Performance optimizations

📋 **Todo:**
- Leaderboards and rankings
- NFT rewards for achievements
- Tournament system
- Mobile responsive optimizations
- **No framework frontend** - pure HTML, CSS, and JavaScript with Alpine.js for reactivity

## Tech Stack

### Backend
- **Rust** with Actix Web framework
- **In-memory storage** (easily extensible to database)
- **RESTful API** for test generation and result submission
- **CORS enabled** for cross-origin requests

### Frontend
- **HTML5** with semantic markup
- **Tailwind CSS** for styling
- **Alpine.js** for reactive components
- **Vanilla JavaScript** for game logic

## Project Structure

```
typing-master-solana/
├── backend/                 # Rust backend server
│   ├── src/
│   │   ├── main.rs         # Main server entry point
│   │   ├── models.rs       # Data structures
│   │   ├── handlers.rs     # API route handlers
│   │   └── services.rs     # Business logic
│   └── Cargo.toml         # Rust dependencies
├── frontend/               # Frontend files
│   ├── index.html         # Main HTML page
│   └── static/
│       ├── css/
│       │   └── style.css  # Custom CSS styles
│       └── js/
│           └── app.js     # Alpine.js application logic
└── texts/                 # Sample text files for typing tests
    ├── sample1.txt
    └── sample2.txt
```

## Getting Started

### Prerequisites
- Rust (latest stable version)
- A modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd typing-master-solana
   ```

2. **Build and run the backend**
   ```bash
   cd backend
   cargo run
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:8080`

## API Endpoints

- `GET /api/test/{words}` - Generate a typing test with specified word count
- `POST /api/submit` - Submit typing test result
- `GET /api/leaderboard` - Get leaderboard entries
  - Query parameters:
    - `limit` - Number of entries to return (default: 10)
    - `words` - Filter by word count

## Game Features

### Test Settings
- **Word Count**: Choose between 10, 25, 50, or 100 words
- **Player Name**: Enter your name to track your progress

### Real-time Statistics
- **WPM**: Words per minute calculation
- **Accuracy**: Percentage of correctly typed characters
- **Time**: Elapsed time in seconds
- **Mistakes**: Number of incorrect words

### Leaderboard
- View top players sorted by WPM and accuracy
- Filter results by word count
- See completion dates and detailed statistics

## Development

### Backend Development
```bash
cd backend
cargo watch -x run  # Auto-reload on file changes
```

### Adding Custom Texts
Place `.txt` files in the `texts/` directory. The backend can be extended to load custom text files for typing tests.

### Extending the API
The modular structure makes it easy to add new features:
- Add new endpoints in `handlers.rs`
- Create new data models in `models.rs`
- Implement business logic in `services.rs`

## Customization

### Frontend Styling
- Modify `frontend/static/css/style.css` for custom styles
- Tailwind classes can be customized in the HTML
- Alpine.js reactivity can be extended in `frontend/static/js/app.js`

### Backend Configuration
- Server port and host can be modified in `main.rs`
- Add database integration by replacing in-memory storage
- Implement user authentication and sessions

## Performance Features

- **Memory Safety**: Rust's ownership system prevents memory leaks
- **Zero-cost Abstractions**: High performance without runtime overhead
- **Concurrent Handling**: Actix Web provides excellent concurrent request handling
- **Minimal Frontend**: No heavy frameworks, fast loading times

## Future Enhancements

- [ ] Database integration (PostgreSQL/SQLite)
- [ ] User authentication and profiles
- [ ] Real-time multiplayer typing races
- [ ] Custom text upload and management
- [ ] Detailed analytics and progress tracking
- [ ] Difficulty levels and typing lessons
- [ ] WebSocket integration for live competitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).