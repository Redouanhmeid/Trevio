const express = require('express');
const router = express.Router();
const {
 getProperties,
 getPendingProperties,
 getProperty,
 getAvailablePropertiesForAssignment,
 getPropertiesByClientId,
 createProperty,
 updateProperty,
 deleteProperty,
 getPropertiesByPlaceLatLon,
 updatePropertyBasicInfo,
 updatePropertyEquipements,
 updatePropertyCapacity,
 updatePropertyRules,
 updatePropertyCheckIn,
 updatePropertyCheckOut,
 updatePropertyPhotos,
 verifyProperty,
 bulkVerifyProperties,
 toggleEnableProperty,
 getIdFromHash,
 updatePropertyICalLinks,
 getPropertyForChatbot,
} = require('../controllers/PropertyController');

// Route to get all properties
router.get('/', getProperties);
// Route to get all pending properties
router.get('/pending', getPendingProperties); // Admin-only route
// Route for get Properties by Latitude & Longitude
router.get('/properties', getPropertiesByPlaceLatLon);
// Route to get a property
router.get('/:id', getProperty);
// Route to get available properties for assignment
router.get('/available/:clientId', getAvailablePropertiesForAssignment);
// Route to get a property by userId
router.get('/byclient/:clientId', getPropertiesByClientId);
// Route for creating a new property
router.post('/', createProperty);
// Route for updating a property
router.put('/:id', updateProperty);
// Routes for specific property updates
router.put('/:id/basic-info', updatePropertyBasicInfo);
router.put('/:id/equipements', updatePropertyEquipements);
router.put('/:id/capacity', updatePropertyCapacity);
router.put('/:id/rules', updatePropertyRules);
router.put('/:id/check-in', updatePropertyCheckIn);
router.put('/:id/check-out', updatePropertyCheckOut);
router.put('/:id/photos', updatePropertyPhotos);
// Route for deleting a property
router.delete('/:id', deleteProperty);

router.put('/:id/verify', verifyProperty);
router.post('/bulkVerify', bulkVerifyProperties);
router.put('/:id/toggleenable', toggleEnableProperty);

router.get('/hash/:hashId', getIdFromHash);

router.put('/:id/ical-links', updatePropertyICalLinks);

// Use /proprietes instead of /properties to match the French API spec
router.get('/proprietes/:propertyId', getPropertyForChatbot);

module.exports = router;
