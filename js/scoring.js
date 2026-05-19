/**
 * @typedef {import('./cert-loader.js').Question} Question
 * @typedef {import('./cert-loader.js').CertData} CertData
 */

/**
 * @param {string[]} selected
 * @param {string[]} correct
 */
export function answersMatch(selected, correct) {
  if (selected.length !== correct.length) return false;
  const a = [...selected].sort();
  const b = [...correct].sort();
  return a.every((v, i) => v === b[i]);
}

/**
 * @param {Question} question
 * @param {string[]} selected
 */
export function isQuestionCorrect(question, selected) {
  return answersMatch(selected, question.correct);
}

/**
 * @param {CertData} cert
 * @param {Question[]} questions
 * @param {Record<string, string[]>} responses
 */
export function scoreExam(cert, questions, responses) {
  const scoredQs = questions.filter((q) => q.scored !== false);
  const domainMap = Object.fromEntries(cert.domains.map((d) => [d.id, d.name]));

  let correctCount = 0;
  /** @type {Record<string, { correct: number, total: number }>} */
  const byDomain = {};

  for (const q of scoredQs) {
    const selected = responses[q.id] ?? [];
    const correct = isQuestionCorrect(q, selected);
    if (correct) correctCount++;

    if (!byDomain[q.domain]) {
      byDomain[q.domain] = { correct: 0, total: 0 };
    }
    byDomain[q.domain].total++;
    if (correct) byDomain[q.domain].correct++;
  }

  const totalScored = scoredQs.length || 1;
  const percent = (correctCount / totalScored) * 100;
  const scaledScore = Math.round(
    (correctCount / totalScored) * cert.exam.maxScore
  );
  const passed = scaledScore >= cert.exam.passingScore;

  const domainBreakdown = cert.domains.map((d) => {
    const stats = byDomain[d.id] ?? { correct: 0, total: 0 };
    const percent =
      stats.total > 0
        ? Math.round((stats.correct / stats.total) * 100)
        : 0;
    return {
      id: d.id,
      name: d.name,
      correct: stats.correct,
      total: stats.total,
      percent,
      weak: stats.total > 0 && stats.correct / stats.total < 0.7,
    };
  });

  const missedQuestions = scoredQs
    .filter((q) => !isQuestionCorrect(q, responses[q.id] ?? []))
    .map((q) => q.id);

  return {
    correctCount,
    totalScored,
    percent: Math.round(percent),
    scaledScore,
    passed,
    domainBreakdown,
    missedQuestions,
  };
}
