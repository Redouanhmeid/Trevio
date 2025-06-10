const express = require('express');
const router = express.Router();
const {
 createContract,
 updateContract,
 deleteContract,
 getContractsForProperty,
 getContractById,
 getContractByReservationId,
 getContractByHash,
 updateContractStatus,
 checkAvailability,
 getContractDetails,
 getContractDetailsByReservationId,
} = require('../controllers/ReservationContractController');

// Basic CRUD routes
router.post('/contracts', createContract);
router.get('/properties/:propertyId', getContractsForProperty);
router.get('/contracts/:id', getContractById);
// Get contract by reservation ID
router.get('/reservation/:reservationId/contract', getContractByReservationId);
router.get('/contracts/hash/:hashId', getContractByHash);
router.put('/contracts/:id', updateContract);
router.delete('/contracts/:id', deleteContract);

// Special routes
router.patch('/contracts/:id/status', updateContractStatus);
router.get('/properties/:propertyId/availability', checkAvailability);

// Get detailed contract information by contract ID
router.get('/contract/:contractId/details', getContractDetails);
// Get detailed contract information by reservation ID
router.get(
 '/reservation/:reservationId/details',
 getContractDetailsByReservationId
);

module.exports = router;
