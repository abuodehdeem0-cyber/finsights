# FinSight - Premium Financial Terminal

A full-stack, high-performance financial terminal with AI-powered investment signals, real-time market data, and dual-currency portfolio tracking.

## Features

### Core Intelligence
- **Binary Signal System**: Clear BUY/SELL/HOLD recommendations
- **Risk Quantization**: Risk levels (Low/Medium/High) with 3-5 volatility factors
- **Confidence Scoring**: Percentage-based confidence with color-coding
- **Dual-Currency Support**: Native USD/SAR logic for all portfolio calculations

### Premium Noir UI
- **Noir-Premium Design**: Pure Black (#000000) and Deep Crimson (#4a0f0f)
- **Zero-White Rule**: Muted grays (#d1d1d1) instead of pure white
- **Crimson Glow Aesthetic**: Red CSS box-shadow on interactive elements
- **Glassmorphism**: Dark-red blurs for "living terminal" feel
- **Animated Gradients**: Background with continuous motion

### 6-Page Ecosystem
1. **Dashboard**: Real-time market overview with ticker and charts
2. **Analysis**: AI stock analysis with signals and reasoning
3. **Portfolio**: Holdings tracking with USD/SAR dual-currency
4. **Sector Hub**: Industry heatmaps and sentiment indicators
5. **Login/Register**: Glassmorphism auth with currency selection

## Technology Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Interactive charts
- **Lucide React** - Premium icons

### Backend
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Database via Prisma ORM
- **JWT Auth** - Secure authentication
- **Zod** - Schema validation

### Data Feeds
- **Alpha Vantage API** - Real-time market metrics
- **Mock Data Fallback** - Development/demo purposes

## Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Alpha Vantage API key

### Setup

1. **Clone and navigate**
   ```bash
   cd finsight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local .env.local
   # Edit .env.local with your credentials:
   # ALPHA_VANTAGE_API_KEY=your_key
   # DATABASE_URL=postgresql://...
   # NEXTAUTH_SECRET=your_secret
   ```

4. **Database setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT
- `POST /api/auth/register` - User registration

### Market Data
- `GET /api/market/quote?symbol={symbol}` - Stock quote
- `GET /api/market/search?keywords={query}` - Symbol search

### Portfolio
- `GET /api/portfolio` - User holdings
- `POST /api/portfolio` - Add position
- `DELETE /api/portfolio?id={id}` - Remove position

## Project Structure

```
finsight/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Dashboard
│   │   ├── analysis/page.tsx  # Stock analysis
│   │   ├── portfolio/page.tsx # Portfolio tracking
│   │   ├── sectors/page.tsx   # Sector hub
│   │   ├── login/page.tsx     # Auth login
│   │   ├── register/page.tsx  # Auth register
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── navigation.tsx     # Main nav
│   │   ├── ui/glass-card.tsx  # Glassmorphism card
│   │   ├── stock-ticker.tsx   # Animated ticker
│   │   └── market-chart.tsx   # Recharts chart
│   ├── lib/
│   │   ├── utils.ts           # Helper functions
│   │   ├── prisma.ts          # Database client
│   │   └── alpha-vantage.ts   # Market data API
│   └── app/globals.css        # Noir design system
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── package.json
├── tailwind.config.js         # Noir theme config
├── next.config.js
└── README.md
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Environment Variables for Production
- `ALPHA_VANTAGE_API_KEY` - Your API key
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret string
- `NEXTAUTH_URL` - Your production URL

## Design System

### Colors
- **Primary**: `#000000` (Black)
- **Crimson**: `#4a0f0f`, `#6b1515`, `#8b1a1a`
- **Text**: `#d1d1d1` (Gray), `#8a8a8a` (Dark gray)
- **Signals**: `#22c55e` (Buy), `#ef4444` (Sell), `#f59e0b` (Hold)

### Effects
- **Glassmorphism**: `backdrop-filter: blur(12px)`
- **Glow**: `box-shadow: 0 0 20px rgba(74, 15, 15, 0.5)`
- **Gradient**: Animated background shifts

## Disclaimer

This tool is for educational purposes only and should not be used for making actual investment decisions. Always consult with financial professionals before making investment choices.
