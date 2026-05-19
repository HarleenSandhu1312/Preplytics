const express = require('express');
const router = express.Router();

const { protect, authorizeAdmin } = require('../middleware/auth');
const {
  getBootstrap,
  updateStudy,
  updateActivity,
  updateRevisions,
  updateManualEvents,
  updateSubjects,
  updateTopics,
  updateNotes,
  updateTests,
  updateActivityLog,
  updateSettings,
  bootstrapStudentStores,
} = require('../controllers/storeController');

router.use(protect);

router.get('/bootstrap', getBootstrap);
router.put('/study', updateStudy);
router.put('/activity', updateActivity);
router.put('/revisions', updateRevisions);
router.put('/manual-events', updateManualEvents);

router.put('/subjects', authorizeAdmin, updateSubjects);
router.put('/topics', authorizeAdmin, updateTopics);
router.put('/notes', authorizeAdmin, updateNotes);
router.put('/tests', authorizeAdmin, updateTests);
router.put('/activity-log', authorizeAdmin, updateActivityLog);
router.put('/settings', authorizeAdmin, updateSettings);
router.post('/sync-students', authorizeAdmin, bootstrapStudentStores);

module.exports = router;
