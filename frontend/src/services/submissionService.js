import api from "./api";
 
async function runCode({ problemId, language, code }) {
  const { data } = await api.post("/submissions/run", {
    problemId,
    language,
    code,
  });
  return data;
}
 
async function submitSolution({ problem_id, problemId, language, language_id, languageId, code, contest_id, contestId }) {
  const { data } = await api.post("/submissions", {
    problem_id: problem_id || parseInt(problemId, 10),
    language,
    language_id: language_id || languageId || 71,
    code,
    contest_id: contest_id || contestId || null,
  });
  return data;
}
 
async function getSubmissionById(id) {
  const { data } = await api.get(`/submissions/${id}`);
  return data;
}
 
async function pollSubmission(id, { intervalMs = 1000, timeoutMs = 20000, onUpdate } = {}) {
  const start = Date.now();
 
  while (Date.now() - start < timeoutMs) {
    const submission = await getSubmissionById(id);
    onUpdate?.(submission);
 
    if (submission.status !== "pending" && submission.status !== "judging") {
      return submission;
    }
 
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
 
  throw new Error("Judging timed out. Check the submission status page for updates.");
}
 
async function getSubmissions(params = {}) {
  const { data } = await api.get("/submissions", { params });
  return data;
}
 
const submissionService = {
  runCode,
  submitSolution,
  getSubmissionById,
  pollSubmission,
  getSubmissions,
};
 
export default submissionService;
export {
  runCode,
  submitSolution,
  getSubmissionById,
  pollSubmission,
  getSubmissions,
};