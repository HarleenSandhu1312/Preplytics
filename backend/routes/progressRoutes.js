/**
 * routes/progressRoutes.js
 */

const express  = require('express');
const router   = express.Router();
const { getProgress, getDashboard, submitTest, logDaily, uploadCertificate } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const upload      = require('../middleware/upload');

router.use(protect);

router.get('/',          getProgress);
router.get('/dashboard', getDashboard);
router.post('/test',     submitTest);
router.post('/daily',    logDaily);
router.post('/certificate', upload.single('certificate'), uploadCertificate);

module.exports = router;
