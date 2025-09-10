-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(20) NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    bonus_balance DECIMAL(10, 2) DEFAULT 0.00,
    has_claimed_welcome_bonus BOOLEAN DEFAULT false,
    total_bonus_received DECIMAL(10, 2) DEFAULT 0.00,
    language VARCHAR(2) DEFAULT 'th',
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    win_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_bets_placed INTEGER DEFAULT 0,
    total_wins_count INTEGER DEFAULT 0,
    total_losses_count INTEGER DEFAULT 0,
    total_profit DECIMAL(10, 2) DEFAULT 0.00,
    admin_notes TEXT,
    vip_level INTEGER DEFAULT 0
);

-- Fixtures table
CREATE TABLE IF NOT EXISTS fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport VARCHAR(50) NOT NULL,
    league TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled',
    home_odds DECIMAL(5, 2),
    draw_odds DECIMAL(5, 2),
    away_odds DECIMAL(5, 2),
    over_odds DECIMAL(5, 2),
    under_odds DECIMAL(5, 2),
    total_line DECIMAL(6, 1),
    current_minute INTEGER DEFAULT 0,
    api_ref TEXT,
    is_live BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bets table
CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    fixture_id UUID REFERENCES fixtures(id),
    market VARCHAR(50) NOT NULL,
    odds DECIMAL(5, 2) NOT NULL,
    stake DECIMAL(10, 2) NOT NULL,
    potential_win DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    placed_at TIMESTAMP DEFAULT NOW(),
    custom_home_team TEXT,
    custom_away_team TEXT,
    custom_league TEXT,
    custom_home_score INTEGER,
    custom_away_score INTEGER,
    custom_match_date TEXT,
    admin_notes TEXT
);

-- Other tables
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tx_id TEXT,
    wallet_address TEXT,
    card_number VARCHAR(19),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_note TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    note TEXT,
    admin_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
