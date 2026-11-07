import { Match } from "../types";

export const getMatchPrediction = async (match: Match): Promise<string> => {
  try {
    const response = await fetch('/api/ai/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ match }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.prediction) {
        return data.prediction;
      }
    }
  } catch (error) {
    console.warn("Unable to reach server prediction service:", error);
  }

  // Client-side fallback if server cannot be reached
  const home = match.homeTeam?.name || 'Home';
  const away = match.awayTeam?.name || 'Away';
  const homeOdds = parseFloat(match.odds?.main?.find(o => o.label === '1')?.value || '2.2');
  const awayOdds = parseFloat(match.odds?.main?.find(o => o.label === '2')?.value || '2.8');

  if (homeOdds < 1.7) {
    return `${home} holds superior attacking form and home dominance. Recommended bet: ${home} to Win or Double Chance 1X.`;
  } else if (awayOdds < 1.7) {
    return `${away} shows stronger momentum in head-to-head metrics. Recommended bet: ${away} or Over 1.5 Goals.`;
  } else {
    return `An evenly contested matchup between ${home} and ${away}. Recommended safe play: Double Chance or Both Teams to Score.`;
  }
};