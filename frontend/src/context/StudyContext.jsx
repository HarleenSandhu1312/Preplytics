import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { calcSubjectScore } from '../utils/analytics';
import { useAuth } from './AuthContext';
import { DEFAULT_SUBJECTS, DEFAULT_TOPICS, initUserStudyData } from '../utils/seed';

const StudyCtx = createContext(null);

export function StudyProvider({ children }) {
  const { user } = useAuth();
  const [studyData, setStudyData]       = useState({});
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      // Bootstrap subjects/topics if first run
      if (!storage.getSubjects()) storage.saveSubjects(DEFAULT_SUBJECTS.reduce((m, s) => { m[s.id] = s; return m; }, {}));
      if (!storage.getTopics())   storage.saveTopics({ ...DEFAULT_TOPICS });

      const d = storage.getStudy(user.email) || {};
      // If no study data yet, init from subjects/topics
      if (Object.keys(d).length === 0) {
        const subjects = storage.getSubjects() || {};
        const topics   = storage.getTopics()   || {};
        const init = initUserStudyData(user.email, subjects, topics);
        storage.saveStudy(user.email, init);
        storage.saveActivity(user.email, {});
        setStudyData(init);
        setActiveSubject(Object.keys(init)[0] || null);
      } else {
        setStudyData(d);
        if (!activeSubject) setActiveSubject(Object.keys(d)[0] || null);
      }
    }
  }, [user]);

  const save = useCallback((data) => {
    storage.saveStudy(user.email, data);
    setStudyData(data);
  }, [user]);

  const markTopic = useCallback((subKey, topicName, status) => {
    const updated = JSON.parse(JSON.stringify(studyData));
    if (!updated[subKey]) return;
    updated[subKey].topics = updated[subKey].topics.map(t =>
      t.name === topicName ? { ...t, status } : t
    );
    const score = calcSubjectScore(updated[subKey]);
    updated[subKey].overallScore = score;
    updated[subKey].weakTopics = updated[subKey].topics
      .filter(t => t.status !== 'completed').map(t => t.name);
    save(updated);
    storage.logActivity(
      status === 'completed'
        ? `Completed topic "${topicName}" in ${subKey}`
        : `Marked topic "${topicName}" as pending in ${subKey}`
    );
  }, [studyData, save]);

  const saveNote = useCallback((subKey, topicName, notes) => {
    const updated = JSON.parse(JSON.stringify(studyData));
    if (!updated[subKey]) return;
    updated[subKey].topics = updated[subKey].topics.map(t =>
      t.name === topicName ? { ...t, studentNotes: notes } : t
    );
    save(updated);
    storage.logActivity(`Updated note for "${topicName}" in ${subKey}`);
  }, [studyData, save]);

  const saveTestResult = useCallback((subKey, result) => {
    const updated = JSON.parse(JSON.stringify(studyData));
    if (!updated[subKey]) return;
    updated[subKey].miniTests = [...(updated[subKey].miniTests || []), result];
    const score = calcSubjectScore(updated[subKey]);
    updated[subKey].overallScore = score;
    if (result.score < 60) {
      const weak = updated[subKey].weakTopics || [];
      if (!weak.includes('Mini Test Performance'))
        updated[subKey].weakTopics = [...weak, 'Mini Test Performance'];
    }
    save(updated);
    storage.logActivity(`Completed ${subKey} mini test — score: ${result.score}%`);
  }, [studyData, save]);

  const syncSubjectsFromAdmin = useCallback(() => {
    if (!user || user.role === 'admin') return;
    const subjects = storage.getSubjects() || {};
    const topics   = storage.getTopics()   || {};
    const current  = storage.getStudy(user.email) || {};
    const updated  = { ...current };
    Object.keys(subjects).forEach(sid => {
      if (!updated[sid]) {
        const ts = (topics[sid] || []).map(t => ({ ...t, status: 'pending', studentNotes: '' }));
        updated[sid] = { name: subjects[sid].name, icon: subjects[sid].icon, overallScore: 0, weakTopics: [], miniTests: [], topics: ts };
      }
    });
    save(updated);
  }, [user, save]);

  return (
    <StudyCtx.Provider value={{ studyData, activeSubject, setActiveSubject, markTopic, saveNote, saveTestResult, syncSubjectsFromAdmin }}>
      {children}
    </StudyCtx.Provider>
  );
}

export const useStudy = () => useContext(StudyCtx);
