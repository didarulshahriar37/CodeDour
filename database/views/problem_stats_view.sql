-- CodeDour Views: Problem Statistics View

CREATE OR REPLACE VIEW problem_stats_view AS
SELECT 
    p.problem_id,
    p.slug,
    p.title,
    p.difficulty,
    p.total_submissions,
    p.accepted_submissions,
    CASE 
        WHEN p.total_submissions > 0 THEN 
            ROUND((p.accepted_submissions::numeric / p.total_submissions::numeric) * 100, 2)
        ELSE 0.00 
    END AS acceptance_rate,
    u.username AS author_name,
    p.created_at
FROM problems p
LEFT JOIN users u ON p.author_id = u.user_id;
