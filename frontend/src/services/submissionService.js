import api from "./api";
 
/**
 * Run code against sample tests only — not persisted, not judged for score.
 * Powers the "Run" button in ProblemDetail.
 */
async function runCode({ problemId, language, code }) {
  const { data } = await api.post("/submissions/run", {
    problemId,
    language,
    code,
  });
  return data; // { results: [{ input, expectedOutput, actualOutput, passed }], time, memory }
}
 
/**
 * Submit a solution for full judging. This is async on the backend —
 * it queues the submission (submission.service.js -> judge0.service.js),
 * process_submission.sql runs once Judge0 returns a verdict, and
 * update_solved_count.sql / award_achievements.sql triggers fire from there.
 * Powers the "Submit" button in ProblemDetail.
 */
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
 
/**
 * Poll a submission until Judge0 finishes judging it.
 * Usage: const result = await pollSubmission(submissionId, { onUpdate: setVerdict });
 */
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
 
/**
 * List submissions, e.g. for the Submissions page or a problem's Submissions tab.
 * params: { userId, problemId, contestId, status, page, pageSize }
 */
async function getSubmissions(params = {}) {
  const { data } = await api.get("/submissions", { params });
  return data; // { items, total, page, pageSize }
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