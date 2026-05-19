const AppConfig = require('../models/AppConfig');
const StudentStore = require('../models/StudentStore');
const User = require('../models/User');

const getOrCreateAppConfig = async () => {
  let config = await AppConfig.findOne({ key: 'global' });
  if (!config) {
    config = await AppConfig.create({ key: 'global' });
  }
  return config;
};

const getOrCreateStudentStore = async (userId) => {
  let store = await StudentStore.findOne({ user: userId });
  if (!store) {
    store = await StudentStore.create({ user: userId });
  }
  return store;
};

const getBootstrap = async (req, res, next) => {
  try {
    const appConfig = await getOrCreateAppConfig();
    const studentStore = await getOrCreateStudentStore(req.user._id);

    const payload = {
      subjects: appConfig.subjects || {},
      topics: appConfig.topics || {},
      notes: appConfig.notes || [],
      tests: appConfig.tests || [],
      activityLog: appConfig.activityLog || [],
      settings: appConfig.settings || { failThreshold: 50, revDays: 3, maxStreak: 30 },
      study: studentStore.study || {},
      activity: studentStore.activity || {},
      revisions: studentStore.revisions || [],
      manualEvents: studentStore.manualEvents || [],
    };

    if (req.user.role === 'admin') {
      const stores = await StudentStore.find().populate('user', 'email role');
      const allStudentStudy = {};
      stores.forEach((s) => {
        if (s.user && s.user.role !== 'admin') {
          allStudentStudy[s.user.email] = s.study || {};
        }
      });
      payload.allStudentStudy = allStudentStudy;
    }

    res.status(200).json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
};

const updateStudentField = (field) => async (req, res, next) => {
  try {
    const store = await getOrCreateStudentStore(req.user._id);
    store[field] = req.body[field];
    await store.save();
    res.status(200).json({ success: true, data: store[field] });
  } catch (err) {
    next(err);
  }
};

const updateAppField = (field) => async (req, res, next) => {
  try {
    const config = await getOrCreateAppConfig();
    config[field] = req.body[field];
    await config.save();
    res.status(200).json({ success: true, data: config[field] });
  } catch (err) {
    next(err);
  }
};

const bootstrapStudentStores = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('_id');
    await Promise.all(students.map((s) => getOrCreateStudentStore(s._id)));
    res.status(200).json({ success: true, message: 'Student stores synced.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBootstrap,
  updateStudy: updateStudentField('study'),
  updateActivity: updateStudentField('activity'),
  updateRevisions: updateStudentField('revisions'),
  updateManualEvents: updateStudentField('manualEvents'),
  updateSubjects: updateAppField('subjects'),
  updateTopics: updateAppField('topics'),
  updateNotes: updateAppField('notes'),
  updateTests: updateAppField('tests'),
  updateActivityLog: updateAppField('activityLog'),
  updateSettings: updateAppField('settings'),
  bootstrapStudentStores,
};
