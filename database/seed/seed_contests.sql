INSERT INTO contests (contest_id, title, slug, description, start_time, end_time, duration_minutes, is_published, created_by) VALUES
(1, 'CodeDour Weekly Contest 1', 'codedour-weekly-1', 
 'Welcome to the inaugural CodeDour Weekly Contest! Test your problem solving skills with 3 algorithmic challenges.',
 CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '2 days', 120, TRUE, 1)
ON CONFLICT (contest_id) DO NOTHING;

SELECT setval('contests_contest_id_seq', (SELECT MAX(contest_id) FROM contests));

INSERT INTO contest_problems (contest_id, problem_id, problem_order, points) VALUES
(1, 1, 'A', 100),
(1, 2, 'B', 200),
(1, 3, 'C', 300)
ON CONFLICT DO NOTHING;

INSERT INTO contest_participants (contest_id, user_id, score, penalty, rank, old_rating, new_rating) VALUES
(1, 3, 300, 45, 1, 1650, 1695),
(1, 4, 100, 12, 2, 1420, 1435),
(1, 5, 0, 0, 3, 1580, 1565)
ON CONFLICT DO NOTHING;