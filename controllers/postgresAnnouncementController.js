const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listAnnouncements = async (req, res, next) => {
  try {
    const rows = await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError('Invalid announcement id.', 400));
    }

    const row = await prisma.announcement.findUnique({ where: { id } });
    if (!row || !row.isPublished) {
      return next(new AppError('Announcement not found.', 404));
    }

    res.status(200).json({ success: true, data: row });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, priority = 'normal', isPublished = true } = req.body;
    if (!title || !body) {
      return next(new AppError('Title and body are required.', 400));
    }

    const row = await prisma.announcement.create({
      data: {
        title: String(title).trim(),
        body: String(body).trim(),
        priority: String(priority).trim().toLowerCase(),
        isPublished: Boolean(isPublished),
        createdBy: req.user?.email || 'admin',
      },
    });

    res.status(201).json({ success: true, data: row });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError('Invalid announcement id.', 400));
    }

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return next(new AppError('Announcement not found.', 404));
    }

    const payload = {};
    if (req.body.title !== undefined) payload.title = String(req.body.title).trim();
    if (req.body.body !== undefined) payload.body = String(req.body.body).trim();
    if (req.body.priority !== undefined) payload.priority = String(req.body.priority).trim().toLowerCase();
    if (req.body.isPublished !== undefined) payload.isPublished = Boolean(req.body.isPublished);

    const row = await prisma.announcement.update({ where: { id }, data: payload });
    res.status(200).json({ success: true, data: row });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError('Invalid announcement id.', 400));
    }

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return next(new AppError('Announcement not found.', 404));
    }

    await prisma.announcement.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
