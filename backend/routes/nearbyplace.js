const express = require('express');
const router = express.Router();
const {
 createNearbyPlace,
 updateNearbyPlace,
 getNearbyPlaces,
 getNearbyPlaceById,
 deleteNearbyPlace,
 getNearbyPlacesByPlaceLatLon,
 verifyNearbyPlace,
 bulkVerifyNearbyPlaces,
} = require('../controllers/NearbyPlaceController');

// Route to get all properties
router.get('/', getNearbyPlaces);

// Route for get a NearbyPlace by Latitude & Longitude
router.get('/nearby-places', getNearbyPlacesByPlaceLatLon);

// Route to get a NearbyPlace by Id
router.get('/:id', getNearbyPlaceById);
// Route for creating a new NearbyPlace
router.post('/', createNearbyPlace);
// Route for updating a NearbyPlace
router.put('/:id', updateNearbyPlace);
// Route for deleting a NearbyPlace
router.delete('/:id', deleteNearbyPlace);
// Route to verify a NearbyPlace
router.put('/:id/verify', verifyNearbyPlace);
// Route to bulk verify NearbyPlaces
router.post('/bulkVerify', bulkVerifyNearbyPlaces);

module.exports = router;
