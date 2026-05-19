import { useState } from 'react';
import { QUIZ_BANK } from '../../utils/seed';

export default function MiniTest({ subject, adminTests = [], onSave }) {
  const builtIn = QUIZ_BANK[subject] || [];
  const adminQs = adminTests.flatMap(t => t.questions || []);
  const questions = adminQs.length > 0 ? adminQs : builtIn;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [cur, setCur] = useState(0);

  if (!questions.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{display:'flex',justifyContent:'center'}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
        <p>No questions available for {subject} yet.</p>
        <p style={{ marginTop: 6, fontSize: 12 }}>Admin can create tests in the Test Manager.</p>
      </div>
    );
  }

  const q = questions[cur];
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => { if (answers[q.id] === q.ans) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onSave({
      id: `${subject}-${Date.now()}`,
      name: `${subject} Mini Test`,
      score: pct,
      date: new Date().toISOString().split('T')[0],
      submitted: true,
      correct,
      total: questions.length,
      questions: questions,   // save full question data
      answers: { ...answers }, // save user's answers
    });
  };

  if (submitted) {
    const rc = score >= 75 ? 'good' : score >= 60 ? 'mid' : 'bad';
    return (
      <div className="result-wrap">
        <div className={`score-ring ${rc}`}>
          <span className="score-pct">{score}%</span>
          <span className="score-lbl">Score</span>
        </div>
        <h3 className="result-title">{score >= 75 ? 'Excellent!' : score >= 60 ? 'Good effort' : 'Needs revision'}</h3>
        <p className="result-sub">You got <strong>{Math.round(score / 100 * questions.length)}</strong> of <strong>{questions.length}</strong> correct.</p>
        {score < 60 && <div className="result-alert">Revision scheduled in <strong>{score < 40 ? '1–2' : '3'} days</strong></div>}
        <div className="r-answers">
          {questions.map((q, i) => {
            const ua = answers[q.id]; const isR = ua === q.ans;
            return (
              <div key={q.id} className={`r-row ${isR ? 'right' : 'wrong'}`}>
                <div className="r-q">Q{i + 1}. {q.q}</div>
                <div className="r-opts">
                  {q.opts.map((opt, idx) => (
                    <span key={idx} className={`r-opt ${idx === q.ans ? 'correct' : ''} ${idx === ua && !isR ? 'wrong-pick' : ''}`}>{opt}</span>
                  ))}
                </div>
                {q.exp && <div style={{ fontSize:10, color:'var(--blue-mid)', marginTop:5 }}>Explanation: {q.exp}</div>}
              </div>
            );
          })}
        </div>
        <button className="btn btn-p" onClick={() => { setAnswers({}); setSubmitted(false); setScore(0); setCur(0); }}>Retake</button>
      </div>
    );
  }

  return (
    <div className="mt-wrap">
      <div className="mt-bar"><div className="mt-bar-f" style={{ width: `${((cur + 1) / questions.length) * 100}%` }} /></div>
      <div className="mt-meta"><span>Question {cur + 1} of {questions.length}</span><span>{Object.keys(answers).length} answered</span></div>
      <div className="mt-q"><h3>{q.q}</h3></div>
      <div className="mt-opts">
        {q.opts.map((opt, idx) => (
          <button key={idx} className={`mt-opt ${answers[q.id] === idx ? 'sel' : ''}`}
            onClick={() => setAnswers(p => ({ ...p, [q.id]: idx }))}>
            <span className="opt-ltr">{String.fromCharCode(65 + idx)}</span>
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-nav">
        <button className="btn btn-g" onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0}>← Prev</button>
        {cur < questions.length - 1
          ? <button className="btn btn-p" onClick={() => setCur(c => c + 1)} disabled={answers[q.id] === undefined}>Next →</button>
          : <button className="btn btn-p" onClick={handleSubmit} disabled={!allAnswered}>Submit Test</button>
        }
      </div>
    </div>
  );
}
