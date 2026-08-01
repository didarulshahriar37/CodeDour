-- CodeDour Views: User Statistics View

CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    u.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.role,
    u.rating,
    u.max_rating,
    u.problems_solved,
    u.total_submissions,
    CASE 
        WHEN u.total_submissions > 0 THEN 
            ROUND((u.problems_solved::numeric / u.total_submissions::numeric) * 100, 2)
        ELSE 0.00 
    END AS accuracy_rate,
    DENSE_RANK() OVER (ORDER BY u.rating DESC) AS global_rank,
    u.created_at
FROM users u;
