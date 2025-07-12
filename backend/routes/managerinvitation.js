const express = require('express');
const router = express.Router();
const {
 sendManagerInvitation,
 verifyManagerInvitation,
 acceptManagerInvitation,
 getPendingInvitations,
 resendInvitation,
 sendManagerInvitationDirect,
} = require('../controllers/ManagerInvitationController');
const requireAuth = require('../middleware/requireAuth');

// Protect routes that require authentication
router.post('/invite', requireAuth, sendManagerInvitation);
router.post('/invite-direct', sendManagerInvitationDirect);

router.get('/verify/:token', verifyManagerInvitation);
router.post('/accept/:token', acceptManagerInvitation);

router.get('/pending/:clientId', getPendingInvitations);
router.post('/resend/:invitationId', resendInvitation);

module.exports = router;
