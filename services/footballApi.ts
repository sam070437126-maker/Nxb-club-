
import { Match, Odd } from '../types';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getCachedData = (key: string): Match[] | null => {
    try {
        const cached = localStorage.getItem(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                console.log(`Using cached data for ${key}`);
                return parsed.data.map((m: any) => ({
                    ...m,
                    startTime: new Date(m.startTime)
                }));
            }
        }
    } catch (e) {
        console.warn("Cache read error", e);
    }
    return null;
};

const setCachedData = (key: string, data: Match[]) => {
    try {
        localStorage.setItem(key, JSON.stringify({
            timestamp: Date.now(),
            data
        }));
    } catch (e) {
        console.warn("Cache write error", e);
    }
};

const API_KEYS = [
    'c99171a5658ec12d1ff0e76b772e7275',
    '4ac55114fd9a7626b88324266b3a3fa7'
];
let currentKeyIndex = 0;

const BASE_URL = 'https://v3.football.api-sports.io';
const BB_BASE_URL = 'https://v1.basketball.api-sports.io';

const fetchWithRotation = async (url: string, options: any = {}): Promise<Response> => {
    let attempts = 0;
    while (attempts < API_KEYS.length) {
        const key = API_KEYS[currentKeyIndex];
        const headers = new Headers(options.headers || {});
        headers.set("x-apisports-key", key);
        
        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 429 || response.status === 403) {
                console.warn(`API Key ${currentKeyIndex + 1} HTTP ${response.status}. Switching key...`);
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                attempts++;
                continue;
            }

            const clone = response.clone();
            const data = await clone.json().catch(() => ({}));
            
            if (data.errors && (data.errors.requests || data.errors.token || data.errors.rateLimit)) {
                console.warn(`API Key ${currentKeyIndex + 1} limit reached. Switching key...`);
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                attempts++;
                continue;
            }

            return response;
        } catch (e) {
            if (attempts === API_KEYS.length - 1) throw e;
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            attempts++;
        }
    }
    throw new Error("All API keys have reached their rate limits.");
};

// Helper to transform Raw API data into App Match format
// Used for the Client-Side fallback
const processRawData = (fixtures: any[], oddsMapping: Map<number, any>): Match[] => {
    return fixtures.map(item => {
        const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(item.fixture.status.short);
        const isFinished = ['FT', 'AET', 'PEN'].includes(item.fixture.status.short);
        
        let mainOdds: Odd[] = [];
        const rawOddData = oddsMapping.get(item.fixture.id);
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

        return {
            id: `fb_${item.fixture.id}`,
            fixtureId: item.fixture.id,
            sport: 'Soccer',
            league: item.league.name,
            startTime: new Date(item.fixture.date),
            isLive: isLive,
            isFinished: isFinished,
            isPopular: ['Premier League', 'UEFA Champions League', 'La Liga', 'NBA', 'Serie A'].some(p => item.league.name.includes(p)),
            minute: item.fixture.status.elapsed,
            period: item.fixture.status.short,
            homeTeam: { name: item.teams.home.name, logo: item.teams.home.logo },
            awayTeam: { name: item.teams.away.name, logo: item.teams.away.logo },
            scores: { home: item.goals.home ?? 0, away: item.goals.away ?? 0 },
            winner: item.goals.home > item.goals.away ? '1' : item.goals.away > item.goals.home ? '2' : 'X',
            odds: { main: mainOdds, secondary: [] }
        };
    });
};

const processBasketballRawData = (games: any[], oddsMapping: Map<number, any>): Match[] => {
    return games.map(item => {
        const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT'].includes(item.status.short);
        const isFinished = ['FT', 'AOT'].includes(item.status.short);
        
        let mainOdds: Odd[] = [];
        const rawOddData = oddsMapping.get(item.id);
        if (rawOddData) {
            mainOdds = rawOddData.map((v: any) => ({
                id: `odd-bb-${item.id}-${v.value}`,
                label: v.value === 'Home' ? '1' : v.value === 'Away' ? '2' : 'X',
                value: parseFloat(v.odd),
                marketType: 'Moneyline'
            }));
        } else {
            // Mock odds if none available for basketball to ensure it's playable
            mainOdds = [
                { id: `odd-bb-${item.id}-Home`, label: '1', value: 1.85, marketType: 'Moneyline' },
                { id: `odd-bb-${item.id}-Away`, label: '2', value: 1.95, marketType: 'Moneyline' }
            ];
        }

        return {
            id: `bb_${item.id}`,
            fixtureId: item.id,
            sport: 'Basketball',
            league: item.league.name,
            startTime: new Date(item.date),
            isLive: isLive,
            isFinished: isFinished,
            isPopular: ['NBA', 'Euroleague'].some(p => item.league.name.includes(p)),
            minute: item.status.timer,
            period: item.status.short,
            homeTeam: { name: item.teams.home.name, logo: item.teams.home.logo },
            awayTeam: { name: item.teams.away.name, logo: item.teams.away.logo },
            scores: { home: item.scores.home.total ?? 0, away: item.scores.away.total ?? 0 },
            winner: item.scores.home.total > item.scores.away.total ? '1' : item.scores.away.total > item.scores.home.total ? '2' : 'X',
            odds: { main: mainOdds, secondary: [] }
        };
    });
};

export const fetchBasketballMatches = async (forceRefresh = false): Promise<Match[]> => {
    const cacheKey = 'basketball_matches_cache';
    if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    try {
        const requestOptions = { method: 'GET', redirect: 'follow' as RequestRedirect };
        const today = new Date().toISOString().split('T')[0];

        const [liveRes, schedRes, oddsRes] = await Promise.all([
            fetchWithRotation(`${BB_BASE_URL}/games?live=all`, requestOptions),
            fetchWithRotation(`${BB_BASE_URL}/games?date=${today}`, requestOptions),
            fetchWithRotation(`${BB_BASE_URL}/odds?date=${today}&bet=1`, requestOptions).catch(() => ({ json: () => ({}) } as Response))
        ]);

        const liveData = await liveRes.json();
        const schedData = await schedRes.json();
        const oddsData = await (oddsRes as any).json();

        const oddsMap = new Map();
        if (oddsData.response) {
            oddsData.response.forEach((item: any) => {
                const vals = item.bookmakers?.[0]?.bets?.[0]?.values;
                if (vals) oddsMap.set(item.game.id, vals);
            });
        }

        const allGames = [...(liveData.response || []), ...(schedData.response || [])];
        const uniqueGames = Array.from(new Map(allGames.map(item => [item.id, item])).values());
        
        const processed = processBasketballRawData(uniqueGames, oddsMap);
        
        const sorted = processed.sort((a, b) => {
            if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
            if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
            return a.startTime.getTime() - b.startTime.getTime();
        });

        setCachedData(cacheKey, sorted);
        return sorted;
    } catch (e) {
        console.warn("⚠️ Basketball API Failed:", e);
        return [];
    }
};

export const fetchAllMatches = async (category: 'Soccer' | 'Basketball' | 'All' = 'All', forceRefresh = false): Promise<Match[]> => {
    const cacheKey = 'football_matches_cache';
    if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    try {
        const requestOptions = { method: 'GET', redirect: 'follow' as RequestRedirect };
        
        // Get today's and tomorrow's date YYYY-MM-DD
        const todayDate = new Date();
        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        
        const today = todayDate.toISOString().split('T')[0];
        const tomorrow = tomorrowDate.toISOString().split('T')[0];

        // Parallel fetch for speed
        const [liveRes, schedRes, schedTomorrowRes, oddsRes, oddsTomorrowRes, liveOddsRes] = await Promise.all([
            fetchWithRotation(`${BASE_URL}/fixtures?live=all`, requestOptions),
            fetchWithRotation(`${BASE_URL}/fixtures?date=${today}`, requestOptions),
            fetchWithRotation(`${BASE_URL}/fixtures?date=${tomorrow}`, requestOptions),
            fetchWithRotation(`${BASE_URL}/odds?date=${today}&bet=1`, requestOptions),
            fetchWithRotation(`${BASE_URL}/odds?date=${tomorrow}&bet=1`, requestOptions),
            fetchWithRotation(`${BASE_URL}/odds/live`, requestOptions).catch(() => ({ json: () => ({}) } as Response)) // Fetch live odds
        ]);

        const liveData = await liveRes.json();
        const schedData = await schedRes.json();
        const schedTomorrowData = await schedTomorrowRes.json();
        const oddsData = await oddsRes.json();
        const oddsTomorrowData = await oddsTomorrowRes.json();
        const liveOddsData = await (liveOddsRes as any).json();

        // Check for API errors (like rate limits)
        if (liveData.errors && Object.keys(liveData.errors).length > 0) {
            console.error("API-Sports Error (Live):", liveData.errors);
            throw new Error(Object.values(liveData.errors)[0] as string);
        }
        if (schedData.errors && Object.keys(schedData.errors).length > 0) {
            console.error("API-Sports Error (Scheduled):", schedData.errors);
            throw new Error(Object.values(schedData.errors)[0] as string);
        }
        if (oddsData.errors && Object.keys(oddsData.errors).length > 0) {
            console.error("API-Sports Error (Odds):", oddsData.errors);
            throw new Error(Object.values(oddsData.errors)[0] as string);
        }

        const oddsMap = new Map();
        
        // 1. Process Pre-match Odds
        const processOdds = (data: any) => {
            if (data.response) {
                data.response.forEach((item: any) => {
                    const vals = item.bookmakers?.[0]?.bets?.[0]?.values;
                    if (vals) oddsMap.set(item.fixture.id, vals);
                });
            }
        };
        processOdds(oddsData);
        processOdds(oddsTomorrowData);

        // 2. Process Live Odds (Overrides pre-match if available)
        if (liveOddsData.response) {
            liveOddsData.response.forEach((item: any) => {
                // Find Match Winner bet (usually id 1 or name "Match Winner")
                const matchWinnerBet = item.odds?.find((b: any) => b.id === 1 || b.name === "Match Winner" || b.name === "1x2");
                if (matchWinnerBet && matchWinnerBet.values) {
                    oddsMap.set(item.fixture.id, matchWinnerBet.values);
                }
            });
        }

        const allFixtures = [
            ...(liveData.response || []), 
            ...(schedData.response || []),
            ...(schedTomorrowData.response || [])
        ];
        
        // Deduplicate fixtures based on ID
        const uniqueFixtures = Array.from(new Map(allFixtures.map(item => [item.fixture.id, item])).values());
        
        const processed = processRawData(uniqueFixtures, oddsMap);
        
        // Sort: Live -> Popular -> Time
        const sorted = processed.sort((a, b) => {
            if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
            if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
            return a.startTime.getTime() - b.startTime.getTime();
        });

        setCachedData(cacheKey, sorted);
        return sorted;

    } catch (directError) {
        console.warn("⚠️ Client-Side API Failed (Rate Limit/Network). Falling back to mock data.");
        throw directError;
    }
};

export const fetchJackpotMatches = async (): Promise<Match[]> => {
    try {
        const all = await fetchAllMatches();
        return all.filter(m => !m.isLive && m.isPopular).slice(0, 5);
    } catch (e: any) {
        console.error("❌ Jackpot API Failed:", e.message);
        return [];
    }
};
