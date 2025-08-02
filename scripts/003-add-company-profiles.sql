-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_description TEXT,
  industry VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_history table for persistent chats
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  role VARCHAR(10) NOT NULL, -- 'user' or 'assistant'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index for faster conversation retrieval
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_conversation 
ON conversation_history(user_id, conversation_id);

-- Add company_context column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_context TEXT;
