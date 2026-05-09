const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const {
  getAllPoints,
  getPointById,
  createPoint,
  updatePoint,
  deletePoint,
} = require('../controllers/pointsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `zone-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getAllPoints);
router.get('/:id', getPointById);
router.post('/', authenticate, upload.single('image'), createPoint);
router.put('/:id', authenticate, upload.single('image'), updatePoint);
router.delete('/:id', authenticate, deletePoint);

module.exports = router;
