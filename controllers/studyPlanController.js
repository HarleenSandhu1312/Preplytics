/**
 * controllers/studyPlanController.js
 * CRUD operations for study plans
 */

const StudyPlan = require('../models/StudyPlan');
const Progress  = require('../models/Progress');
const { AppError } = require('../middleware/errorHandler');

// GET /api/plans — get all plans for logged-in user
const getPlans = async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ user: req.user._id });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (err) { next(err); }
};

// GET /api/plans/:id
const getPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return next(new AppError('Study plan not found.', 404));
    res.status(200).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// POST /api/plans — create a new plan
const createPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// PUT /api/plans/:id — update a plan
const updatePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return next(new AppError('Study plan not found.', 404));
    res.status(200).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// DELETE /api/plans/:id
const deletePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return next(new AppError('Study plan not found.', 404));
    res.status(200).json({ success: true, message: 'Study plan deleted.' });
  } catch (err) { next(err); }
};

// PUT /api/plans/:id/topics/:topicId — update topic status
const updateTopicStatus = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ user: req.user._id });
    if (!plan) return next(new AppError('Plan not found.', 404));

    // Find the topic across all subjects
    let found = false;
    plan.subjects.forEach(subject => {
      const topic = subject.topics.id(req.params.topicId);
      if (topic) {
        topic.status = req.body.status;
        if (req.body.status === 'completed') topic.completedAt = new Date();
        found = true;
      }
    });

    if (!found) return next(new AppError('Topic not found.', 404));
    await plan.save();

    // Log activity to progress
    await Progress.findOneAndUpdate(
      { user: req.user._id },
      { $push: { activityLog: { message: 'Topic marked as ' + req.body.status } } }
    );

    res.status(200).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

module.exports = { getPlans, getPlan, createPlan, updatePlan, deletePlan, updateTopicStatus };
