--List_Achievements
SELECT achievement_id, title, description, icon_url, criteria_type, criteria_value
FROM achievements
ORDER BY criteria_value ASC;

--Get_User_Achievements
SELECT a.achievement_id, a.title, a.description, a.icon_url, a.criteria_type, a.criteria_value, ua.awarded_at
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.achievement_id
WHERE ua.user_id = $1
ORDER BY ua.awarded_at DESC;

-- Create_Achievement
INSERT INTO achievements (title, description, icon_url, criteria_type, criteria_value)
VALUES ($1, $2, $3, $4, $5)
RETURNING achievement_id, title, criteria_type, criteria_value;
