-- Create a function to handle referrals and grant rewards
CREATE OR REPLACE FUNCTION handle_referral(
  p_referrer_id UUID,
  p_new_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
SET search_path = public
AS $$
DECLARE
  v_referral_count INT;
  v_expires_at TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- 1. Increment referral count
  PERFORM increment_referral_count(p_referrer_id);
  
  -- 2. Get current referral count
  SELECT count INTO v_referral_count
  FROM referrals
  WHERE referrer_id = p_referrer_id;
  
  IF v_referral_count IS NULL THEN
    RETURN jsonb_build_object('error', 'Referral data not found');
  END IF;
  
  -- 3. Grant rewards based on count
  IF v_referral_count >= 4 THEN
    -- Grant 2 months pro
    v_expires_at := NOW() + INTERVAL '60 days';
    
    -- Create reward record
    INSERT INTO referral_rewards (
      user_id,
      reward_type,
      expires_at,
      status
    ) VALUES (
      p_referrer_id,
      'two_months_pro',
      v_expires_at,
      'active'
    );
    
    -- Update subscription
    INSERT INTO user_subscriptions (
      user_id,
      subscription_plan_id,
      status,
      expires_at
    ) VALUES (
      p_referrer_id,
      'pro_plan',
      'active',
      v_expires_at
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      subscription_plan_id = 'pro_plan',
      status = 'active',
      expires_at = v_expires_at;
      
  ELSIF v_referral_count >= 2 THEN
    -- Grant 1 month pro
    v_expires_at := NOW() + INTERVAL '30 days';
    
    -- Create reward record
    INSERT INTO referral_rewards (
      user_id,
      reward_type,
      expires_at,
      status
    ) VALUES (
      p_referrer_id,
      'one_month_pro',
      v_expires_at,
      'active'
    );
    
    -- Update subscription
    INSERT INTO user_subscriptions (
      user_id,
      subscription_plan_id,
      status,
      expires_at
    ) VALUES (
      p_referrer_id,
      'pro_plan',
      'active',
      v_expires_at
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      subscription_plan_id = 'pro_plan',
      status = 'active',
      expires_at = v_expires_at;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'referral_count', v_referral_count,
    'expires_at', v_expires_at
  );
  
  RETURN v_result;
END;
$$; 