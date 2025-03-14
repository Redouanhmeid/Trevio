const express = require('express');
const router = express.Router();
const {
 getClientConcierges,
 assignConcierge,
 removeConcierge,
 updateAssignmentStatus,
 getConciergeDetails,
 getConciergeProperties,
} = require('../controllers/ConciergeController');

// Get concierges for a client
router.get('/client/:clientId', getClientConcierges);

// Assign concierge to property
router.post('/assign', assignConcierge);

// Remove concierge assignment
router.delete('/unassign', removeConcierge);

// Update assignment status
router.patch('/status/:assignmentId', updateAssignmentStatus);

// Get concierge details
router.get('/:conciergeId', getConciergeDetails);

// Get properties managed by concierge
router.get('/:conciergeId/properties', getConciergeProperties);

module.exports = router;
