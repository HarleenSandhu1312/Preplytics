const express = require('express');
const router = express.Router();

const {
  listAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/postgresAnnouncementController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', listAnnouncements);
router.get('/:id', getAnnouncementById);

router.post('/', protect, authorizeAdmin, createAnnouncement);
router.put('/:id', protect, authorizeAdmin, updateAnnouncement);
router.delete('/:id', protect, authorizeAdmin, deleteAnnouncement);

module.exports = router;
