const express = require('express');
const router = express.Router();
const {
 getReservation,
 getReservations,
 getReservationsByProperty,
 createReservation,
 sendToGuest,
 getReservationContract,
 updateReservationStatus,
 deleteReservation,
 getReservationByHash,
 getClientReservations,
 getConciergeReservations,
 generateRevenue,
 generateContract,
} = require('../controllers/ReservationController');

// Get all reservations
router.get('/', getReservations);

// Get single reservation
router.get('/:id', getReservation);

// Get reservations by property
router.get('/property/:propertyId', getReservationsByProperty);

// Create new reservation
router.post('/', createReservation);

// Generate contract for reservation
router.post('/:id/generate-revenue', generateRevenue);

// Get contract for reservation
router.get('/:id/contract', getReservationContract);

// Send reservation to guest
router.post('/:id/send', sendToGuest);

// Update reservation status
router.put('/:id/status', updateReservationStatus);

// Delete reservation
router.delete('/:id', deleteReservation);

router.get('/hash/:hashId', getReservationByHash);

// Get reservations for properties owned by a client
router.get('/client/:clientId', getClientReservations);

// Get reservations for properties assigned to a concierge
router.get('/concierge/:conciergeId', getConciergeReservations);

// Generate contract for reservation
router.post('/:id/generate-contract', generateContract);

module.exports = router;
