const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Memory storage for multer
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|webm/;
  
  if (file.mimetype.match(allowedImageTypes) || file.mimetype.match(allowedVideoTypes)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file, folder = 'social-media') => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      transformation: resourceType === 'image' 
        ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
        : [{ quality: 'auto' }]
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message}`);
          reject(error);
        } else {
          logger.info(`File uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result);
        }
      }
    );

    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

// Helper function to delete file from Cloudinary
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    logger.info(`File deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error(`Error deleting file from Cloudinary: ${error.message}`);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  const folderIndex = parts.findIndex(part => part === 'social-media');
  if (folderIndex !== -1 && folderIndex < parts.length - 1) {
    const folder = parts[folderIndex + 1];
    return `${folder}/${publicId}`;
  }
  return publicId;
};

// Helper function to upload single file
const uploadSingle = (fieldName) => upload.single(fieldName);

// Helper function to upload multiple files
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

// Helper function to upload multiple fields
const uploadFields = (fields) => upload.fields(fields);

// Export everything
module.exports = upload;
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;
module.exports.uploadFields = uploadFields;
module.exports.uploadToCloudinary = uploadToCloudinary;
module.exports.deleteFile = deleteFile;
module.exports.extractPublicId = extractPublicId;

