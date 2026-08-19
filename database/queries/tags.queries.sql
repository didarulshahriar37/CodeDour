
-- List Tags
SELECT t.tag_id, t.name, t.description, COUNT(pt.problem_id) AS problem_count
FROM tags t
LEFT JOIN problem_tags pt ON t.tag_id = pt.tag_id
GROUP BY t.tag_id, t.name, t.description
ORDER BY t.name ASC;

--CreateTag
INSERT INTO tags (name, description)
VALUES ($1, $2)
RETURNING tag_id, name, description;

-- ListTopicDependencies
SELECT td.topic_id, t1.name AS topic_name, td.prerequisite_id, t2.name AS prerequisite_name
FROM topic_dependencies td
JOIN tags t1 ON td.topic_id = t1.tag_id
JOIN tags t2 ON td.prerequisite_id = t2.tag_id
ORDER BY t1.name ASC;

--AddTopicDependency
INSERT INTO topic_dependencies (topic_id, prerequisite_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;
