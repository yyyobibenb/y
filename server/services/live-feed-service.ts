import axios from 'axios';

// Типы данных согласно промпту
export interface NormalizedMatch {
  id: string;
  sport: 'football' | 'basketball' | 'hockey' | 'volleyball' | 'baseball';
  league: string | null;
  startedAt: string | null;
  status: 'LIVE' | 'SOON' | 'PAUSED' | 'HT' | 'Q2' | 'SET2' | 'FT' | 'FINISHED' | '1H' | '2H' | 'ET' | 'P' | 'CANCELLED' | 'POSTPONED' | 'SUSPENDED';
  teams: { home: string; away: string };
  score: { home: number; away: number };
  provider: 'apisports';
  // Add odds information
  homeOdds?: string;
  drawOdds?: string;
  awayOdds?: string;
  overOdds?: string;
  underOdds?: string;
  totalLine?: string;
  currentMinute?: number;
  raw?: any;
}

export interface LiveFeedResponse {
  updatedAt: string;
  sports: {
    football: NormalizedMatch[];
    basketball: NormalizedMatch[];
    hockey: NormalizedMatch[];
    volleyball: NormalizedMatch[];
    baseball: NormalizedMatch[];
  };
  quota?: {
    football: { [key: string]: number };
    basketball: { [key: string]: number };
    hockey: { [key: string]: number };
    volleyball: { [key: string]: number };
    baseball: { [key: string]: number };
  };
  stale?: boolean;
  staleFor?: string;
}


// Клиент для API Sports (согласно промпту)
class ApiSportsClient {
  private endpoints = {
    football: 'https://v3.football.api-sports.io',
    basketball: 'https://v1.basketball.api-sports.io',
    hockey: 'https://v1.hockey.api-sports.io',
    volleyball: 'https://v1.volleyball.api-sports.io',
    baseball: 'https://v1.baseball.api-sports.io'
  };

  private keyRotation: {
    [sport: string]: {
      keys: string[];
      current: number;
      usedToday: { [key: string]: number };
      lastReset: Date;
      suspendedKeys: Set<string>; // Заблокированные ключи
    };
  } = {};

  constructor() {
    // Инициализация ротации ключей для каждого спорта
    const apiKeys = [
      '8d05e41071271be7ccbd6adb7c61378f',
      '50a1f9fee7f5eb0170ac4cad898346e7',
      '4e9ec8feebcad1443105a39f63703fac'
    ];

    ['football', 'basketball', 'hockey', 'volleyball', 'baseball'].forEach(sport => {
      this.keyRotation[sport] = {
        keys: apiKeys,
        current: 0,
        usedToday: {},
        lastReset: new Date(),
        suspendedKeys: new Set<string>()
      };
    });
  }

  // Инициализация ключей - проверка всех ключей через API при запуске
  async initializeKeys(): Promise<void> {
    console.log('🔧 Initializing API keys and checking their status...');
    
    const sports = ['football', 'basketball', 'hockey', 'volleyball', 'baseball'] as const;
    
    for (const sport of sports) {
      console.log(`\n🔍 Checking keys for ${sport}...`);
      
      // Находим первый рабочий ключ для каждого спорта
      let foundWorkingKey = false;
      for (let i = 0; i < this.keyRotation[sport].keys.length; i++) {
        const key = this.keyRotation[sport].keys[i];
        console.log(`🔑 Testing key ${i + 1}/${this.keyRotation[sport].keys.length}: ${key.substring(0, 8)}...`);
        
        const isAvailable = await this.checkKeyStatusViaAPI(sport, key);
        if (isAvailable) {
          console.log(`✅ Found working key for ${sport}: ${key.substring(0, 8)}...`);
          this.keyRotation[sport].current = i;
          foundWorkingKey = true;
          break;
        } else {
          console.log(`❌ Key ${key.substring(0, 8)}... is not available for ${sport}`);
        }
      }
      
      if (!foundWorkingKey) {
        console.warn(`⚠️ No working keys found for ${sport}!`);
      }
    }
    
    console.log('✅ API keys initialization completed\n');
  }

  // Сброс счетчика в 00:00 UTC
  private resetDailyQuotaIfNeeded(sport: string): void {
    const now = new Date();
    const lastReset = this.keyRotation[sport].lastReset;
    
    // Проверяем, прошел ли день UTC
    if (now.getUTCDate() !== lastReset.getUTCDate() || 
        now.getUTCMonth() !== lastReset.getUTCMonth() ||
        now.getUTCFullYear() !== lastReset.getUTCFullYear()) {
      
      const rotation = this.keyRotation[sport];
      rotation.keys.forEach(key => {
        rotation.usedToday[key] = 0;
      });
      rotation.current = 0;
      rotation.lastReset = now;
      
      console.log(`🔄 Daily quota reset for ${sport} at ${now.toISOString()}`);
    }
  }


  // Проверка статуса ключа через реальный запрос (может тратить лимиты!)
  private async checkKeyStatusViaAPI(sport: string, key: string): Promise<boolean> {
    try {
      const baseUrl = this.endpoints[sport as keyof typeof this.endpoints];
      
      // Используем минимальный реальный запрос чтобы проверить блокировку аккаунта
      console.log(`🌐 Checking key ${key.substring(0, 8)}... with real request (may use quota)`);
      
      let testEndpoint = '';
      if (sport === 'football') {
        testEndpoint = '/fixtures?live=all';
      } else {
        testEndpoint = '/games?live=all';
      }
      
      const response = await axios.get(`${baseUrl}${testEndpoint}`, {
        headers: {
          'x-apisports-key': key
        },
        timeout: 8000
      });

      // Проверяем ошибки блокировки аккаунта
      if (response.data && response.data.errors) {
        if (response.data.errors.access) {
          console.warn(`❌ Key ${key.substring(0, 8)}... SUSPENDED: ${response.data.errors.access}`);
          // Добавляем ключ в список заблокированных для всех видов спорта
          Object.keys(this.keyRotation).forEach(sportName => {
            this.keyRotation[sportName].suspendedKeys.add(key);
          });
          
          // Обновляем интервал при изменении количества доступных ключей
          this.onKeysUpdated();
          return false;
        }
        
        if (response.data.errors.requests) {
          const errorMessage = response.data.errors.requests;
          if (errorMessage.includes('request limit') || errorMessage.includes('reached the limit')) {
            console.warn(`❌ Key ${key.substring(0, 8)}... EXHAUSTED: ${errorMessage}`);
            return false;
          }
        }
      }
      
      // Если нет ошибок блокировки, ключ работает
      console.log(`✅ Key ${key.substring(0, 8)}... is working (no suspension/block errors)`);
      return true;
      
    } catch (error: any) {
      console.log(`❌ Key check failed: ${key.substring(0, 8)}... - ${error.response?.status || error.message}`);
      
      // Если получили 429, ключ исчерпан
      if (error.response?.status === 429) {
        console.warn(`🚫 Key ${key.substring(0, 8)}... returned 429 - exhausted`);
        return false;
      }
      
      // При других ошибках (403, 401 и т.д.) ключ недействителен
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn(`⚠️ Key ${key.substring(0, 8)}... returned ${error.response.status} - invalid/suspended`);
        return false;
      }
      
      // При сетевых ошибках не помечаем как недоступный
      return true;
    }
  }

  // Получение доступного ключа для спорта с проверкой через API
  private async getCurrentKey(sport: string): Promise<string | null> {
    this.resetDailyQuotaIfNeeded(sport);
    
    const rotation = this.keyRotation[sport];
    if (rotation.keys.length === 0) {
      console.warn(`❌ No keys configured for ${sport}`);
      return null;
    }

    // Пропускаем заблокированные ключи
    const availableKeys = rotation.keys.filter(key => !rotation.suspendedKeys.has(key));
    if (availableKeys.length === 0) {
      console.warn(`❌ All keys for ${sport} are suspended`);
      return null;
    }

    let attempts = 0;
    const startIndex = rotation.current;

    console.log(`🔍 Finding available key for ${sport}. Available: ${availableKeys.length}/${rotation.keys.length} keys`);

    while (attempts < rotation.keys.length) {
      const currentKey = rotation.keys[rotation.current];
      
      // Пропускаем заблокированные ключи
      if (rotation.suspendedKeys.has(currentKey)) {
        console.log(`⏭️ Skipping suspended key ${rotation.current + 1}/${rotation.keys.length} for ${sport}: ${currentKey.substring(0, 8)}...`);
        this.switchToNextKey(sport);
        attempts++;
        continue;
      }
      
      console.log(`🔑 Checking key ${rotation.current + 1}/${rotation.keys.length} for ${sport}: ${currentKey.substring(0, 8)}...`);
      
      // Проверяем статус только если ключ не заблокирован
      const isAvailable = await this.checkKeyStatusViaAPI(sport, currentKey);
      
      if (isAvailable) {
        console.log(`✅ Selected key for ${sport}: ${currentKey.substring(0, 8)}... (API confirmed available)`);
        return currentKey;
      } else {
        console.log(`❌ Key ${currentKey.substring(0, 8)}... is exhausted, switching to next key`);
        this.switchToNextKey(sport);
        attempts++;
      }
    }
    
    // Все ключи исчерпаны
    console.warn(`❌ All ${rotation.keys.length} keys exhausted for ${sport} according to API checks`);
    return null;
  }

  // Переключение на следующий ключ
  private switchToNextKey(sport: string): void {
    const rotation = this.keyRotation[sport];
    const previousIndex = rotation.current;
    rotation.current = (rotation.current + 1) % rotation.keys.length;
    console.log(`🔄 Switching key for ${sport} from index ${previousIndex} to ${rotation.current}`);
  }

  // Инкремент использованных запросов
  private incrementUsage(sport: string, key: string): void {
    const oldUsage = this.keyRotation[sport].usedToday[key] || 0;
    const newUsage = oldUsage + 1;
    this.keyRotation[sport].usedToday[key] = newUsage;
    
    console.log(`📊 Key usage updated for ${sport}: ${key.substring(0, 8)}... ${oldUsage} → ${newUsage}/100 ${newUsage >= 95 ? '⚠️ NEAR LIMIT' : ''}`);
    
    // Предупреждение когда ключ близок к исчерпанию
    if (newUsage >= 95 && newUsage < 100) {
      console.warn(`⚠️ Key ${key.substring(0, 8)}... for ${sport} is near daily limit: ${newUsage}/100`);
    }
  }


  // Метод для логирования статуса всех ключей
  private logAllKeysStatus(sport: string): void {
    const rotation = this.keyRotation[sport];
    console.log(`📋 All keys status for ${sport}:`);
    rotation.keys.forEach((key, index) => {
      const usage = rotation.usedToday[key] || 0;
      const isCurrent = index === rotation.current;
      const status = usage >= 100 ? '❌ EXHAUSTED' : '✅ AVAILABLE';
      console.log(`  ${isCurrent ? '→' : ' '} Key ${index + 1}: ${key.substring(0, 8)}... = ${usage}/100 ${status}`);
    });
  }

  // Тестовый метод для имитации исчерпания ключа (для отладки)
  public simulateKeyExhaustion(sport: string, keyIndex?: number): void {
    const rotation = this.keyRotation[sport];
    const targetIndex = keyIndex !== undefined ? keyIndex : rotation.current;
    const targetKey = rotation.keys[targetIndex];
    
    if (targetKey) {
      console.log(`🧪 TESTING: Key ${targetIndex + 1} for ${sport} would be exhausted...`);
    }
  }

  // Получить количество рабочих (незаблокированных) ключей
  public getWorkingKeysCount(): number {
    const rotation = this.keyRotation['football']; // Используем любой спорт, так как ключи общие
    const workingKeys = rotation.keys.filter(key => !rotation.suspendedKeys.has(key));
    return workingKeys.length;
  }

  // Получить динамический интервал обновления в зависимости от количества ключей
  public getUpdateInterval(): number {
    const workingKeysCount = this.getWorkingKeysCount();
    
    if (workingKeysCount >= 3) {
      return 5; // 5 минут
    } else if (workingKeysCount === 2) {
      return 10; // 10 минут
    } else if (workingKeysCount === 1) {
      return 15; // 15 минут
    } else {
      return 30; // 30 минут если ключей нет
    }
  }

  // Обработчик изменения ключей (вызывается LiveFeedService)
  private onKeysUpdatedCallback?: () => void;
  
  public setOnKeysUpdatedCallback(callback: () => void): void {
    this.onKeysUpdatedCallback = callback;
  }
  
  private onKeysUpdated(): void {
    if (this.onKeysUpdatedCallback) {
      this.onKeysUpdatedCallback();
    }
  }

  // Получить статус всех ключей (для отладки)
  public getKeysStatus(sport?: string): any {
    if (sport) {
      const rotation = this.keyRotation[sport];
      return {
        sport,
        currentIndex: rotation.current,
        workingKeys: this.getWorkingKeysCount(),
        updateInterval: this.getUpdateInterval(),
        keys: rotation.keys.map((key, index) => ({
          index: index + 1,
          key: key.substring(0, 8) + '...',
          usage: rotation.usedToday[key] || 0,
          suspended: rotation.suspendedKeys.has(key),
          available: (rotation.usedToday[key] || 0) < 100 && !rotation.suspendedKeys.has(key)
        }))
      };
    }
    
    // Статус для всех видов спорта
    return Object.keys(this.keyRotation).map(sportName => this.getKeysStatus(sportName));
  }

  // Выполнение запроса к API Sports
  async makeRequest(sport: 'football' | 'basketball' | 'hockey' | 'volleyball' | 'baseball', endpoint: string): Promise<any> {
    const baseUrl = this.endpoints[sport];
    
    let retries = 0;
    const maxRetries = 3;
    let keyExhaustionRetries = 0;
    const maxKeyExhaustionRetries = 5; // Максимум попыток смены ключей

    while (retries < maxRetries) {
      // Получаем текущий доступный ключ с проверкой через API
      const key = await this.getCurrentKey(sport);
      
      if (!key) {
        console.warn(`❌ No available keys for ${sport}, all keys exhausted`);
        return null;
      }

      console.log(`🔑 Using key for ${sport}: ${key.substring(0, 8)}... (attempt ${retries + 1}/${maxRetries})`);

      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          headers: {
            'x-apisports-key': key
          },
          timeout: 15000
        });

        this.incrementUsage(sport, key);
        console.log(`✅ Success for ${sport} with key ${key.substring(0, 8)}...`);
        return response.data;

      } catch (error: any) {
        console.log(`🔴 API Error for ${sport}:`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          endpoint: `${baseUrl}${endpoint}`,
          key: key?.substring(0, 8) + '...',
          retryAttempt: retries + 1
        });
        
        if (error.response?.status === 429) {
          // Rate limit exceeded - переключаемся на следующий ключ
          const errorMessage = error.response.data?.message || '';
          
          console.log(`🚫 Rate limit (429) for ${sport}:`, {
            message: errorMessage,
            key: key.substring(0, 8) + '...'
          });
          
          console.log(`⚠️ Key limit exceeded for ${sport}, switching to next key: ${key.substring(0, 8)}...`);
          
          // Увеличиваем счетчик попыток смены ключей
          keyExhaustionRetries++;
          if (keyExhaustionRetries >= maxKeyExhaustionRetries) {
            console.warn(`❌ Too many key exhaustion retries for ${sport}, stopping`);
            return null;
          }
          
          // НЕ увеличиваем retries при смене ключа - это не ошибка retry
          console.log(`🔄 Trying with next available key for ${sport}... (key switch attempt ${keyExhaustionRetries}/${maxKeyExhaustionRetries})`);
          continue; // Пробуем снова с новым ключом без увеличения retries
        } else if (error.response?.status >= 500 || error.code === 'ECONNRESET') {
          // Server error or connection issue
          const backoffTime = Math.pow(2, retries) * 500; // exponential backoff
          console.log(`🔄 Server error for ${sport}, retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          console.log(`❌ Unhandled error for ${sport}:`, error.response?.data || error.message);
          throw error;
        }

        retries++;
      }
    }

    throw new Error(`Failed to make request to ${sport} API after ${maxRetries} retries`);
  }

  // Получение матчей для конкретного спорта
  async getLiveMatches(sport: 'football' | 'basketball' | 'hockey' | 'volleyball' | 'baseball'): Promise<NormalizedMatch[]> {
    try {
      let endpoint = '';
      // Используем текущую дату но с годом 2025 для соответствия нашему календарю
      const currentDate = new Date();
      const today = `2025-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      if (sport === 'football') {
        // Для футбола получаем только живые матчи
        endpoint = `/fixtures?live=all`;
      } else if (sport === 'baseball') {
        // Для бейсбола получаем все игры на сегодня (и живые, и будущие)
        endpoint = `/games?date=${today}`;
      } else {
        // Для других видов спорта получаем все игры на сегодня (и живые, и будущие)
        endpoint = `/games?date=${today}`;
      }
      
      let data = await this.makeRequest(sport, endpoint);
      
      // Если live эндпоинт не сработал для футбола, пробуем получить игры на сегодня и отфильтровать живые
      if (!data && sport === 'football') {
        console.log(`Live endpoint failed for ${sport}, trying date-based endpoint`);
        const fallbackEndpoint = `/fixtures?date=${today}`;
        data = await this.makeRequest(sport, fallbackEndpoint);
        endpoint = fallbackEndpoint;
      }
      
      // Если live эндпоинт не сработал для других видов спорта, пробуем получить игры на сегодня
      if (!data && sport !== 'football') {
        console.log(`Date endpoint failed for ${sport}, trying live endpoint`);
        const fallbackEndpoint = `/games?live=all`;
        data = await this.makeRequest(sport, fallbackEndpoint);
        endpoint = fallbackEndpoint;
      }
      
      if (!data) return [];

      const matches = data.response || [];
      
      // Добавляем отладочную информацию
      console.log(`API response for ${sport}:`, {
        endpoint,
        total: matches.length,
        sample: matches.slice(0, 2)
      });
      
      // Нормализуем матчи и применяем фильтрацию
      const normalizedMatches = matches
        .map((match: any) => this.normalizeApiSportsMatch(match, sport))
        .filter(Boolean)
        .filter((match: NormalizedMatch) => {
          const scoreInfo = match.score ? `${match.score.home}-${match.score.away}` : '0-0';
          const leagueInfo = match.league ? `[${match.league}]` : '';
          console.log(`⚽ ${sport}: ${leagueInfo} ${match.teams.home} ${scoreInfo} ${match.teams.away} (${match.status})`);
          
          // Для футбола - только живые матчи
          if (sport === 'football') {
            return this.isLiveStatus(match.status);
          }
          
          // Для других видов спорта - живые и будущие матчи (НЕ завершённые)
          return (this.isLiveStatus(match.status) || match.status === 'SOON') && 
                 match.status !== 'FINISHED' && 
                 match.status !== 'FT' && 
                 match.status !== 'CANCELLED';
        })
        .slice(0, 9);
      
      console.log(`Found ${normalizedMatches.length} ${sport} matches (${sport === 'football' ? 'live only' : 'live and upcoming'})`);
      return normalizedMatches;
    } catch (error) {
      console.error(`Error fetching ${sport} matches:`, error);
      return [];
    }
  }

  // Нормализация данных от API Sports
  private normalizeApiSportsMatch(match: any, sport: string): NormalizedMatch | null {
    try {
      if (sport === 'football') {
        // Generate realistic odds for football matches
        const homeOdds = this.generateFootballOdds('home');
        const drawOdds = this.generateFootballOdds('draw');
        const awayOdds = this.generateFootballOdds('away');
        const overOdds = this.generateTotalOdds('over', 2.5);
        const underOdds = this.generateTotalOdds('under', 2.5);
        
        return {
          id: `apisports_football_${match.fixture.id}`,
          sport: 'football',
          league: match.league?.name || null,
          startedAt: match.fixture?.date ? new Date(match.fixture.date).toISOString() : null,
          status: this.mapApiSportsStatus(match.fixture?.status?.short || 'NS'),
          teams: {
            home: match.teams?.home?.name || 'Unknown',
            away: match.teams?.away?.name || 'Unknown'
          },
          score: {
            home: match.goals?.home || 0,
            away: match.goals?.away || 0
          },
          homeOdds,
          drawOdds,
          awayOdds,
          overOdds,
          underOdds,
          totalLine: '2.5',
          currentMinute: match.fixture?.status?.elapsed || 0,
          provider: 'apisports',
          raw: match
        };
      } else {
        // Basketball, Hockey, Volleyball - generate appropriate odds
        let overOdds, underOdds, totalLine;
        
        if (sport === 'basketball') {
          overOdds = this.generateTotalOdds('over', 220.5);
          underOdds = this.generateTotalOdds('under', 220.5);
          totalLine = '220.5';
        } else if (sport === 'hockey') {
          overOdds = this.generateTotalOdds('over', 5.5);
          underOdds = this.generateTotalOdds('under', 5.5);
          totalLine = '5.5';
        } else if (sport === 'baseball') {
          overOdds = this.generateTotalOdds('over', 8.5);
          underOdds = this.generateTotalOdds('under', 8.5);
          totalLine = '8.5';
        } else { // volleyball
          overOdds = this.generateTotalOdds('over', 4.5);
          underOdds = this.generateTotalOdds('under', 4.5);
          totalLine = '4.5';
        }
        
        return {
          id: `apisports_${sport}_${match.id}`,
          sport: sport as 'basketball' | 'hockey' | 'volleyball' | 'baseball',
          league: match.league?.name || match.country?.name || match.tournament?.name || null,
          startedAt: match.date ? new Date(match.date).toISOString() : (match.time ? new Date(match.time).toISOString() : null),
          status: this.mapApiSportsStatus(match.status?.short || match.status || 'NS'),
          teams: {
            home: match.teams?.home?.name || match.home?.name || 'Unknown',
            away: match.teams?.away?.name || match.away?.name || 'Unknown'
          },
          score: {
            home: match.scores?.home?.total || match.score?.home || match.home_score || 0,
            away: match.scores?.away?.total || match.score?.away || match.away_score || 0
          },
          overOdds,
          underOdds,
          totalLine,
          currentMinute: match.status?.timer || match.timer || match.time || 0,
          provider: 'apisports',
          raw: match
        };
      }
    } catch (error) {
      console.error(`Error normalizing ${sport} match:`, error);
      return null;
    }
  }

  // Маппинг статусов API Sports
  private mapApiSportsStatus(status: string): NormalizedMatch['status'] {
    const statusMap: { [key: string]: NormalizedMatch['status'] } = {
      // Football LIVE statuses
      '1H': '1H',     // First Half
      '2H': '2H',     // Second Half 
      'HT': 'HT',     // Half Time
      'ET': 'ET',     // Extra Time
      'P': 'P',       // Penalty
      'LIVE': 'LIVE', // Live/In-Play
      // Basketball/Hockey/Volleyball LIVE statuses
      'Q1': 'LIVE',   // Quarter 1
      'Q2': 'LIVE',   // Quarter 2
      'Q3': 'LIVE',   // Quarter 3
      'Q4': 'LIVE',   // Quarter 4
      'OT': 'LIVE',   // Overtime
      'H1': 'LIVE',   // First Half (Hockey)
      'H2': 'LIVE',   // Second Half (Hockey)
      '1': 'LIVE',    // First Set/Period
      '2': 'LIVE',    // Second Set/Period
      '3': 'LIVE',    // Third Set/Period
      '4': 'LIVE',    // Fourth Set/Period
      '5': 'LIVE',    // Fifth Set/Period
      // Non-live statuses
      'FT': 'FINISHED',      // Full Time
      'AET': 'FINISHED',     // After Extra Time
      'PEN': 'FINISHED',     // After Penalties
      'FINISHED': 'FINISHED',
      'CANCELLED': 'CANCELLED',
      'POSTPONED': 'POSTPONED',
      'SUSPENDED': 'SUSPENDED',
      'AWD': 'FINISHED',     // Awarded
      'WO': 'FINISHED',      // Walkover
      'TBD': 'SOON',         // To Be Determined
      'NS': 'SOON'           // Not Started
    };
    return statusMap[status] || 'SOON';
  }

  // Generate realistic football odds (1X2)
  private generateFootballOdds(market: 'home' | 'draw' | 'away'): string {
    const oddsRanges = {
      home: [1.20, 4.50],
      draw: [2.80, 4.20], 
      away: [1.15, 5.00]
    };
    
    const [min, max] = oddsRanges[market];
    const odds = Math.random() * (max - min) + min;
    return odds.toFixed(2);
  }

  // Generate realistic total odds (Over/Under)
  private generateTotalOdds(market: 'over' | 'under', totalLine: number): string {
    // Typically Over/Under odds are close to evens (around 1.85-1.95)
    const baseOdds = market === 'over' ? 1.90 : 1.85;
    const variance = 0.30; // ±0.30 variance
    const odds = baseOdds + (Math.random() - 0.5) * variance;
    return Math.max(1.10, Math.min(2.50, odds)).toFixed(2);
  }


  // Проверка, является ли статус живым
  private isLiveStatus(status: string): boolean {
    const liveStatuses = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'H1', 'H2', '1', '2', '3', '4', '5'];
    return liveStatuses.includes(status);
  }

  // Получение квоты для отчета
  getQuotaStatus(): {
    football: { [key: string]: number };
    basketball: { [key: string]: number };
    hockey: { [key: string]: number };
    volleyball: { [key: string]: number };
    baseball: { [key: string]: number };
  } {
    const quota = {
      football: {} as { [key: string]: number },
      basketball: {} as { [key: string]: number },
      hockey: {} as { [key: string]: number },
      volleyball: {} as { [key: string]: number },
      baseball: {} as { [key: string]: number }
    };
    
    (['football', 'basketball', 'hockey', 'volleyball', 'baseball'] as const).forEach(sport => {
      this.keyRotation[sport].keys.forEach((key, index) => {
        quota[sport][`K${index + 1}`] = this.keyRotation[sport].usedToday[key] || 0;
      });
    });
    
    return quota;
  }
}

class LiveFeedService {
  public apiSportsClient: ApiSportsClient;
  
  private currentSnapshot: LiveFeedResponse = {
    updatedAt: new Date().toISOString(),
    sports: {
      football: [],
      basketball: [],
      hockey: [],
      volleyball: [],
      baseball: [],
    }
  };

  private scoreUpdateInterval: NodeJS.Timeout | null = null;
  private poolUpdateInterval: NodeJS.Timeout | null = null;
  private timeCheckInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.apiSportsClient = new ApiSportsClient();
  }

  // Получение лайв матчей по футболу (только API Sports)
  private async fetchFootballMatches(): Promise<NormalizedMatch[]> {
    try {
      return await this.apiSportsClient.getLiveMatches('football');
    } catch (error) {
      console.error('Error fetching football matches from API Sports:', error);
      return [];
    }
  }

  // Получение лайв матчей по баскетболу (только API Sports)
  private async fetchBasketballMatches(): Promise<NormalizedMatch[]> {
    try {
      return await this.apiSportsClient.getLiveMatches('basketball');
    } catch (error) {
      console.error('Error fetching basketball matches from API Sports:', error);
      return [];
    }
  }

  // Получение лайв матчей по хоккею (только API Sports)
  private async fetchHockeyMatches(): Promise<NormalizedMatch[]> {
    try {
      return await this.apiSportsClient.getLiveMatches('hockey');
    } catch (error) {
      console.error('Error fetching hockey matches from API Sports:', error);
      return [];
    }
  }

  // Получение лайв матчей по волейболу (только API Sports)
  private async fetchVolleyballMatches(): Promise<NormalizedMatch[]> {
    try {
      return await this.apiSportsClient.getLiveMatches('volleyball');
    } catch (error) {
      console.error('Error fetching volleyball matches from API Sports:', error);
      return [];
    }
  }

  // Получение лайв матчей по бейсболу (только API Sports)
  private async fetchBaseballMatches(): Promise<NormalizedMatch[]> {
    try {
      return await this.apiSportsClient.getLiveMatches('baseball');
    } catch (error) {
      console.error('Error fetching baseball matches from API Sports:', error);
      return [];
    }
  }

  // Обновление пула матчей (каждые 5 минут согласно промпту)
  private async updateMatchPool(): Promise<void> {
    console.log('Updating match pool...');
    
    try {
      // Добавляем джиттер между запросами для разных видов спорта
      const [football, basketball, hockey, volleyball, baseball] = await Promise.all([
        this.fetchFootballMatches(),
        new Promise(resolve => setTimeout(resolve, Math.random() * 2000)).then(() => this.fetchBasketballMatches()),
        new Promise(resolve => setTimeout(resolve, Math.random() * 2000)).then(() => this.fetchHockeyMatches()),
        new Promise(resolve => setTimeout(resolve, Math.random() * 2000)).then(() => this.fetchVolleyballMatches()),
        new Promise(resolve => setTimeout(resolve, Math.random() * 2000)).then(() => this.fetchBaseballMatches()),
      ]);

      // Проверяем времена матчей и обновляем статусы
      const processedSports = {
        football: this.processMatchTimings(football),
        basketball: this.processMatchTimings(basketball),
        hockey: this.processMatchTimings(hockey),
        volleyball: this.processMatchTimings(volleyball),
        baseball: this.processMatchTimings(baseball),
      };

      this.currentSnapshot = {
        updatedAt: new Date().toISOString(),
        sports: processedSports,
        quota: this.apiSportsClient.getQuotaStatus()
      };

      console.log(`Updated pool: ${processedSports.football.length} football, ${processedSports.basketball.length} basketball, ${processedSports.hockey.length} hockey, ${processedSports.volleyball.length} volleyball, ${processedSports.baseball.length} baseball matches`);
    } catch (error) {
      console.error('Error updating match pool:', error);
    }
  }

  // Проверка, является ли статус живым
  private isLiveStatus(status: string): boolean {
    const liveStatuses = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'H1', 'H2', '1', '2', '3', '4', '5'];
    return liveStatuses.includes(status);
  }

  // Обработка времени матчей и автоматический перевод SOON в LIVE
  private processMatchTimings(matches: NormalizedMatch[]): NormalizedMatch[] {
    const now = new Date();
    
    return matches.map(match => {
      // Если матч в статусе SOON и время началось, переводим в LIVE
      if (match.status === 'SOON' && match.startedAt) {
        const matchStartTime = new Date(match.startedAt);
        const timeDifference = now.getTime() - matchStartTime.getTime();
        
        // Если матч должен был начаться, переводим в LIVE и начинаем считать минуты
        if (timeDifference >= 0) {
          const minutesPlayed = Math.floor(timeDifference / (1000 * 60));
          
          return {
            ...match,
            status: 'LIVE' as const,
            currentMinute: Math.min(minutesPlayed, 90) // Максимум 90 минут для футбола
          };
        }
      }
      
      // Если матч уже LIVE, обновляем минуты
      if (this.isLiveStatus(match.status) && match.startedAt) {
        const matchStartTime = new Date(match.startedAt);
        const timeDifference = now.getTime() - matchStartTime.getTime();
        
        if (timeDifference >= 0) {
          const minutesPlayed = Math.floor(timeDifference / (1000 * 60));
          
          return {
            ...match,
            currentMinute: Math.min(minutesPlayed, 90)
          };
        }
      }
      
      return match;
    });
  }
  
  // Обновление времени матчей (каждые 30 секунд)
  private updateMatchTimings(): void {
    const updatedSports = {
      football: this.processMatchTimings(this.currentSnapshot.sports.football),
      basketball: this.processMatchTimings(this.currentSnapshot.sports.basketball),
      hockey: this.processMatchTimings(this.currentSnapshot.sports.hockey),
      volleyball: this.processMatchTimings(this.currentSnapshot.sports.volleyball),
      baseball: this.processMatchTimings(this.currentSnapshot.sports.baseball),
    };
    
    // Обновляем снапшот только если есть изменения
    const hasChanges = JSON.stringify(updatedSports) !== JSON.stringify(this.currentSnapshot.sports);
    
    if (hasChanges) {
      this.currentSnapshot = {
        ...this.currentSnapshot,
        sports: updatedSports,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated match timings');
    }
  }

  // Очистка завершенных избранных матчей
  private async cleanupFinishedFavorites(): Promise<void> {
    try {
      const { storage } = await import('../storage');
      await storage.removeFinishedFavorites();
    } catch (error) {
      console.error('Error cleaning up finished favorites:', error);
    }
  }

  // Настройка интервала обновления пула
  private setupPoolUpdateInterval(): void {
    // Очищаем старый интервал если есть
    if (this.poolUpdateInterval) {
      clearInterval(this.poolUpdateInterval);
    }
    
    const interval = this.apiSportsClient.getUpdateInterval();
    const poolJitter = Math.random() * 10000; // ±5 сек
    
    this.poolUpdateInterval = setInterval(() => {
      this.updateMatchPool();
    }, interval * 60000 + poolJitter);
    
    console.log(`🔄 Pool update interval set to ${interval} minutes (${this.apiSportsClient.getWorkingKeysCount()} working keys)`);
  }

  // Запуск сервиса
  async start(): Promise<void> {
    console.log('Starting Live Feed Service...');
    
    // Устанавливаем callback для автоматического обновления интервала
    this.apiSportsClient.setOnKeysUpdatedCallback(() => {
      this.setupPoolUpdateInterval();
    });
    
    // Инициализируем ключи через API проверку
    await this.apiSportsClient.initializeKeys();
    
    // Сразу обновляем пул
    this.updateMatchPool();
    
    // Настраиваем динамический интервал обновления пула
    this.setupPoolUpdateInterval();
    
    // Обновление времени матчей каждые 30 секунд
    this.timeCheckInterval = setInterval(() => {
      this.updateMatchTimings();
      this.cleanupFinishedFavorites();
    }, 30 * 1000);
    
    console.log('Live Feed Service started:');
    console.log(`- Match pool updates: every ${this.apiSportsClient.getUpdateInterval()} minutes (dynamic based on working keys)`);
    console.log('- Match timing updates: every 30 seconds');
    console.log('- Football: LIVE matches only');
    console.log('- Other sports: LIVE and upcoming matches');
  }

  // Остановка сервиса
  stop(): void {
    if (this.scoreUpdateInterval) {
      clearInterval(this.scoreUpdateInterval);
      this.scoreUpdateInterval = null;
    }
    
    if (this.poolUpdateInterval) {
      clearInterval(this.poolUpdateInterval);  
      this.poolUpdateInterval = null;
    }
    
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }
    
    console.log('Live Feed Service stopped');
  }

  // Получение текущего состояния
  getCurrentSnapshot(): LiveFeedResponse {
    return { ...this.currentSnapshot };
  }
}

export const liveFeedService = new LiveFeedService();
