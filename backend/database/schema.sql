-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscription_plans;

-- Create subscription_plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'ultimate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id),
    referred_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(referrer_id, referred_id)
);

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to all users for subscription_plans" ON subscription_plans;
DROP POLICY IF EXISTS "Allow users to view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Allow service role to manage all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Allow users to view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Allow users to create referrals" ON referrals;

-- Subscription plans policies
CREATE POLICY "Allow read access to all users for subscription_plans"
    ON subscription_plans FOR SELECT
    TO authenticated
    USING (true);

-- User subscriptions policies
CREATE POLICY "Allow users to view their own subscriptions"
    ON user_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow service role to manage all subscriptions"
    ON user_subscriptions FOR ALL
    TO service_role
    USING (true);

-- Referrals policies
CREATE POLICY "Allow users to view their own referrals"
    ON referrals FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Allow users to create referrals"
    ON referrals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = referrer_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (tier) VALUES
    ('free'),
    ('pro'),
    ('ultimate'); 