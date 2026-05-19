/**
 * controllers/adminController.js
 * Admin-only operations: analytics, user management
 */

const User     = require('../models/User');
const Progress = require('../models/Progress');
const StudentStore = require('../models/StudentStore');
const AppConfig = require('../models/AppConfig');
const { AppError } = require('../middleware/errorHandler');

// GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins   = await User.countDocuments({ role: 'admin' });
    const stores = await StudentStore.find().populate('user', 'name email role branch examTarget');
    const appConfig = await AppConfig.findOne({ key: 'global' });
    const subjectKeys = Object.keys(appConfig?.subjects || {});

    const studentStores = stores.filter((s) => s.user && s.user.role === 'student');
    const studentWisePerformance = studentStores.map((s) => {
      const study = s.study || {};
      const scores = {};
      let total = 0;
      let count = 0;
      const weakAreas = [];

      subjectKeys.forEach((sid) => {
        const score = study[sid]?.overallScore || 0;
        scores[sid] = score;
        if (score > 0) {
          total += score;
          count += 1;
          if (score < 60) weakAreas.push(sid);
        }
      });

      const overall = count ? Math.round(total / count) : 0;
      return {
        id: s.user._id,
        name: s.user.name,
        email: s.user.email,
        branch: s.user.branch || '',
        examTarget: s.user.examTarget || '',
        overall,
        weakAreas,
        scores,
      };
    });

    const avgPerformance = studentWisePerformance.length
      ? Math.round(
          studentWisePerformance.reduce((sum, s) => sum + s.overall, 0) / studentWisePerformance.length
        )
      : 0;

    const belowFiftyStudents = studentWisePerformance.filter((s) => s.overall > 0 && s.overall < 50);
    const weakStudents = studentWisePerformance.filter((s) => s.weakAreas.length > 0);

    const subjectWiseAverage = subjectKeys.map((sid) => {
      const validScores = studentWisePerformance
        .map((s) => s.scores[sid] || 0)
        .filter((score) => score > 0);
      const average = validScores.length
        ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
        : 0;
      return { subject: sid, average };
    });

    const weakAreasByStudent = studentWisePerformance.map((s) => ({
      studentId: s.id,
      name: s.name,
      email: s.email,
      weakAreas: s.weakAreas,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalAdmins,
        avgPerformance,
        weakStudentsCount: weakStudents.length,
        belowFiftyCount: belowFiftyStudents.length,
        studentWisePerformance,
        weakStudents,
        belowFiftyStudents,
        subjectWiseAverage,
        weakAreasByStudent,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users — list ALL users (admins + students)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id — remove any user
const removeUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    await Progress.findOneAndDelete({ user: req.params.id });
    await StudentStore.findOneAndDelete({ user: req.params.id });
    res.status(200).json({ success: true, message: 'User removed.' });
  } catch (err) { next(err); }
};


// POST /api/admin/users — create a new user (admin can set role)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required.', 400));
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return next(new AppError('Email already registered.', 400));

    const user = await User.create({
      name, email, password,
      role: role === 'admin' ? 'admin' : 'student',
      acceptedTerms: true,
    });
    if (user.role === 'student') {
      await Progress.create({ user: user._id });
      await StudentStore.create({ user: user._id });
    }
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

module.exports = { getAnalytics, getAllUsers, removeUser, createUser };
