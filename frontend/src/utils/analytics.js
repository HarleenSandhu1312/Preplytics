// Each subject now tracks TWO metrics separately:
//   completionPct = % topics completed
//   lastTestScore = score from the most recent test (0 if none taken)

export function calcCompletionPct(subData) {
  if (!subData) return 0;
  const topics = subData.topics || [];
  if (!topics.length) return 0;
  return Math.round(topics.filter(t => t.status === 'completed').length / topics.length * 100);
}

export function calcLastTestScore(subData) {
  if (!subData) return 0;
  const tests = (subData.miniTests || []).filter(t => t.submitted);
  if (!tests.length) return 0;
  return tests[tests.length - 1].score;
}

export function calcAvgTestScore(subData) {
  if (!subData) return 0;
  const tests = (subData.miniTests || []).filter(t => t.submitted);
  if (!tests.length) return 0;
  return Math.round(tests.reduce((sum, t) => sum + t.score, 0) / tests.length);
}

// overallScore = last test score if taken, else completion %
export function calcSubjectScore(subData) {
  const last = calcLastTestScore(subData);
  if (last > 0) return last;
  return calcCompletionPct(subData);
}

export function calcOverall(studyData) {
  const vals = Object.values(studyData || {}).map(d => d.overallScore || 0).filter(v => v > 0);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

export function getAlerts(studyData) {
  return Object.entries(studyData || {})
    .filter(([, d]) => d.overallScore > 0 && d.overallScore < 60)
    .map(([sub, d]) => ({
      subject: sub, score: d.overallScore,
      urgency: d.overallScore < 40 ? 'critical' : 'warning',
      daysUntil: d.overallScore >= 40 ? 3 : 1,
      weakTopics: d.weakTopics || [],
    }))
    .sort((a, b) => a.score - b.score);
}

export function nextRevisionDays(score) {
  if (score >= 75) return 10;
  if (score >= 60) return 5;
  if (score >= 40) return 3;
  return 1;
}

export function isCertUnlocked(subData) {
  if (!subData) return false;
  const pct = calcCompletionPct(subData);
  if (pct < 100) return false;
  const avg = calcAvgTestScore(subData);
  return avg >= 70;
}

export function calcStreakFromDateStrings(dateStrings) {
  if (!Array.isArray(dateStrings) || dateStrings.length === 0) return 0;

  const uniqueDays = [...new Set(dateStrings.filter(Boolean))]
    .map((d) => d.slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort((a, b) => (a < b ? 1 : -1));

  if (uniqueDays.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const current = new Date(`${uniqueDays[i]}T00:00:00Z`);
    const next = new Date(`${uniqueDays[i + 1]}T00:00:00Z`);
    const diffDays = Math.round((current - next) / 86400000);
    if (diffDays === 1) streak += 1;
    else break;
  }

  return streak;
}
