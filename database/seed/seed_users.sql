-- CodeDour Seed Data: Users, Achievements & Initial User Statistics

INSERT INTO achievements (achievement_id, title, description, icon_url, criteria_type, criteria_value) VALUES
(1, 'First Step', 'Solve your first programming problem', 'trophy-first-step.png', 'solved_count', 1),
(2, 'Problem Solver', 'Solve 5 programming problems', 'trophy-solver.png', 'solved_count', 5),
(3, 'Code Warrior', 'Solve 10 programming problems', 'trophy-warrior.png', 'solved_count', 10),
(4, 'Grandmaster', 'Reach a rating of 2000+', 'trophy-grandmaster.png', 'rating', 2000)
ON CONFLICT (achievement_id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

INSERT INTO users (user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating) VALUES
(1, 'uid_admin_001', 'admin', 'admin@codedour.com', 'System Admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'admin', 2100, 2100),
(2, 'uid_problemsetter', 'setter_john', 'john@codedour.com', 'John Doe (Setter)', 'https://api.dicebear.com/7.x/bottts/svg?seed=john', 'setter', 1850, 1850),
(3, 'uid_alice', 'alice_coder', 'alice@codedour.com', 'Alice Smith', 'https://api.dicebear.com/7.x/bottts/svg?seed=alice', 'user', 1650, 1700),
(4, 'uid_bob', 'bob_builder', 'bob@codedour.com', 'Bob Johnson', 'https://api.dicebear.com/7.x/bottts/svg?seed=bob', 'user', 1420, 1500),
(5, 'uid_charlie', 'charlie_dev', 'charlie@codedour.com', 'Charlie Brown', 'https://api.dicebear.com/7.x/bottts/svg?seed=charlie', 'user', 1580, 1600)
ON CONFLICT (user_id) DO NOTHING;

SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('achievements_achievement_id_seq', (SELECT MAX(achievement_id) FROM achievements));

-- Initialize user_statistics for users
INSERT INTO user_statistics (user_id, total_submissions, accepted_solutions, acceptance_rate, solved_problems, current_rating, highest_rating) VALUES
(1, 0, 0, 0.00, 0, 2100, 2100),
(2, 0, 0, 0.00, 0, 1850, 1850),
(3, 0, 0, 0.00, 0, 1650, 1700),
(4, 0, 0, 0.00, 0, 1420, 1500),
(5, 0, 0, 0.00, 0, 1580, 1600)
ON CONFLICT (user_id) DO NOTHING;
