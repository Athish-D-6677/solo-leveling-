-- Users core profile
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(128) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age TINYINT UNSIGNED,
  gender VARCHAR(20),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  occupation VARCHAR(100),
  wake_time TIME,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  activity_level VARCHAR(20),
  equipment ENUM('none','home','gym') NOT NULL DEFAULT 'none',
  injuries TEXT,
  diet VARCHAR(30),
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User goals
CREATE TABLE IF NOT EXISTS user_goals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  areas JSON NOT NULL DEFAULT ('[]'),
  main_goal TEXT,
  target_date DATE,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Mindset profile
CREATE TABLE IF NOT EXISTS user_mindset (
  uid VARCHAR(128) PRIMARY KEY,
  player_type ENUM('SLEEPER','RESTARTER','SCATTERER','CLIMBER') NOT NULL,
  drive_score TINYINT NOT NULL DEFAULT 5,
  consistency_score TINYINT NOT NULL DEFAULT 5,
  focus_score TINYINT NOT NULL DEFAULT 5,
  blockers JSON NOT NULL DEFAULT ('[]'),
  why_text TEXT,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Game state (server-managed, never client-writable)
CREATE TABLE IF NOT EXISTS user_game (
  uid VARCHAR(128) PRIMARY KEY,
  level TINYINT UNSIGNED NOT NULL DEFAULT 1,
  xp INT UNSIGNED NOT NULL DEFAULT 0,
  rank_code CHAR(1) NOT NULL DEFAULT 'E',
  str_stat TINYINT UNSIGNED NOT NULL DEFAULT 5,
  vit_stat TINYINT UNSIGNED NOT NULL DEFAULT 5,
  agi_stat TINYINT UNSIGNED NOT NULL DEFAULT 5,
  int_stat TINYINT UNSIGNED NOT NULL DEFAULT 5,
  sen_stat TINYINT UNSIGNED NOT NULL DEFAULT 5,
  titles JSON NOT NULL DEFAULT ('[]'),
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Streak data
CREATE TABLE IF NOT EXISTS user_streak (
  uid VARCHAR(128) PRIMARY KEY,
  current_streak INT UNSIGNED NOT NULL DEFAULT 0,
  longest_streak INT UNSIGNED NOT NULL DEFAULT 0,
  last_counted_date DATE,
  freeze_tokens TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  uid VARCHAR(128) PRIMARY KEY,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time TIME NOT NULL DEFAULT '20:00:00',
  fcm_tokens JSON NOT NULL DEFAULT ('[]'),
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Quest catalog (admin-managed, read-only for users)
CREATE TABLE IF NOT EXISTS quest_catalog (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('physique','health','mind','career','mindset','routine') NOT NULL,
  stat ENUM('STR','VIT','AGI','INT','SEN') NOT NULL,
  base_xp TINYINT UNSIGNED NOT NULL DEFAULT 20,
  easy_target VARCHAR(100),
  normal_target VARCHAR(100),
  hard_target VARCHAR(100),
  elite_target VARCHAR(100),
  unit VARCHAR(50) NOT NULL DEFAULT 'reps',
  equipment ENUM('none','home','gym') NOT NULL DEFAULT 'none',
  muscle_group VARCHAR(50),
  contraindications JSON NOT NULL DEFAULT ('[]'),
  diet_tags JSON NOT NULL DEFAULT ('[]'),
  streak_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  safety_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Daily quest assignments (server-managed)
CREATE TABLE IF NOT EXISTS user_day_quests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  quest_date DATE NOT NULL,
  quest_id VARCHAR(50) NOT NULL,
  tier ENUM('easy','normal','hard','elite') NOT NULL DEFAULT 'normal',
  target VARCHAR(100),
  unit VARCHAR(50),
  status ENUM('PENDING','DONE') NOT NULL DEFAULT 'PENDING',
  completed_at TIMESTAMP NULL,
  streak_required BOOLEAN NOT NULL DEFAULT FALSE,
  is_boss BOOLEAN NOT NULL DEFAULT FALSE,
  is_penalty BOOLEAN NOT NULL DEFAULT FALSE,
  all_done BOOLEAN NOT NULL DEFAULT FALSE,
  bonus_granted BOOLEAN NOT NULL DEFAULT FALSE,
  xp_earned INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_uid_date_quest (uid, quest_date, quest_id),
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- User logs (user-writable: weight, measurements, notes)
CREATE TABLE IF NOT EXISTS user_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  log_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  notes TEXT,
  photo_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Achievements catalog
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  bonus_xp SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  title_text VARCHAR(100)
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_uid_achievement (uid, achievement_id),
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Penalty quest tracking
CREATE TABLE IF NOT EXISTS penalty_quests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  quest_date DATE NOT NULL,
  status ENUM('PENDING','COMPLETED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  last_used_at TIMESTAMP NULL,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Seed achievements
INSERT IGNORE INTO achievements (id, code, name, description, bonus_xp, title_text) VALUES
('ach_first_gate', 'FIRST_GATE', 'First Gate Cleared', 'Complete your first quest.', 50, 'Gate Opener'),
('ach_iron_will', 'IRON_WILL', 'Iron Will', 'Maintain a 7-day streak.', 100, 'Iron Will'),
('ach_unbroken', 'UNBROKEN', 'Unbroken', 'Maintain a 30-day streak.', 300, 'Unbroken'),
('ach_shadow_monarch', 'SHADOW_MONARCH', 'Shadow Monarch', 'Maintain a 100-day streak.', 800, 'Shadow Monarch'),
('ach_early_riser', 'EARLY_RISER', 'Early Riser', 'Complete morning wake quest 7 days.', 50, 'Early Riser'),
('ach_hydrated', 'HYDRATED', 'Hydrated', 'Complete water intake quest 14 days.', 75, 'Hydrated'),
('ach_365', 'YEAR_STRONG', 'Year Strong', 'Maintain a 365-day streak.', 2000, 'Undying');
