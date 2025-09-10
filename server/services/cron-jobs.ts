import { sportsApiService } from './sports-api';
import { storage } from '../storage';
import { liveFeedService } from './live-feed-service';

class CronJobsService {
  private fixtureUpdateInterval: NodeJS.Timeout | null = null;
  private liveScoreUpdateInterval: NodeJS.Timeout | null = null;
  private matchSyncInterval: NodeJS.Timeout | null = null;

  async start() {
    console.log('Starting cron jobs...');

    // Запускаем новую систему лайв-ленты по промпту
    console.log('Starting new Live Feed Service...');
    await liveFeedService.start();
    
    // Сохраняем функционал расчёта ставок
    this.liveScoreUpdateInterval = setInterval(async () => {
      try {
        await this.settleBets();
      } catch (error) {
        console.error('Error settling bets:', error);
      }
    }, 40 * 1000); // 40 секунд
    
    console.log('New Live Feed Service started - managing live matches per sport');
  }

  stop() {
    if (this.matchSyncInterval) {
      clearInterval(this.matchSyncInterval);
      this.matchSyncInterval = null;
    }

    if (this.liveScoreUpdateInterval) {
      clearInterval(this.liveScoreUpdateInterval);
      this.liveScoreUpdateInterval = null;
    }

    // Останавливаем новый сервис лайв-ленты
    liveFeedService.stop();

    console.log('Cron jobs and Live Feed Service stopped');
  }

  // No longer needed - LiveMatchManager handles all live match fetching

  private async settleBets() {
    try {
      // Get all pending bets
      const allBets = await storage.getAllBets();
      const pendingBets = allBets.filter(bet => bet.status === 'pending');

      for (const bet of pendingBets) {
        if (!bet.fixture) continue; // Skip bets without fixture data
        
        const fixture = bet.fixture;
        
        // Only settle bets for finished matches
        if (fixture.status === 'finished' && 
            fixture.homeScore !== null && 
            fixture.awayScore !== null) {
          
          let betResult = 'lost';
          
          // Determine bet result based on market
          switch (bet.market) {
            case 'home':
              if (fixture.homeScore > fixture.awayScore) {
                betResult = 'won';
              }
              break;
            case 'draw':
              if (fixture.homeScore === fixture.awayScore) {
                betResult = 'won';
              }
              break;
            case 'away':
              if (fixture.awayScore > fixture.homeScore) {
                betResult = 'won';
              }
              break;
            case 'over':
              const totalGoals = fixture.homeScore + fixture.awayScore;
              if (totalGoals > 2.5) { // Assuming over 2.5 goals
                betResult = 'won';
              }
              break;
            case 'under':
              const totalGoalsUnder = fixture.homeScore + fixture.awayScore;
              if (totalGoalsUnder < 2.5) { // Assuming under 2.5 goals
                betResult = 'won';
              }
              break;
          }

          // Update bet status
          await storage.updateBetStatus(bet.id, betResult);

          // If bet won, add winnings to user balance
          if (betResult === 'won') {
            const user = await storage.getUser(bet.userId);
            if (user) {
              const newBalance = (parseFloat(user.balance) + parseFloat(bet.potentialWin)).toFixed(2);
              await storage.updateUserBalance(bet.userId, newBalance);
              
              console.log(`Settled winning bet ${bet.id} for user ${bet.userId}, added ฿${bet.potentialWin}`);
            }
          } else {
            console.log(`Settled losing bet ${bet.id} for user ${bet.userId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error settling bets:', error);
    }
  }
}

export const cronJobsService = new CronJobsService();
