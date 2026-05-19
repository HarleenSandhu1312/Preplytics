import api from './api';

const cache = {
  userEmail: '',
  userRole: '',
  study: {},
  activity: {},
  revisions: [],
  manualEvents: [],
  subjects: {},
  topics: {},
  notes: [],
  tests: [],
  activityLog: [],
  settings: { failThreshold: 50, revDays: 3, maxStreak: 30 },
  allStudentStudy: {},
};

const put = (url, body) => api.put(url, body).catch(() => {});

export const storage = {
  async initForUser(user) {
    if (!user?.email) return;
    cache.userEmail = user.email;
    cache.userRole = user.role;
    try {
      const res = await api.get('/store/bootstrap');
      const d = res.data?.data || {};
      cache.study = d.study || {};
      cache.activity = d.activity || {};
      cache.revisions = d.revisions || [];
      cache.manualEvents = d.manualEvents || [];
      cache.subjects = d.subjects || {};
      cache.topics = d.topics || {};
      cache.notes = d.notes || [];
      cache.tests = d.tests || [];
      cache.activityLog = d.activityLog || [];
      cache.settings = d.settings || { failThreshold: 50, revDays: 3, maxStreak: 30 };
      cache.allStudentStudy = d.allStudentStudy || {};
    } catch (_err) {
      // Do not block login if store bootstrap is temporarily unavailable.
      // Cache remains with safe defaults and app can still open.
      cache.study = cache.study || {};
      cache.activity = cache.activity || {};
      cache.revisions = cache.revisions || [];
      cache.manualEvents = cache.manualEvents || [];
      cache.subjects = cache.subjects || {};
      cache.topics = cache.topics || {};
      cache.notes = cache.notes || [];
      cache.tests = cache.tests || [];
      cache.activityLog = cache.activityLog || [];
      cache.settings = cache.settings || { failThreshold: 50, revDays: 3, maxStreak: 30 };
      cache.allStudentStudy = cache.allStudentStudy || {};
    }
  },

  clear() {
    cache.userEmail = '';
    cache.userRole = '';
    cache.study = {};
    cache.activity = {};
    cache.revisions = [];
    cache.manualEvents = [];
    cache.subjects = {};
    cache.topics = {};
    cache.notes = [];
    cache.tests = [];
    cache.activityLog = [];
    cache.settings = { failThreshold: 50, revDays: 3, maxStreak: 30 };
    cache.allStudentStudy = {};
  },

  getStudy(email) {
    if (email === cache.userEmail) return cache.study || {};
    return cache.allStudentStudy[email] || {};
  },
  saveStudy(email, d) {
    if (email !== cache.userEmail) return;
    cache.study = d || {};
    put('/store/study', { study: cache.study });
  },

  getActivity() { return cache.activity || {}; },
  saveActivity(_email, d) {
    cache.activity = d || {};
    put('/store/activity', { activity: cache.activity });
  },

  getRevisions() { return cache.revisions || []; },
  saveRevisions(_email, d) {
    cache.revisions = d || [];
    put('/store/revisions', { revisions: cache.revisions });
  },

  getManualEvents() { return cache.manualEvents || []; },
  saveManualEvents(d) {
    cache.manualEvents = d || [];
    put('/store/manual-events', { manualEvents: cache.manualEvents });
  },

  getSubjects() { return cache.subjects || {}; },
  saveSubjects(d) {
    cache.subjects = d || {};
    put('/store/subjects', { subjects: cache.subjects });
  },

  getTopics() { return cache.topics || {}; },
  saveTopics(d) {
    cache.topics = d || {};
    put('/store/topics', { topics: cache.topics });
  },

  getNotes() { return cache.notes || []; },
  saveNotes(d) {
    cache.notes = d || [];
    put('/store/notes', { notes: cache.notes });
  },

  getTests() { return cache.tests || []; },
  saveTests(d) {
    cache.tests = d || [];
    put('/store/tests', { tests: cache.tests });
  },

  getActivityLog() { return cache.activityLog || []; },
  saveActivityLog(d) {
    cache.activityLog = d || [];
    put('/store/activity-log', { activityLog: cache.activityLog });
  },

  getSettings() { return cache.settings || { failThreshold: 50, revDays: 3, maxStreak: 30 }; },
  saveSettings(d) {
    cache.settings = d || { failThreshold: 50, revDays: 3, maxStreak: 30 };
    put('/store/settings', { settings: cache.settings });
  },

  logActivity(msg) {
    const next = [{ msg, time: new Date().toISOString() }, ...(cache.activityLog || [])].slice(0, 100);
    this.saveActivityLog(next);
  },
};
