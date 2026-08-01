const axios = require('axios');

const JUDGE0_API = process.env.JUDGE0_API_URL;

const submitCode = async (sourceCode, languageId, stdin, expectedOutput) => {
    const response = await axios.post(`${JUDGE0_API}/submissions?wait=true`, {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin,
        expected_output: expectedOutput
    });

    return response.data;
};

const getSubmissionResult = async (token) => {
    const response = await axios.get(`${JUDGE0_API}/submissions/${token}?fields=status,stdout,stderr,compile_output,time,memory`);

    return response.data;
}

module.exports = {submitCode, getSubmissionResult};