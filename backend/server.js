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
  'https://conciergestay.pro',
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
   const ext = path.extname(file.originalname);
   const name = path.basename(file.originalname, ext);
   const newName = `${name.replace(/\s+/g, '-')}-${counter}${ext}`;
   counter++;
   cb(null, newName);
  },
 });

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
 const filetypes = /jpeg|jpg|png|gif|webp/;
 const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
 const mimetype = filetypes.test(file.mimetype);

 if (mimetype && extname) {
  return cb(null, true);
 } else {
  cb('Error: Images only!');
 }
}

// Handle file upload
app.post('/upload', upload.array('photos', 16), (req, res) => {
 const files = req.files.map((file) => ({
  filename: file.filename,
  url: `/uploads/${file.filename}`,
 }));

 res.json({ files: files });
});
app.use('/uploads', express.static(UPLOADS_PATH));

// Handle file upload for a single photo
app.post('/places', singleUpload.single('photo'), (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 const file = {
  filename: req.file.filename,
  url: `/places/${req.file.filename}`,
 };

 res.json({ file: file });
});
app.use('/places', express.static(PLACES_PATH));

// Handle file upload for avatars
app.post('/avatars', avatars.single('avatar'), (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 const file = {
  filename: req.file.filename,
  url: `/avatars/${req.file.filename}`,
 };

 res.json({ file: file });
});

app.use('/avatars', express.static(AVATARS_PATH));

app.post('/equipments', equipmentsUpload.single('photo'), (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 const file = {
  filename: req.file.filename,
  url: `/equipments/${req.file.filename}`,
 };

 res.json({ file: file });
});

app.use('/equipments', express.static(EQUIPMENTS_PATH));

app.post('/frontphotos', frontPhotoUpload.single('photo'), (req, res) => {
 if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
 }

 const file = {
  filename: req.file.filename,
  url: `/frontphotos/${req.file.filename}`,
 };

 res.json({ file: file });
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
