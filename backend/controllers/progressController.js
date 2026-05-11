/**
 * controllers/progressController.js
 * Handles progress tracking, test results, dashboard data
 */

const Progress   = require('../models/Progress');
const StudyPlan  = require('../models/StudyPlan');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// GET /api/progress — get user's full progress
const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    if (!progress) return next(new AppError('Progress not found.', 404));
    res.status(200).json({ success: true, data: progress });
  } catch (err) { next(err); }
};

// GET /api/progress/dashboard — aggregated dashboard stats
const getDashboard = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    const plans    = await StudyPlan.find({ user: req.user._id });

    // Aggregate stats
    const totalTopics     = plans.flatMap(p => p.subjects.flatMap(s => s.topics)).length;
    const completedTopics = plans.flatMap(p => p.subjects.flatMap(s => s.topics))
                                 .filter(t => t.status === 'completed').length;

    const testScores  = progress?.testResults?.map(t => t.score) || [];
    const avgScore    = testScores.length ? Math.round(testScores.reduce((a, b) => a + b, 0) / testScores.length) : 0;
    const lastScore   = testScores.length ? testScores[testScores.length - 1] : 0;

    res.status(200).json({
      success: true,
      data: {
        streak:         progress?.streak || 0,
        totalHours:     progress?.totalHours || 0,
        totalTopics,
        completedTopics,
        completionPct:  totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0,
        avgScore,
        lastScore,
        testsTaken:     progress?.testResults?.length || 0,
        certificates:   progress?.certificates?.length || 0,
        recentActivity: (progress?.activityLog || []).slice(-5).reverse(),
      },
    });
  } catch (err) { next(err); }
};

// POST /api/progress/test — submit a test result
const submitTest = async (req, res, next) => {
  try {
    const { subject, testName, score, total } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          testResults: { subject, testName, score, total: total || 100 },
          activityLog: { message: `Took ${testName} in ${subject} — scored ${score}%` },
        },
      },
      { new: true, upsert: true }
    );

    // Also update lastScore in StudyPlan
    await StudyPlan.updateOne(
      { user: req.user._id, 'subjects.name': subject },
      { $push: { 'subjects.$.testScores': { score } }, $set: { 'subjects.$.lastScore': score } }
    );

    res.status(200).json({ success: true, data: progress.testResults.slice(-1)[0] });
  } catch (err) { next(err); }
};

// POST /api/progress/daily — log daily study hours
const logDaily = async (req, res, next) => {
  try {
    const { date, hoursStudied, topicsCompleted } = req.body;

    // Upsert daily entry
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) return next(new AppError('Progress not found.', 404));

    const existing = progress.dailyLog.find(d => d.date === date);
    if (existing) {
      existing.hoursStudied    += hoursStudied    || 0;
      existing.topicsCompleted += topicsCompleted || 0;
    } else {
      progress.dailyLog.push({ date, hoursStudied, topicsCompleted });
    }

    progress.totalHours += hoursStudied || 0;

    // Recalculate streak from unique day strings (latest backwards)
    const uniqueDates = [...new Set(progress.dailyLog.map(d => d.date).filter(Boolean))]
      .sort((a, b) => (a < b ? 1 : -1));
    let streak = uniqueDates.length ? 1 : 0;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(`${uniqueDates[i]}T00:00:00Z`);
      const nextDay = new Date(`${uniqueDates[i + 1]}T00:00:00Z`);
      const diff = Math.round((current - nextDay) / 86400000);
      if (diff === 1) streak++;
      else break;
    }
    progress.streak = streak;

    await progress.save();
    await User.findByIdAndUpdate(req.user._id, { streak });
    res.status(200).json({ success: true, data: progress });
  } catch (err) { next(err); }
};

// POST /api/progress/certificate — upload certificate
const uploadCertificate = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          certificates: { subject: req.body.subject, filePath: `/uploads/${req.file.filename}` },
          activityLog:  { message: `Certificate earned for ${req.body.subject}` },
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: progress.certificates.slice(-1)[0] });
  } catch (err) { next(err); }
};

module.exports = { getProgress, getDashboard, submitTest, logDaily, uploadCertificate };
