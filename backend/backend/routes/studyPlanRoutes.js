/**
 * routes/studyPlanRoutes.js
 * All routes require authentication (protect middleware)
 */

const express = require('express');
const router  = express.Router();
const { getPlans, getPlan, createPlan, updatePlan, deletePlan, updateTopicStatus } = require('../controllers/studyPlanController');
const { protect }          = require('../middleware/auth');
const { validateStudyPlan } = require('../middleware/validate');

// All study plan routes require login
router.use(protect);   // Router-level middleware — applies to ALL routes in this file

router.route('/')
  .get(getPlans)
  .post(validateStudyPlan, createPlan);

router.route('/:id')
  .get(getPlan)
  .put(updatePlan)
  .delete(deletePlan);

router.put('/:id/topics/:topicId', updateTopicStatus);

module.exports = router;
