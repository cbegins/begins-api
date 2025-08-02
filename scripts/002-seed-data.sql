-- Insert admin user for testing
INSERT INTO users (email, api_key, plan, requests_limit) 
VALUES (
    'admin@begins.site', 
    'begins_admin_key_123456789abcdef', 
    'admin', 
    999999
) ON CONFLICT (email) DO NOTHING;

-- Insert some sample users for testing
INSERT INTO users (email, api_key, plan, requests_used, requests_limit) 
VALUES 
    ('test@example.com', 'begins_test_key_123456789', 'free', 25, 100),
    ('pro@example.com', 'begins_pro_key_987654321', 'pro', 150, 2000),
    ('unlimited@example.com', 'begins_unlimited_key_abcdef', 'unlimited', 500, 999999)
ON CONFLICT (email) DO NOTHING;

-- Insert some sample API usage data
INSERT INTO api_usage (user_id, api_key, endpoint, tokens_used, response_time, status_code, ip_address, user_agent, prompt_length, response_length)
SELECT 
    u.id,
    u.api_key,
    '/v1/chat',
    floor(random() * 500 + 50)::integer,
    floor(random() * 2000 + 100)::integer,
    200,
    '192.168.1.1'::inet,
    'Mozilla/5.0 (compatible; API Client)',
    floor(random() * 1000 + 50)::integer,
    floor(random() * 2000 + 100)::integer
FROM users u
WHERE u.plan != 'admin'
AND random() < 0.7; -- 70% chance for each user to have usage data
