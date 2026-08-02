const { submitCode } = require('./judge0.service');

const mapVerdict = (judge0Status) => {
    const mapping = {
        'Accepted': 'Accepted',
        'Wrong Answer': 'Wrong Answer',
        'Time Limit Exceeded': 'Time Limit Exceeded',
        'Memory Limit Exceeded': 'Memory Limit Exceeded',
        'Compilation Error': 'Compilation Error',
        'Compile Error': 'Compilation Error',
        'Runtime Error': 'Runtime Error',
        'Runtime Error (SIGSEGV)': 'Runtime Error',
        'Runtime Error (SIGFPE)': 'Runtime Error',
        'Runtime Error (SIGABRT)': 'Runtime Error',
        'Runtime Error (NZEC)': 'Runtime Error',
        'Internal Error': 'Runtime Error',
        'Exec Format Error': 'Runtime Error'
    };
    return mapping[judge0Status] || 'Runtime Error';
};

const processSubmission = async (sourceCode, languageId, testCases) => {
    const results = [];

    for (const testCase of testCases) {
        const result = await submitCode(
            sourceCode,
            languageId,
            testCase.input,
            testCase.expected_output
        );

        results.push({
            input: testCase.input,
            expected_output: testCase.expected_output,
            actual_output: result.stdout,
            status: result.status,
            time: result.time,
            memory: result.memory,
            stderr: result.stderr,
            compile_output: result.compile_output
        });

        if (result.status.id !== 3) {
            break;
        }
    }

    const allPassed = results.every(r => r.status.id === 3);

    return {
        verdict: mapVerdict(allPassed ? 'Accepted' : results[results.length - 1].status.description),
        results
    };
};

module.exports = { processSubmission };