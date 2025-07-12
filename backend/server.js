require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const os = require('os');
const cron = require('node-cron');
const sharp = require('sharp');
const { ManagerInvitation } = require('./models');

// Create our App
const app = express();
const port = process.env.PORT || 3000;

// Use helmet middleware to set the Content Security Policy (CSP) header
app.use(
 helmet.contentSecurityPolicy({
  directives: {
   defaultSrc: ["'self'"],
   scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'blob:',
    'https://firebase.googleapis.com',
    'https://*.firebaseio.com',
    'https://maps.googleapis.com',
    'https://www.googletagmanager.com',
    'https://apis.google.com',
   ],
   scriptSrcElem: [
    "'self'",
    "'unsafe-inline'",
    'https://firebase.googleapis.com',
    'https://*.firebaseio.com',
    'https://maps.googleapis.com',
    'https://www.googletagmanager.com',
    'https://apis.google.com',
   ],
   connectSrc: [
    "'self'",
    'https://firebase.googleapis.com',
    'https://*.firebaseio.com',
    'wss://*.firebaseio.com',
    'https://*.googleapis.com',
    'https://www.gstatic.com',
   ],
   imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
   styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://site-assets.fontawesome.com',
   ],
   fontSrc: [
    "'self'",
    'https:',
    'data:',
    'https://fonts.gstatic.com',
    'https://site-assets.fontawesome.com',
   ],
   workerSrc: ["'self'", 'blob:'],
   frameSrc: [
    "'self'",
    'https://*.firebaseapp.com',
    'https://*.firebaseapp.com',
   ],
   objectSrc: ["'none'"],
   upgradeInsecureRequests: [],
  },
 })
);

// Enable CORS for both local and production frontend
const corsOptions = {
 origin: [
  'http://localhost:3000',
  'http://localhost:4000',
  'https://app.trevio.ma',
 ],
};
app.use(cors(corsOptions));

// Other middleware and route handlers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure multer to store files in the 'uploads' directory
let counter = 1;
const storage = (directory) =>
 multer.diskStorage({
  destination: (req, file, cb) => {
   cb(null, directory);
  },
  filename: (req, file, cb) => {
   const name = path.basename(
    file.originalname,
    path.extname(file.originalname)
   );
   const newName = `${name.replace(/\s+/g, '-')}-${counter}.webp`; // Always use .webp extension
   counter++;
   cb(null, newName);
  },
 });

const convertToWebP = async (inputPath, outputPath, quality = 80) => {
 try {
  await sharp(inputPath).webp({ quality }).toFile(outputPath);
  require('fs').unlinkSync(inputPath);
  return true;
 } catch (error) {
  console.error('Error converting to WebP:', error);
  return false;
 }
};

const compressAvatar = async (inputPath, outputPath) => {
 try {
  console.log('Starting avatar compression...');
  console.log('Input:', inputPath);
  console.log('Output:', outputPath);

  // Check if input file exists
  if (!require('fs').existsSync(inputPath)) {
   throw new Error(`Input file does not exist: ${inputPath}`);
  }

  let quality = 80;
  let attempts = 0;
  const maxAttempts = 10;
  const tempPath = outputPath + '.temp';

  while (attempts < maxAttempts) {
   console.log(`Compression attempt ${attempts + 1}, quality: ${quality}`);

   await sharp(inputPath)
    .resize(128, 128, { fit: 'cover' })
    .webp({ quality })
    .toFile(tempPath);

   const stats = require('fs').statSync(tempPath);
   console.log(`File size after compression: ${stats.size} bytes`);

   if (stats.size <= 20000) {
    // 20KB
    require('fs').renameSync(tempPath, outputPath);
    require('fs').unlinkSync(inputPath);
    console.log('Avatar compression successful');
    return true;
   }

   quality -= 10;
   attempts++;

   if (quality < 10) break;
  }

  // If still too large, try with smaller dimensions
  console.log('Still too large, trying 48x48...');
  await sharp(inputPath)
   .resize(48, 48, { fit: 'cover' })
   .webp({ quality: 30 })
   .toFile(tempPath);

  require('fs').renameSync(tempPath, outputPath);
  require('fs').unlinkSync(inputPath);
  console.log('Avatar compression successful (48x48)');
  return true;
 } catch (error) {
  console.error('Error compressing avatar:', error.message);
  console.error('Stack:', error.stack);

  // Clean up temp file if it exists
  try {
   const tempPath = outputPath + '.temp';
   if (require('fs').existsSync(tempPath)) {
    require('fs').unlinkSync(tempPath);
   }
  } catch (cleanupError) {
   console.error('Temp file cleanup error:', cleanupError);
  }

  return false;
 }
};

// Enhanced compression function with size limits
const compressImageWithSizeLimit = async (
 inputPath,
 outputPath,
 maxWidth = 1200,
 maxHeight = 800,
 maxSizeBytes = 400000, // Default 400KB
 startQuality = 80
) => {
 try {
  let quality = startQuality;
  let attempts = 0;
  const maxAttempts = 10;
  const tempPath = outputPath + '.temp';

  while (attempts < maxAttempts) {
   await sharp(inputPath)
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toFile(tempPath);

   const stats = require('fs').statSync(tempPath);
   console.log(
    `File size after compression: ${(stats.size / 1024).toFixed(2)}KB`
   );

   if (stats.size <= maxSizeBytes) {
    // Size limit achieved
    require('fs').renameSync(tempPath, outputPath);
    require('fs').unlinkSync(inputPath);
    return true;
   }

   quality -= 10;
   attempts++;

   if (quality < 20) break;
  }

  const reducedWidth = Math.floor(maxWidth * 0.8);
  const reducedHeight = Math.floor(maxHeight * 0.8);

  await sharp(inputPath)
   .resize(reducedWidth, reducedHeight, {
    fit: 'inside',
    withoutEnlargement: true,
   })
   .webp({ quality: 30 })
   .toFile(tempPath);

  require('fs').renameSync(tempPath, outputPath);
  require('fs').unlinkSync(inputPath);
  return true;
 } catch (error) {
  console.error('Error compressing image:', error);

  // Clean up temp file if it exists
  try {
   const tempPath = outputPath + '.temp';
   if (require('fs').existsSync(tempPath)) {
    require('fs').unlinkSync(tempPath);
   }
  } catch (cleanupError) {
   console.error('Temp file cleanup error:', cleanupError);
  }

  return false;
 }
};

// Determine the correct path based on the environment
const UPLOADS_PATH =
 process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
const AVATARS_PATH =
 process.env.AVATARS_PATH || path.join(__dirname, 'avatars');
const EQUIPMENTS_PATH =
 process.env.EQUIPMENTS_PATH || path.join(__dirname, 'equipments');
const FRONTPHOTOS_PATH =
 process.env.FRONTPHOTOS_PATH || path.join(__dirname, 'frontphotos');
const PLACES_PATH = process.env.PLACES_PATH || path.join(__dirname, 'places');
const SIGNATURES_PATH =
 process.env.SIGNATURES_PATH || path.join(__dirname, 'signatures');
const IDENTITIES_PATH =
 process.env.IDENTITIES_PATH || path.join(__dirname, 'identities');

// Configure multer instances
const upload = multer({
 storage: storage(UPLOADS_PATH),
 limits: { fileSize: 15 * 1024 * 1024 },
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});
const avatars = multer({
 storage: storage(AVATARS_PATH),
 limits: { fileSize: 15 * 1024 * 1024 },
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});
const equipmentsUpload = multer({
 storage: storage(EQUIPMENTS_PATH),
 limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});
const frontPhotoUpload = multer({
 storage: storage(FRONTPHOTOS_PATH),
 limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});
const singleUpload = multer({
 storage: storage(PLACES_PATH),
 limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});
const signatureUpload = multer({
 storage: storage(SIGNATURES_PATH),
 limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for signatures
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});
const identityUpload = multer({
 storage: storage(IDENTITIES_PATH),
 limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for identities
 fileFilter: function (req, file, cb) {
  checkFileType(file, cb);
 },
});

// Check file type
function checkFileType(file, cb) {
 const filetypes = /jpeg|jpg|png|gif|webp|heic|heif/;
 const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
 const mimetype = filetypes.test(file.mimetype);

 if (mimetype && extname) {
  return cb(null, true);
 } else {
  cb('Error: Images only!');
 }
}

// Handle file upload
app.post('/upload', upload.array('photos', 16), async (req, res) => {
 try {
  const files = [];

  for (let i = 0; i < req.files.length; i++) {
   const file = req.files[i];
   console.log(`Processing file ${i + 1}:`, {
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    path: file.path,
   });

   const originalPath = file.path;
   // Create unique compressed filename for each photo
   const compressedPath = originalPath.replace('.webp', '_compressed.webp');

   const compressed = await compressImageWithSizeLimit(
    originalPath,
    compressedPath,
    1600, // maxWidth
    900, // maxHeight
    600000, // 600KB
    80 // startQuality
   );

   if (compressed && require('fs').existsSync(compressedPath)) {
    const stats = require('fs').statSync(compressedPath);

    files.push({
     filename: path.basename(compressedPath),
     url: `/uploads/${path.basename(compressedPath)}`,
    });
   } else {
    if (!require('fs').existsSync(originalPath)) {
     console.error(
      `File ${i + 1} - Original file was deleted and compression failed`
     );
     // Skip this file and continue with others
     continue;
    }

    files.push({
     filename: file.filename,
     url: `/uploads/${file.filename}`,
    });
   }
  }
  res.json({ files });
 } catch (error) {
  console.error('Multiple upload error:', error);

  // Clean up any uploaded files on error
  if (req.files) {
   req.files.forEach((file) => {
    try {
     if (require('fs').existsSync(file.path)) {
      require('fs').unlinkSync(file.path);
     }
    } catch (cleanupError) {
     console.error('Cleanup error for file:', file.filename, cleanupError);
    }
   });
  }

  res.status(500).json({ error: 'Upload failed', details: error.message });
 }
});
app.use('/uploads', express.static(UPLOADS_PATH));

// Handle file upload for a single photo
app.post('/places', singleUpload.single('photo'), async (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 try {
  const originalPath = req.file.path;
  const compressedPath = originalPath.replace('.webp', '_compressed.webp');

  const compressed = await compressImageWithSizeLimit(
   originalPath,
   compressedPath,
   800, // maxWidth
   600, // maxHeight
   400000, // 400KB
   80 // startQuality
  );

  if (compressed && require('fs').existsSync(compressedPath)) {
   const stats = require('fs').statSync(compressedPath);
   const file = {
    filename: path.basename(compressedPath),
    url: `/places/${path.basename(compressedPath)}`,
   };
   return res.json({ file });
  } else {
   if (!require('fs').existsSync(originalPath)) {
    throw new Error('Original file was deleted and compression failed');
   }

   const file = {
    filename: req.file.filename,
    url: `/places/${req.file.filename}`,
   };
   return res.json({ file });
  }
 } catch (error) {
  console.error('Upload error:', error);
  res.status(500).json({ error: 'Upload failed' });
 }
});
app.use('/places', express.static(PLACES_PATH));

// Handle file upload for avatars
app.post('/avatars', avatars.single('avatar'), async (req, res) => {
 console.log('Avatar upload request received');

 if (!req.file) {
  console.log('No file received');
  return res.status(400).json({ error: 'No file uploaded' });
 }

 console.log('File received:', {
  filename: req.file.filename,
  originalname: req.file.originalname,
  size: req.file.size,
  path: req.file.path,
 });

 try {
  const originalPath = req.file.path;
  // Create a unique compressed filename to avoid overwriting the original
  const webpPath = originalPath.replace('.webp', '_c.webp');

  console.log('Original path:', originalPath);
  console.log('WebP path:', webpPath);

  // Use special compression for avatars
  const compressed = await compressAvatar(originalPath, webpPath);

  if (compressed && require('fs').existsSync(webpPath)) {
   const stats = require('fs').statSync(webpPath);
   console.log(`Avatar compressed to ${(stats.size / 1024).toFixed(2)}KB`);

   const file = {
    filename: path.basename(webpPath),
    url: `/avatars/${path.basename(webpPath)}`,
   };

   console.log('Returning compressed file:', file);
   return res.json({ file });
  } else {
   // Fallback to original file if compression fails
   console.log('Compression failed, using original file');

   // Make sure original file still exists
   if (!require('fs').existsSync(originalPath)) {
    throw new Error('Original file was deleted and compression failed');
   }

   const file = {
    filename: req.file.filename,
    url: `/avatars/${req.file.filename}`,
   };

   console.log('Returning original file:', file);
   return res.json({ file });
  }
 } catch (error) {
  console.error('Avatar upload error:', error);

  // Clean up the original file if it still exists
  try {
   if (require('fs').existsSync(req.file.path)) {
    require('fs').unlinkSync(req.file.path);
   }
  } catch (cleanupError) {
   console.error('Cleanup error:', cleanupError);
  }

  return res.status(500).json({
   error: 'Upload failed',
   details: error.message,
  });
 }
});
app.use('/avatars', express.static(AVATARS_PATH));

// Equipment photos - 200KB max
app.post('/equipments', equipmentsUpload.single('photo'), async (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 try {
  const originalPath = req.file.path;
  const compressedPath = originalPath.replace('.webp', '_compressed.webp');

  const compressed = await compressImageWithSizeLimit(
   originalPath,
   compressedPath,
   600, // maxWidth
   400, // maxHeight
   200000, // 200KB
   80 // startQuality
  );

  if (compressed && require('fs').existsSync(compressedPath)) {
   const stats = require('fs').statSync(compressedPath);
   const file = {
    filename: path.basename(compressedPath),
    url: `/equipments/${path.basename(compressedPath)}`,
   };
   return res.json({ file });
  } else {
   if (!require('fs').existsSync(originalPath)) {
    throw new Error('Original file was deleted and compression failed');
   }

   const file = {
    filename: req.file.filename,
    url: `/equipments/${req.file.filename}`,
   };
   return res.json({ file });
  }
 } catch (error) {
  console.error('Upload error:', error);
  res.status(500).json({ error: 'Upload failed' });
 }
});
app.use('/equipments', express.static(EQUIPMENTS_PATH));

app.post('/frontphotos', frontPhotoUpload.single('photo'), async (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 try {
  const originalPath = req.file.path;
  const compressedPath = originalPath.replace('.webp', '_compressed.webp');

  const compressed = await compressImageWithSizeLimit(
   originalPath,
   compressedPath,
   800, // maxWidth
   600, // maxHeight
   600000, // 600KB
   80 // startQuality
  );

  if (compressed && require('fs').existsSync(compressedPath)) {
   const stats = require('fs').statSync(compressedPath);
   const file = {
    filename: path.basename(compressedPath),
    url: `/frontphotos/${path.basename(compressedPath)}`,
   };
   return res.json({ file });
  } else {
   if (!require('fs').existsSync(originalPath)) {
    throw new Error('Original file was deleted and compression failed');
   }

   const file = {
    filename: req.file.filename,
    url: `/frontphotos/${req.file.filename}`,
   };
   return res.json({ file });
  }
 } catch (error) {
  console.error('Frontphoto upload error:', error);

  // Clean up files on error
  try {
   if (require('fs').existsSync(req.file.path)) {
    require('fs').unlinkSync(req.file.path);
   }
  } catch (cleanupError) {
   console.error('Cleanup error:', cleanupError);
  }

  return res.status(500).json({
   error: 'Upload failed',
   details: error.message,
  });
 }
});
app.use('/frontphotos', express.static(FRONTPHOTOS_PATH));

app.post('/signatures', signatureUpload.single('signature'), (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No signature file uploaded' });
 }

 const file = {
  filename: req.file.filename,
  url: `/signatures/${req.file.filename}`,
 };

 res.json({ file });
});
app.use('/signatures', express.static(SIGNATURES_PATH));

app.post('/identities', identityUpload.single('identity'), (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No identity file uploaded' });
 }

 const file = {
  filename: req.file.filename,
  url: `/identities/${req.file.filename}`,
 };

 res.json({ file });
});
app.use('/identities', express.static(IDENTITIES_PATH));

// require routes
const UserRouter = require('./routes/user');
const PropertyRouter = require('./routes/property');
const ReservationRouter = require('./routes/reservation');
const NearbyPlaceRouter = require('./routes/nearbyplace');
const EquipmentRouter = require('./routes/equipment');
const ReservationContractRouter = require('./routes/reservationcontract');
const PropertyRevenueRouter = require('./routes/propertyrevenue');
const PropertyTaskRouter = require('./routes/propertytask');
const NotificationRouter = require('./routes/notification');
const managerInvitationRoutes = require('./routes/managerinvitation');
const conciergeRoutes = require('./routes/concierge');
const ServiceWorkerRouter = require('./routes/serviceworker');
const icalRoutes = require('./routes/ical');

// Routes
// All of our routes will be prefixed with /api/v1/
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/properties', PropertyRouter);
app.use('/api/v1/reservations', ReservationRouter);
app.use('/api/v1/nearbyplaces', NearbyPlaceRouter);
app.use('/api/v1/equipments', EquipmentRouter);
app.use('/api/v1/reservationcontract', ReservationContractRouter);
app.use('/api/v1/propertyrevenue', PropertyRevenueRouter);
app.use('/api/v1/propertytask', PropertyTaskRouter);
app.use('/api/v1/notifications', NotificationRouter);
app.use('/api/v1/manager-invitations', managerInvitationRoutes);
app.use('/api/v1/concierges', conciergeRoutes);
app.use('/api/v1/serviceworkers', ServiceWorkerRouter);
app.use('/api/v1/icals', icalRoutes);

// Serve static files from the React app
const REACT_APP_PATH =
 process.env.REACT_APP_PATH || path.join(__dirname, 'client/build');
app.use(express.static(REACT_APP_PATH));

// Proxy route for handling cross-origin images
app.get('/proxy', async (req, res) => {
 const imageUrl = req.query.url;
 try {
  const response = await axios.get(imageUrl, { responseType: 'stream' });
  res.set('Content-Type', response.headers['content-type']);
  response.data.pipe(res);
 } catch (error) {
  console.error('Error fetching image:', error);
  res.status(500).send('Error fetching image');
 }
});

// Run once daily at midnight to purge expired invitations
cron.schedule('0 0 * * *', async () => {
 try {
  const count = await ManagerInvitation.purgeExpiredInvitations();
  console.log(`Daily maintenance: Purged ${count} expired manager invitations`);
 } catch (error) {
  console.error('Error purging expired invitations:', error);
 }
});

// Catch-all handler to serve index.html for any other routes
app.get('*', (req, res) => {
 res.sendFile(path.join(REACT_APP_PATH, 'index.html'));
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));

// require the connection (DB)
const db = require('./config/database');
// Testing the connection
db
 .authenticate()
 .then(() => {
  console.log('Connection has been established successfully.');
 })
 .catch((err) => {
  console.error('Unable to connect to the database:', err);
 });
