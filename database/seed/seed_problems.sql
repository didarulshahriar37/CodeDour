-- CodeDour Seed Data: Tags, Topic Dependencies, Problems & Test Cases

-- Tags
INSERT INTO tags (tag_id, name, description) VALUES
(1, 'Arrays', 'Problems involving array manipulation and indexing'),
(2, 'Strings', 'Problems involving string processing and searching'),
(3, 'Math', 'Problems involving arithmetic, algebra, or number theory'),
(4, 'Dynamic Programming', 'Optimization problems solved via overlapping subproblems'),
(5, 'Two Pointers', 'Techniques using two pointer positions to scan linear data structures')
ON CONFLICT (tag_id) DO NOTHING;

SELECT setval('tags_tag_id_seq', (SELECT MAX(tag_id) FROM tags));

-- Topic Dependencies (Prerequisites graph)
INSERT INTO topic_dependencies (topic_id, prerequisite_id) VALUES
(5, 1), -- Two Pointers requires Arrays
(4, 1), -- Dynamic Programming requires Arrays
(4, 3)  -- Dynamic Programming requires Math
ON CONFLICT DO NOTHING;

-- Problems
INSERT INTO problems (problem_id, slug, title, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, author_id) VALUES
(1, 'two-sum', 'Two Sum', 
 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
 'First line contains integer N and target T. Second line contains N space-separated integers.',
 'Print space-separated 0-indexed indices of the two numbers.',
 '2 <= N <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
 'Easy', 1.0, 256, 2),

(2, 'valid-palindrome', 'Valid Palindrome', 
 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
 'A single line containing the input string S.',
 'Print "YES" if it is a palindrome, otherwise "NO".',
 '1 <= length(S) <= 2 * 10^5',
 'Easy', 1.0, 256, 2),

(3, 'fibonacci-number', 'Fibonacci Number', 
 'The Fibonacci numbers form a sequence such that F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1. Calculate F(n) modulo 10^9+7.',
 'A single integer N.',
 'Print the value of F(N) modulo 1000000007.',
 '0 <= N <= 10^6',
 'Medium', 2.0, 256, 1)
ON CONFLICT (problem_id) DO NOTHING;

SELECT setval('problems_problem_id_seq', (SELECT MAX(problem_id) FROM problems));

-- Problem Tags
INSERT INTO problem_tags (problem_id, tag_id) VALUES
(1, 1), (1, 5),
(2, 2), (2, 5),
(3, 3), (3, 4)
ON CONFLICT DO NOTHING;

-- Test Cases
INSERT INTO test_cases (test_case_id, problem_id, input, expected_output, is_sample, explanation) VALUES
(1, 1, '4 9\n2 7 11 15', '0 1', TRUE, 'nums[0] + nums[1] == 2 + 7 == 9, so we return [0, 1].'),
(2, 1, '3 6\n3 2 4', '1 2', TRUE, 'nums[1] + nums[2] == 2 + 4 == 6.'),
(3, 2, 'A man, a plan, a canal: Panama', 'YES', TRUE, '"amanaplanacanalpanama" is a palindrome.'),
(4, 2, 'race a car', 'NO', TRUE, '"raceacar" is not a palindrome.'),
(5, 3, '5', '5', TRUE, 'F(5) = 5.'),
(6, 3, '10', '55', FALSE, 'F(10) = 55.')
ON CONFLICT (test_case_id) DO NOTHING;

SELECT setval('test_cases_test_case_id_seq', (SELECT MAX(test_case_id) FROM test_cases));
