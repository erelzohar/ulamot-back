import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

// Configure storage - for now, memory storage. Can be changed to diskStorage later.
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  console.log('Multer fileFilter processing file:', file.originalname, 'mimetype:', file.mimetype);
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected (not an allowed image type):', file.originalname);
    cb(new Error('Error: Image files only!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: fileFilter
});

export default upload; 