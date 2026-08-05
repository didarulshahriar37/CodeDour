const JUDGE0_API = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';

const submitCode = async (sourceCode, languageId, stdin, expectedOutput) => {
    const res = await fetch(`${JUDGE0_API}/submissions?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            source_code: sourceCode,
            language_id: languageId,
            stdin: (stdin || '').replace(/\\n/g, '\n'),
            expected_output: (expectedOutput || '').replace(/\\n/g, '\n')
        })
    });
    if (!res.ok) {
        throw new Error(`Judge0 API error: ${res.statusText}`);
    }
    return await res.json();
};

const getSubmissionResult = async (token) => {
    const res = await fetch(`${JUDGE0_API}/submissions/${token}?fields=status,stdout,stderr,compile_output,time,memory`);
    if (!res.ok) {
        throw new Error(`Judge0 API error: ${res.statusText}`);
    }
    return await res.json();
};

module.exports = { submitCode, getSubmissionResult };