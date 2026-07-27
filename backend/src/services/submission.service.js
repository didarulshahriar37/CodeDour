const { submitCode } = require('./judge0.service');

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
        verdict: allPassed ? 'Accepted' : results[results.length - 1].status.description,
        results
    };
};

module.exports = { processSubmission };