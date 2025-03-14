const express = require('express');
const router = express.Router();
const {
 sendManagerInvitation,
 verifyManagerInvitation,
 acceptManagerInvitation,
} = require('../controllers/ManagerInvitationController');
const requireAuth = require('../middleware/requireAuth');

// Protect routes that require authentication
router.post('/invite', requireAuth, sendManagerInvitation);
router.get('/verify/:token', verifyManagerInvitation);
router.post('/accept/:token', acceptManagerInvitation);

module.exports = router;
