// routes/propertyRevenue.js
const express = require('express');
const router = express.Router();
const {
 addRevenue,
 updateRevenue,
 getPropertyRevenue,
 getAnnualRevenue,
 deleteRevenue,
 createRevenueFromReservation,
} = require('../controllers/PropertyRevenueController');

// Basic revenue CRUD operations
router.post('/revenue', addRevenue);
router.put('/revenue/:id', updateRevenue);
router.get('/property/:propertyId/revenue', getPropertyRevenue);
router.get('/property/:propertyId/annual-revenue/:year', getAnnualRevenue);
router.delete('/revenue/:id', deleteRevenue);
router.post(
 '/reservation/:reservationId/revenue',
 createRevenueFromReservation
);

module.exports = router;
