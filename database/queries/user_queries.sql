--FindUserById
SELECT user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, created_at 
FROM users 
WHERE user_id = $1;


--FindUserByUsername
SELECT user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, created_at 
FROM users 
WHERE username = $1;

--CreateUser
INSERT INTO users (firebase_uid, username, email, display_name, avatar_url, role) 
VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'user')) 
RETURNING user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, created_at;

--UpdateUserProfile
UPDATE users 
SET display_name = COALESCE($1, display_name), 
    avatar_url = COALESCE($2, avatar_url), 
    updated_at = CURRENT_TIMESTAMP 
WHERE user_id = $3 
RETURNING user_id, username, display_name, avatar_url, updated_at;

--ListUsersLeaderboard
SELECT user_id, username, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, accuracy_rate, global_rank 
FROM user_stats_view 
WHERE ($1::text IS NULL OR username ILIKE '%' || $1 || '%' OR display_name ILIKE '%' || $1 || '%')
ORDER BY rating DESC 
LIMIT $2 OFFSET $3;

--GetUserRatingHistory
SELECT r.rating_id, r.contest_id, c.title AS contest_title, r.old_rating, r.new_rating, r.rating_change, r.recorded_at 
FROM ratings r 
JOIN contests c ON r.contest_id = c.contest_id 
WHERE r.user_id = $1 
ORDER BY r.recorded_at ASC;
