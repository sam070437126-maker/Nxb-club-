import express from 'express';
import path from 'path';
import axios from 'axios';
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global safety handlers
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

async function startServer() {
  const app = express();
  // In development (AI Studio), bind strictly to port 3000 where Nginx reverse proxy forwards traffic.
  // In Cloud Run deployment (where K_SERVICE or production PORT is set), bind to process.env.PORT (defaults to 8080).
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
  const isDev = !isCloudRun && process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || Boolean(process.env.DEFAULT_APP_PORT));
  const port = isDev ? 3000 : (Number(process.env.PORT) || 8080);

  // --- MIDDLEWARE ---
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(express.json());

  // --- CONFIGURATION ---
  const API_KEYS = [
      'c99171a5658ec12d1ff0e76b772e7275',
      '4ac55114fd9a7626b88324266b3a3fa7'
  ];
  let currentKeyIndex = 0;
  
  const FIREBASE_DB_URL = "https://betplusai-default-rtdb.firebaseio.com/";
  const SERVICE_ACCOUNT_PATH = '/etc/secrets/serviceAccountKey.json';

  // --- IN-MEMORY CACHE ---
  let GAME_ENGINE = {
    matches: [] as any[],
    jackpot: [] as any[],
    lastUpdated: 0,
    isUpdating: false
  };

  // --- LEAGUE CONFIG (Server Side) ---
  const POPULAR_LEAGUES = [
      'Premier League', 'UEFA Champions League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 
      'UEFA Europa League', 'Brasileirão', 'Major League Soccer', 'NBA', 'EuroLeague'
  ];

  const isPopularLeague = (name: string) => POPULAR_LEAGUES.some(pop => name.includes(pop));

  // --- FIREBASE INIT ---
  let db: admin.database.Database | null = null;
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_DB_URL
      });
      db = admin.database();
      console.log("✅ Engine: Firebase Connected");
    } catch (error: any) {
      console.error("❌ Engine: Firebase Init Failed:", error.message);
    }
  }

  // --- DATA FETCHING ENGINE ---
  let lastScheduledFetch = 0;
  let cachedScheduled: any = null;
  let cachedScheduledTomorrow: any = null;
  let cachedOdds: any = null;
  let cachedOddsTomorrow: any = null;

  const fetchProxy = async (url: string) => {
      let attempts = 0;
      while (attempts < API_KEYS.length) {
          const key = API_KEYS[currentKeyIndex];
          try {
              const response = await axios.get(`https://v3.football.api-sports.io${url}`, {
                  headers: { 'x-apisports-key': key },
                  timeout: 10000
              });
              
              const data = response.data;
              if (data.errors && (data.errors.requests || data.errors.token || data.errors.rateLimit)) {
                  console.warn(`Engine: API Key ${currentKeyIndex + 1} limit reached. Switching...`);
                  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                  attempts++;
                  continue;
              }
              return data;
          } catch (e: any) {
              if (e.response && (e.response.status === 429 || e.response.status === 403)) {
                  console.warn(`Engine: API Key ${currentKeyIndex + 1} HTTP ${e.response.status}. Switching...`);
                  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                  attempts++;
                  continue;
              }
              console.warn(`⚠️ API Error (${url}): ${e.message}`);
              return null;
          }
      }
      console.error("❌ Engine: All API keys exhausted.");
      return null;
  };

  const updateGameEngine = async () => {
      if (GAME_ENGINE.isUpdating) return;
      GAME_ENGINE.isUpdating = true;
      console.log(`🔄 Engine: Syncing Sports Data (${new Date().toLocaleTimeString()})...`);

      try {
          const todayDate = new Date();
          const tomorrowDate = new Date(todayDate);
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          
          const today = todayDate.toISOString().split('T')[0];
          const tomorrow = tomorrowDate.toISOString().split('T')[0];
          
          // Fetch Live Data every time (every 15 mins)
          const live = await fetchProxy('/fixtures?live=all');
          const liveOdds = await fetchProxy('/odds/live');

          // Fetch Scheduled Data only once every 12 hours to save API limits
          const TWELVE_HOURS = 12 * 60 * 60 * 1000;
          if (Date.now() - lastScheduledFetch > TWELVE_HOURS) {
              console.log("🔄 Engine: Fetching Scheduled Data & Pre-match Odds...");
              cachedScheduled = await fetchProxy(`/fixtures?date=${today}`);
              cachedScheduledTomorrow = await fetchProxy(`/fixtures?date=${tomorrow}`);
              cachedOdds = await fetchProxy(`/odds?date=${today}&bet=1`);
              cachedOddsTomorrow = await fetchProxy(`/odds?date=${tomorrow}&bet=1`);
              lastScheduledFetch = Date.now();
          }

          const oddsMap = new Map();
          
          // 1. Process Pre-match Odds
          const processOdds = (oddsData: any) => {
              if (oddsData?.response) {
                  oddsData.response.forEach((item: any) => {
                      const vals = item.bookmakers?.[0]?.bets?.[0]?.values;
                      if (vals) oddsMap.set(item.fixture.id, vals);
                  });
              }
          };
          processOdds(cachedOdds);
          processOdds(cachedOddsTomorrow);

          // 2. Process Live Odds
          if (liveOdds?.response) {
              liveOdds.response.forEach((item: any) => {
                  const matchWinnerBet = item.odds?.find((b: any) => b.id === 1 || b.name === "Match Winner" || b.name === "1x2");
                  if (matchWinnerBet && matchWinnerBet.values) {
                      oddsMap.set(item.fixture.id, matchWinnerBet.values);
                  }
              });
          }

          const rawMatches = [
              ...(live?.response || []), 
              ...(cachedScheduled?.response || []),
              ...(cachedScheduledTomorrow?.response || [])
          ];
          const uniqueMatches = new Map();

          rawMatches.forEach((item: any) => {
              // Processing & De-duplication
              if (uniqueMatches.has(item.fixture.id)) return;

              const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(item.fixture.status.short);
              const isFinished = ['FT', 'AET', 'PEN'].includes(item.fixture.status.short);
              
              // Map Odds
              let mainOdds: any[] = [];
              const rawOddData = oddsMap.get(item.fixture.id);
              if (rawOddData) {
                  mainOdds = rawOddData.map((v: any) => ({
                      id: `odd-${item.fixture.id}-${v.value}`,
                      label: v.value === 'Home' ? '1' : v.value === 'Away' ? '2' : 'X',
                      value: parseFloat(v.odd),
                      marketType: '1x2'
                  }));
              } else {
                  // Mock odds if none available for soccer to ensure it's playable
                  mainOdds = [
                      { id: `odd-${item.fixture.id}-Home`, label: '1', value: 2.10, marketType: '1x2' },
                      { id: `odd-${item.fixture.id}-Draw`, label: 'X', value: 3.20, marketType: '1x2' },
                      { id: `odd-${item.fixture.id}-Away`, label: '2', value: 2.80, marketType: '1x2' }
                  ];
              }

              const matchObj = {
                  id: `fb_${item.fixture.id}`,
                  fixtureId: item.fixture.id, // Keep numeric ID for internal checks
                  sport: 'Soccer',
                  league: item.league.name,
                  startTime: item.fixture.date, // ISO String
                  isLive: isLive,
                  isFinished: isFinished,
                  isPopular: isPopularLeague(item.league.name),
                  minute: item.fixture.status.elapsed,
                  period: item.fixture.status.short,
                  homeTeam: { name: item.teams.home.name, logo: item.teams.home.logo },
                  awayTeam: { name: item.teams.away.name, logo: item.teams.away.logo },
                  scores: { home: item.goals.home ?? 0, away: item.goals.away ?? 0 },
                  winner: item.goals.home > item.goals.away ? '1' : item.goals.away > item.goals.home ? '2' : 'X',
                  odds: { main: mainOdds, secondary: [] }
              };

              uniqueMatches.set(item.fixture.id, matchObj);
          });

          GAME_ENGINE.matches = Array.from(uniqueMatches.values());
          GAME_ENGINE.lastUpdated = Date.now();
          
          // Trigger Settlement after data update
          if (db) settleBets();

      } catch (e: any) {
          console.error("❌ Engine Update Failed:", e.message);
      }
      GAME_ENGINE.isUpdating = false;
  };

  // --- AUTOMATED BET SETTLEMENT ---
  const settleBets = async () => {
      console.log("💰 Engine: Checking Settlements...");
      try {
          if (!db) return;
          const betsSnapshot = await db.ref('bets').once('value');
          if (!betsSnapshot.exists()) return;

          const allUsersBets = betsSnapshot.val();
          const updates: any = {};
          const transactionUpdates: any = {};

          // Iterate Users
          for (const [userId, userBets] of Object.entries(allUsersBets) as any) {
              let userTotalWin = 0;

              for (const [betKey, bet] of Object.entries(userBets) as any) {
                  if (bet.status !== 'open') continue;

                  let isBetFinished = true;
                  let isBetWon = true;

                  // Check all selections in the ticket
                  for (const selection of bet.selections) {
                      // Extract numeric ID from "fb_123456"
                      const fixtureId = parseInt(selection.matchId.split('_')[1]); 
                      const match = GAME_ENGINE.matches.find(m => m.fixtureId === fixtureId);

                      if (!match || !match.isFinished) {
                          isBetFinished = false; 
                          break;
                      }

                      // Check result
                      // selection.selectionLabel is '1', 'X', or '2'
                      if (match.winner !== selection.selectionLabel) {
                          isBetWon = false;
                      }
                  }

                  if (isBetFinished) {
                      const status = isBetWon ? 'won' : 'lost';
                      updates[`bets/${userId}/${betKey}/status`] = status;
                      console.log(`📝 Settling Bet ${betKey}: ${status}`);

                      if (isBetWon) {
                          userTotalWin += bet.potentialReturn;
                          // Log Transaction
                          const txKey = db.ref(`transactions/${userId}`).push().key;
                          transactionUpdates[`transactions/${userId}/${txKey}`] = {
                              id: txKey,
                              type: 'Bet Win',
                              amount: bet.potentialReturn,
                              method: 'Sportsbook',
                              date: new Date().toISOString(),
                              status: 'Success'
                          };
                          // Global Win Feed
                          db.ref('global_wins').push({
                              id: Date.now().toString(),
                              user: 'Player', // In real app, fetch user name
                              amount: bet.potentialReturn,
                              game: 'Sports',
                              timestamp: Date.now()
                          });
                      }
                  }
              }

              // Update Wallet if wins found
              if (userTotalWin > 0) {
                  const walletRef = db.ref(`users/${userId}/wallet/main`);
                  walletRef.transaction((current: number) => (current || 0) + userTotalWin);
              }
          }

          // Commit Status Updates
          if (Object.keys(updates).length > 0) await db.ref().update(updates);
          if (Object.keys(transactionUpdates).length > 0) await db.ref().update(transactionUpdates);

      } catch (e: any) {
          console.error("❌ Settlement Error:", e.message);
      }
  };

  // --- API ROUTES ---
  app.get('/api/matches', (req, res) => {
      res.json(GAME_ENGINE.matches);
  });

  app.get('/api/jackpot', (req, res) => {
      // Return a subset of high-profile upcoming matches for jackpot
      const jackpotMatches = GAME_ENGINE.matches
          .filter(m => !m.isLive && m.isPopular && !m.isFinished)
          .slice(0, 5);
      res.json(jackpotMatches);
  });

  // Admin Route to wipe data (kept for dev)
  app.get('/admin/wipe-users', async (req, res) => {
    if (!db) return res.status(500).send("DB not connected");
    try {
      const list = await admin.auth().listUsers(100);
      if (list.users.length > 0) await admin.auth().deleteUsers(list.users.map(u => u.uid));
      await db.ref('users').remove();
      await db.ref('bets').remove();
      res.send("Cleaned.");
    } catch(e: any) { res.status(500).send(e.message); }
  });

  // --- GEMINI AI PREDICTION ENGINE (Server-Side) ---
  const getAiClient = () => {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) return null;
    try {
      return new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e: any) {
      console.warn("Failed to initialize GoogleGenAI client:", e.message);
      return null;
    }
  };

  app.post('/api/ai/predict', async (req, res) => {
    try {
      const { match } = req.body;
      if (!match) {
        return res.status(400).json({ error: 'Match data is required' });
      }

      const hasOdds = match.odds?.main && match.odds.main.length >= 3;
      const prompt = `You are an expert sports betting analyst. Analyze this match concisely for a betting app user.
Match: ${match.homeTeam?.name || 'Home'} vs ${match.awayTeam?.name || 'Away'}
League: ${match.league || 'Football'}
Current Status: ${match.isLive ? `LIVE (Minute ${match.minute || 0}) - Score: ${match.scores?.home ?? 0}:${match.scores?.away ?? 0}` : 'Upcoming'}
Odds: ${hasOdds ? `
- Home Win: ${match.odds.main.find((o: any) => o.label === '1')?.value || 'N/A'}
- Draw: ${match.odds.main.find((o: any) => o.label === 'X')?.value || 'N/A'}
- Away Win: ${match.odds.main.find((o: any) => o.label === '2')?.value || 'N/A'}` : 'Not available'}

Provide a short, punchy prediction or insight (max 2 sentences). Suggest a safe bet based on the teams' strength.
Do not use markdown formatting.`;

      const ai = getAiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          if (response?.text) {
            return res.json({ prediction: response.text.trim() });
          }
        } catch (geminiError: any) {
          console.warn("Gemini generation warning, falling back to analytical engine:", geminiError.message);
        }
      }

      // Contextual analytical prediction fallback based on live scores & odds
      const home = match.homeTeam?.name || 'Home Team';
      const away = match.awayTeam?.name || 'Away Team';
      const homeOdds = parseFloat(match.odds?.main?.find((o: any) => o.label === '1')?.value) || 2.1;
      const awayOdds = parseFloat(match.odds?.main?.find((o: any) => o.label === '2')?.value) || 2.8;

      let fallbackInsight = "";
      if (match.isLive) {
        const hScore = Number(match.scores?.home) || 0;
        const aScore = Number(match.scores?.away) || 0;
        if (hScore > aScore) {
          fallbackInsight = `${home} is effectively defending their lead with strong tactical discipline. Recommended in-play bet: Next Goal to ${home} or Home Double Chance.`;
        } else if (aScore > hScore) {
          fallbackInsight = `${away} has seized momentum away from home. Look for them to maintain pressure or consider an Over 2.5 Total Goals play.`;
        } else {
          fallbackInsight = `A tightly contested live clash between ${home} and ${away}. Value lies on Both Teams To Score or Draw at current odds.`;
        }
      } else {
        if (homeOdds < 1.7) {
          fallbackInsight = `${home} enters as heavy favorites with formidable home turf advantage. Recommended safe bet: ${home} to Win (1) or -1 Handicap.`;
        } else if (awayOdds < 1.7) {
          fallbackInsight = `${away} boasts superior recent form and attacking depth. Recommended safe bet: ${away} to Win (2) or Over 1.5 Goals.`;
        } else if (Math.abs(homeOdds - awayOdds) < 0.45) {
          fallbackInsight = `An exceptionally close tactical battle expected between ${home} and ${away}. Recommended safe play: Double Chance or Over 1.5 Goals.`;
        } else {
          fallbackInsight = `Solid tactical matchup with clear transitions. Recommended wager: Under 3.5 Total Goals or Double Chance on ${homeOdds < awayOdds ? home : away}.`;
        }
      }

      return res.json({ prediction: fallbackInsight });
    } catch (err: any) {
      console.error("Prediction route error:", err);
      return res.json({ 
        prediction: "Tactical analysis suggests betting on Over 1.5 Goals or Double Chance for maximum safety in this matchup." 
      });
    }
  });

  // Serve static assets if in production or dist exists, otherwise use Vite middleware
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);

  if (!isDev && hasDist) {
    // --- SERVE PRODUCTION BUILD ---
    app.use(express.static(distPath));

    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Engine running on port ${port} (mode: ${isDev ? 'development' : 'production'})`);
    // Start background sync after port is open and accepting requests
    updateGameEngine().catch(err => console.warn('Initial updateGameEngine error:', err.message));
    setInterval(updateGameEngine, 15 * 60 * 1000);
  });

  server.on('error', (err: any) => {
    console.error(`❌ Server error on port ${port}:`, err);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer();
