import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { db } from "./db";
import { insertBetSchema, insertAdminBetSchema, insertDepositSchema, insertWithdrawalSchema, insertFixtureSchema, insertSupportChatSchema, insertSupportMessageSchema } from "@shared/schema";
import { liveFeedService } from "./services/live-feed-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check admin rights
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Sports and fixtures endpoints
  app.get("/api/fixtures", async (req, res) => {
    try {
      const { sport, league } = req.query;
      let fixtures = await storage.getFixtures(sport as string);
      
      // Filter by Thai leagues if 'thai' league parameter is provided
      if (league === 'thai') {
        fixtures = fixtures.filter(fixture => 
          fixture.league.toLowerCase().includes('thai') || 
          fixture.league.toLowerCase().includes('thailand') ||
          fixture.league.toLowerCase().includes('ไทย')
        );
      }
      
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixtures" });
    }
  });

  app.get("/api/fixtures/live", async (req, res) => {
    try {
      const { sport } = req.query;
      const fixtures = await storage.getLiveFixtures(sport as string);
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live fixtures" });
    }
  });

  // Live match pool status endpoint for monitoring
  // Новый API эндпоинт для лайв-ленты по промпту
  app.get("/api/live-feed", (req, res) => {
    try {
      const snapshot = liveFeedService.getCurrentSnapshot();
      res.json(snapshot);
    } catch (error) {
      console.error('Error getting live feed:', error);
      res.status(500).json({ message: "Failed to get live feed" });
    }
  });

  // Health check для нового сервиса  
  app.get("/api/live-feed-status", (req, res) => {
    try {
      const snapshot = liveFeedService.getCurrentSnapshot();
      const stats = {
        status: "success",
        last_updated: snapshot.updatedAt,
        total_matches: Object.values(snapshot.sports).reduce((sum, matches) => sum + matches.length, 0),
        sports_breakdown: {
          football: snapshot.sports.football.length,
          basketball: snapshot.sports.basketball.length,
          hockey: snapshot.sports.hockey.length,
          volleyball: snapshot.sports.volleyball.length
        },
        target_per_sport: 9
      };
      res.json(stats);
    } catch (error) {
      console.error('Error getting live feed status:', error);
      res.status(500).json({ message: "Failed to get live feed status" });
    }
  });

  // Тестовые эндпоинты для управления API ключами (для отладки)
  app.get("/api/test/keys-status/:sport?", (req, res) => {
    try {
      const { sport } = req.params;
      const keysStatus = liveFeedService.apiSportsClient.getKeysStatus(sport);
      res.json(keysStatus);
    } catch (error) {
      console.error('Error getting keys status:', error);
      res.status(500).json({ message: "Failed to get keys status" });
    }
  });

  app.post("/api/test/simulate-key-exhaustion/:sport", (req, res) => {
    try {
      const { sport } = req.params;
      const { keyIndex } = req.body;
      
      if (!['football', 'basketball', 'hockey', 'volleyball', 'baseball'].includes(sport)) {
        return res.status(400).json({ message: "Invalid sport" });
      }
      
      console.log(`🧪 API Test: Simulating key exhaustion for ${sport}, keyIndex: ${keyIndex}`);
      liveFeedService.apiSportsClient.simulateKeyExhaustion(sport, keyIndex);
      
      res.json({ 
        message: `Key exhaustion simulated for ${sport}`, 
        sport, 
        keyIndex: keyIndex || 'current' 
      });
    } catch (error) {
      console.error('Error simulating key exhaustion:', error);
      res.status(500).json({ message: "Failed to simulate key exhaustion" });
    }
  });

  app.get("/api/live-pool-status", async (req, res) => {
    try {
      const { liveMatchManager } = await import('./services/live-match-manager');
      const status = await liveMatchManager.getPoolStatus();
      res.json({
        status: "success",
        pool_status: status,
        total_matches: Object.values(status).reduce((sum, count) => sum + count, 0),
        target_per_sport: 9,
        supported_sports: ["football", "tennis", "basketball", "csgo"]
      });
    } catch (error) {
      console.error('Error getting pool status:', error);
      res.status(500).json({ message: "Failed to get live pool status" });
    }
  });

  // Betting endpoints
  app.post("/api/bets", requireAuth, async (req, res) => {
    try {
      const betData = insertBetSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      // Calculate potential win
      const potentialWin = (betData.stake * betData.odds).toFixed(2);
      
      // Check if user has sufficient balance
      const user = await storage.getUser(req.user!.id);
      if (!user || parseFloat(user.balance || '0') < betData.stake) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create bet
      const bet = await storage.createBet({
        ...betData,
        potentialWin: parseFloat(potentialWin)
      });

      // Deduct stake from user balance
      const newBalance = (parseFloat(user.balance || '0') - betData.stake).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      res.status(201).json(bet);
    } catch (error) {
      res.status(400).json({ message: "Invalid bet data" });
    }
  });

  app.get("/api/bets", requireAuth, async (req, res) => {
    try {
      const userBets = await storage.getUserBets(req.user!.id);
      // Transform data to match BettingHistory component expectations
      const transformedBets = userBets
        .filter((betData: any) => betData.bets.status !== 'pending')
        .map((betData: any) => ({
          id: betData.bets.id,
          market: betData.bets.market,
          odds: betData.bets.odds,
          stake: betData.bets.stake,
          potentialWin: betData.bets.potentialWin,
          status: betData.bets.status,
          createdAt: betData.bets.placedAt,
          match: betData.bets.customHomeTeam && betData.bets.customAwayTeam 
            ? `${betData.bets.customHomeTeam} vs ${betData.bets.customAwayTeam}`
            : betData.fixture?.homeTeam && betData.fixture?.awayTeam
              ? `${betData.fixture.homeTeam} vs ${betData.fixture.awayTeam}`
              : '',
          fixture: betData.fixture
        }));
      res.json(transformedBets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bets" });
    }
  });

  app.get("/api/bets/user", requireAuth, async (req, res) => {
    try {
      const bets = await storage.getUserBets(req.user!.id);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bets" });
    }
  });

  // Deposit endpoints
  app.post("/api/deposits", requireAuth, async (req, res) => {
    try {
      const depositData = insertDepositSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const deposit = await storage.createDeposit(depositData);
      res.status(201).json(deposit);
    } catch (error) {
      res.status(400).json({ message: "Invalid deposit data" });
    }
  });

  app.get("/api/deposits/user", requireAuth, async (req, res) => {
    try {
      const deposits = await storage.getUserDeposits(req.user!.id);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user deposits" });
    }
  });

  // Withdrawal endpoints
  app.post("/api/withdrawals", requireAuth, async (req, res) => {
    try {
      const withdrawalData = insertWithdrawalSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      // Check if user has sufficient balance
      const user = await storage.getUser(req.user!.id);
      if (!user || parseFloat(user.balance || '0') < parseFloat(withdrawalData.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawal(withdrawalData);
      res.status(201).json(withdrawal);
    } catch (error) {
      res.status(400).json({ message: "Invalid withdrawal data" });
    }
  });

  app.get("/api/withdrawals/user", requireAuth, async (req, res) => {
    try {
      const withdrawals = await storage.getUserWithdrawals(req.user!.id);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user withdrawals" });
    }
  });

  // User statistics
  app.get("/api/user/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, note } = req.body;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = (parseFloat(user.balance || '0') + parseFloat(amount)).toFixed(2);
      await storage.updateUserBalance(id, newBalance);

      // Create admin transaction record
      await storage.createAdminTransaction({
        userId: id,
        type: 'balance_update',
        amount,
        note,
        adminId: req.user!.id
      });

      res.json({ message: "Balance updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  app.get("/api/admin/deposits", requireAdmin, async (req, res) => {
    try {
      const deposits = await storage.getAllDeposits();
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.patch("/api/admin/deposits/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await storage.updateDepositStatus(id, status);

      // If confirmed, add to user balance
      if (status === 'confirmed') {
        const deposits = await storage.getAllDeposits();
        const deposit = deposits.find(d => d.id === id);
        if (deposit) {
          const user = await storage.getUser(deposit.userId);
          if (user) {
            const newBalance = (parseFloat(user.balance || '0') + parseFloat(deposit.amount)).toFixed(2);
            await storage.updateUserBalance(deposit.userId, newBalance);
          }
        }
      }

      res.json({ message: "Deposit status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update deposit" });
    }
  });

  app.put("/api/admin/deposits/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, method, status, txId } = req.body;

      await storage.updateDeposit(id, {
        amount: amount,
        method: method,
        status: status,
        txId: txId
      });

      res.json({ message: "Deposit updated successfully" });
    } catch (error) {
      console.error("Failed to update deposit:", error);
      res.status(500).json({ message: "Failed to update deposit" });
    }
  });

  app.get("/api/admin/withdrawals", requireAdmin, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.patch("/api/admin/withdrawals/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;

      await storage.updateWithdrawalStatus(id, status, adminNote);

      // If processed, deduct from user balance
      if (status === 'processed') {
        const withdrawals = await storage.getAllWithdrawals();
        const withdrawal = withdrawals.find(w => w.id === id);
        if (withdrawal) {
          const user = await storage.getUser(withdrawal.userId);
          if (user) {
            const newBalance = (parseFloat(user.balance || '0') - parseFloat(withdrawal.amount)).toFixed(2);
            await storage.updateUserBalance(withdrawal.userId, newBalance);
          }
        }
      }

      res.json({ message: "Withdrawal status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update withdrawal" });
    }
  });

  app.put("/api/admin/withdrawals/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, method, status, address } = req.body;

      await storage.updateWithdrawal(id, {
        amount: amount,
        method: method,
        status: status,
        address: address
      });

      res.json({ message: "Withdrawal updated successfully" });
    } catch (error) {
      console.error("Failed to update withdrawal:", error);
      res.status(500).json({ message: "Failed to update withdrawal" });
    }
  });


  app.patch("/api/admin/fixtures/:id/odds", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { homeOdds, drawOdds, awayOdds } = req.body;

      await storage.updateFixtureOdds(id, { homeOdds, drawOdds, awayOdds });
      res.json({ message: "Odds updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update odds" });
    }
  });

  app.patch("/api/admin/fixtures/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      await storage.updateFixture(id, updates);
      res.json({ message: "Match updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system statistics" });
    }
  });

  app.post("/api/admin/stats/deposits", requireAdmin, async (req, res) => {
    try {
      const { totalDeposits } = req.body;
      await storage.updateSystemStats({ totalDeposits });
      res.json({ message: "Deposit statistics updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update deposit statistics" });
    }
  });

  app.post("/api/admin/stats/withdrawals", requireAdmin, async (req, res) => {
    try {
      const { totalWithdrawals } = req.body;
      await storage.updateSystemStats({ totalWithdrawals });
      res.json({ message: "Withdrawal statistics updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update withdrawal statistics" });
    }
  });

  app.post("/api/admin/user-deposits", requireAdmin, async (req, res) => {
    try {
      const { userId, amount, method, createdAt } = req.body;
      await storage.createUserDeposit({ userId, amount, method, createdAt, status: "confirmed" });
      res.json({ message: "User deposit created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user deposit" });
    }
  });

  app.post("/api/admin/user-withdrawals", requireAdmin, async (req, res) => {
    try {
      const { userId, amount, method, address, createdAt } = req.body;
      await storage.createUserWithdrawal({ userId, amount, method, address, createdAt, status: "processed" });
      res.json({ message: "User withdrawal created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user withdrawal" });
    }
  });

  app.get("/api/admin/users/:id/withdrawals", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getUserWithdrawalStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user withdrawal statistics" });
    }
  });

  app.get("/api/admin/bets", requireAdmin, async (req, res) => {
    try {
      const bets = await storage.getAllBetsWithDetails();
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all bets" });
    }
  });

  app.get("/api/admin/users/:id/stats", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getUserFullStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user full statistics" });
    }
  });

  app.get("/api/admin/users/:id/bets", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      // Find user by accountId or email
      const users = await storage.getAllUsers();
      const user = users.find((u: any) => u.accountId === id || u.email === id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const bets = await storage.getUserBets(user.id);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user betting history" });
    }
  });

  // Admin bet management endpoints
  app.post("/api/admin/bets", requireAdmin, async (req, res) => {
    try {
      console.log("Admin bet data received:", req.body);
      
      const betData = insertAdminBetSchema.parse(req.body);
      console.log("Validated bet data:", betData);
      
      // Create bet (admin doesn't need balance check)
      const bet = await storage.createBet(betData);
      
      // Auto-update user statistics after creating bet
      const userBets = await storage.getUserBets(betData.userId);
      const totalBets = userBets.length;
      const wonBets = userBets.filter((b: any) => b.bets && b.bets.status === 'won').length;
      const lostBets = userBets.filter((b: any) => b.bets && b.bets.status === 'lost').length;
      const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) : "0";
      
      // Calculate total profit
      const totalProfit = userBets.reduce((sum: number, b: any) => {
        if (b.bets && b.bets.status === 'won') {
          return sum + (parseFloat(b.bets.potentialWin) - parseFloat(b.bets.stake));
        } else if (b.bets && b.bets.status === 'lost') {
          return sum - parseFloat(b.bets.stake);
        }
        return sum;
      }, 0);
      
      await storage.updateUserStats(betData.userId, {
        totalBetsPlaced: totalBets,
        totalWinsCount: wonBets,
        totalLossesCount: lostBets,
        winRate: winRate,
        totalProfit: totalProfit.toFixed(2)
      });
      
      res.status(201).json(bet);
    } catch (error) {
      console.error("Admin bet creation error:", error);
      if (error instanceof Error && error.message.includes('parse')) {
        res.status(400).json({ message: `Ошибка валидации данных: ${error.message}` });
      } else {
        res.status(400).json({ message: "Неверные данные ставки" });
      }
    }
  });

  app.put("/api/admin/bets/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await storage.updateBet(id, updates);
      res.json({ message: "Bet updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update bet" });
    }
  });

  // Admin user stats management endpoints  
  app.put("/api/admin/users/:id/stats", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const stats = req.body;
      
      await storage.updateUserStats(id, stats);
      res.json({ message: "User stats updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });

  // Public wallet settings endpoint for deposits
  app.get("/api/wallets", async (req, res) => {
    try {
      const usdtTrc20 = await storage.getAdminSetting('wallet_usdt_trc20');
      const usdtBep20 = await storage.getAdminSetting('wallet_usdt_bep20');
      const sol = await storage.getAdminSetting('wallet_sol');

      res.json({
        usdtTrc20: usdtTrc20?.value || 'TQrfqvkFc5qd8uGWXqYbXm7QqTiPdZ8cR9',
        usdtBep20: usdtBep20?.value || '0x742d35Cc6334C0532925a3b8bc1b6847e9dC6b8A',
        sol: sol?.value || '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet settings" });
    }
  });

  // Admin wallet settings endpoints
  app.get("/api/admin/wallets", requireAdmin, async (req, res) => {
    try {
      const usdtTrc20 = await storage.getAdminSetting('wallet_usdt_trc20');
      const usdtBep20 = await storage.getAdminSetting('wallet_usdt_bep20');
      const sol = await storage.getAdminSetting('wallet_sol');

      res.json({
        usdtTrc20: usdtTrc20?.value || '',
        usdtBep20: usdtBep20?.value || '',
        sol: sol?.value || ''
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet settings" });
    }
  });

  app.post("/api/admin/wallets", requireAdmin, async (req, res) => {
    try {
      const { usdtTrc20, usdtBep20, sol } = req.body;

      if (usdtTrc20) await storage.setAdminSetting('wallet_usdt_trc20', usdtTrc20);
      if (usdtBep20) await storage.setAdminSetting('wallet_usdt_bep20', usdtBep20);
      if (sol) await storage.setAdminSetting('wallet_sol', sol);

      res.json({ message: "Wallet settings updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update wallet settings" });
    }
  });

  // API Toggle settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const useApiSetting = await storage.getAdminSetting('use_api_for_matches');
      const apiKey = await storage.getAdminSetting('api_sports_key');

      res.json({
        useApiForMatches: useApiSetting?.value === 'true',
        hasApiKey: !!apiKey?.value
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { useApiForMatches, apiKey } = req.body;

      if (typeof useApiForMatches === 'boolean') {
        await storage.setAdminSetting('use_api_for_matches', useApiForMatches.toString());
      }
      
      if (apiKey && typeof apiKey === 'string') {
        await storage.setAdminSetting('api_sports_key', apiKey);
      }

      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Temporary endpoint to add missing column and create support tables
  app.post("/api/admin/migrate-db", requireAdmin, async (req, res) => {
    try {
      await db.execute(`ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false`);
      
      // Create support_chats table if not exists
      await db.execute(`
        CREATE TABLE IF NOT EXISTS support_chats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id),
          subject TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'open',
          priority VARCHAR(10) DEFAULT 'normal',
          assigned_admin_id UUID REFERENCES users(id),
          last_message_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Create support_messages table if not exists  
      await db.execute(`
        CREATE TABLE IF NOT EXISTS support_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chat_id UUID NOT NULL REFERENCES support_chats(id),
          sender_id UUID NOT NULL REFERENCES users(id),
          message TEXT NOT NULL,
          is_admin_reply BOOLEAN DEFAULT false,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      res.json({ message: "Database migration completed - support tables created" });
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({ message: "Migration failed" });
    }
  });


  app.get("/api/admin/fixtures", requireAdmin, async (req, res) => {
    try {
      const fixtures = await storage.getAllFixtures(100);
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixtures" });
    }
  });

  app.delete("/api/admin/fixtures/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFixture(id);
      res.json({ message: "Fixture deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fixture" });
    }
  });

  // Bonus endpoints
  app.post("/api/bonus/claim-welcome", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.hasClaimedWelcomeBonus) {
        return res.status(400).json({ message: "Welcome bonus already claimed" });
      }

      // Check if user has made at least one deposit
      const deposits = await storage.getUserDeposits(user.id);
      const approvedDeposits = deposits.filter(d => d.status === 'approved');
      
      if (approvedDeposits.length === 0) {
        return res.status(400).json({ message: "Must make a deposit before claiming welcome bonus" });
      }

      // Calculate bonus amount (100% of first deposit, max 5000)
      const firstDepositAmount = parseFloat(approvedDeposits[0].amount);
      const bonusAmount = Math.min(firstDepositAmount, 5000);

      // Update user balance and bonus fields
      const newBalance = (parseFloat(user.balance || '0') + bonusAmount).toFixed(2);
      const newBonusBalance = (parseFloat(user.bonusBalance || '0') + bonusAmount).toFixed(2);

      await storage.updateUserBalance(user.id, newBalance);
      
      // Update bonus fields - we need to add this method to storage
      await storage.updateUser(user.id, {
        hasClaimedWelcomeBonus: true,
        bonusBalance: newBonusBalance,
        totalBonusReceived: (parseFloat(user.totalBonusReceived || '0') + bonusAmount).toFixed(2)
      });

      res.json({ 
        message: "Welcome bonus claimed successfully",
        bonusAmount: bonusAmount.toFixed(2),
        newBalance
      });
    } catch (error) {
      console.error('Bonus claim error:', error);
      res.status(500).json({ message: "Failed to claim bonus" });
    }
  });

  // API Key management endpoints
  app.get("/api/admin/api-key-status", requireAdmin, async (req, res) => {
    try {
      const hasKey = !!(process.env.FOOTBALL_API_KEY || process.env.API_SPORTS_KEY);
      res.json({ 
        hasApiKey: hasKey,
        message: hasKey ? "API key is configured" : "No API key configured - using mock data"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check API key status" });
    }
  });

  app.post("/api/admin/api-key", requireAdmin, async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || apiKey.trim().length === 0) {
        return res.status(400).json({ message: "API key is required" });
      }

      // Save the API key to admin settings
      await storage.setAdminSetting('api_sports_key', apiKey.trim());
      
      res.json({ message: "API key saved successfully. Restart the application to use real data." });
    } catch (error) {
      res.status(500).json({ message: "Failed to save API key" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for live updates and support chat (defined early for use in endpoints)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Support chat endpoints
  app.get("/api/support/chats", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const userId = req.user.isAdmin ? undefined : req.user.id;
      const chats = await storage.getSupportChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support chats" });
    }
  });

  app.get("/api/support/chats/:chatId", requireAuth, async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await storage.getSupportChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check access permissions
      if (!req.user.isAdmin && chat.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Mark messages as read
      await storage.markMessagesAsRead(chatId, req.user.isAdmin || false);

      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post("/api/support/chats", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const userId = req.user.id;
      const chatData = insertSupportChatSchema.parse({
        ...req.body,
        userId
      });

      const newChat = await storage.createSupportChat(chatData);
      res.json(newChat);
    } catch (error: any) {
      console.error('Error creating support chat:', error);
      res.status(500).json({ message: "Failed to create support chat", error: error.message });
    }
  });

  app.post("/api/support/chats/:chatId/messages", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { chatId } = req.params;
      const senderId = req.user.id;
      const isAdminReply = req.user.isAdmin || false;

      const messageData = insertSupportMessageSchema.parse({
        ...req.body,
        chatId,
        senderId,
        isAdminReply
      });

      const newMessage = await storage.createSupportMessage(messageData);
      
      // Broadcast message via WebSocket
      const messageWithSender = {
        ...newMessage,
        sender: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          isAdmin: req.user.isAdmin || false
        }
      };

      wss.clients.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_support_message',
            chatId,
            message: newMessage.message,
            isAdminReply: isAdminReply,
            senderName: req.user.name,
            messageData: messageWithSender
          }));
        }
      });

      res.json(newMessage);
    } catch (error: any) {
      console.error('Error sending support message:', error);
      res.status(500).json({ message: "Failed to send message", error: error.message });
    }
  });

  app.patch("/api/support/chats/:chatId/status", requireAdmin, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { status, assignedAdminId } = req.body;

      await storage.updateSupportChatStatus(chatId, status, assignedAdminId);
      res.json({ message: "Chat status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update chat status" });
    }
  });

  app.get("/api/support/unread-count", requireAdmin, async (req, res) => {
    try {
      const adminId = req.query.adminId as string;
      const count = await storage.getUnreadChatsCount(adminId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Favorite matches routes
  app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const favorites = await storage.getUserFavoriteMatches(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const favoriteData = {
        ...req.body,
        userId: req.user.id,
        startTime: new Date(req.body.startTime) // Convert string to Date object
      };

      const newFavorite = await storage.addFavoriteMatch(favoriteData);
      res.json(newFavorite);
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: "Failed to add favorite", error: error.message });
    }
  });

  app.delete("/api/favorites/:matchId", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { matchId } = req.params;
      await storage.removeFavoriteMatch(req.user.id, matchId);
      res.json({ message: "Favorite removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: any) => {
    console.log('Client connected to WebSocket');

    // Handle support chat subscription
    ws.on('message', (message: any) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'subscribe_chat' && data.chatId) {
          ws.chatId = data.chatId;
          console.log(`Client subscribed to chat: ${data.chatId}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast live updates to all connected clients
  const broadcastLiveUpdates = () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'odds_update',
          timestamp: new Date().toISOString()
        }));
      }
    });
  };

  // Simulate live odds updates every 30 seconds
  setInterval(broadcastLiveUpdates, 30000);

  return httpServer;
}
