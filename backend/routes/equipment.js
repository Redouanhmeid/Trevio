const express = require('express');
const router = express.Router();
const {
 createEquipment,
 updateEquipment,
 deleteEquipment,
 getEquipmentsForProperty,
 getEquipmentById,
} = require('../controllers/EquipmentController');

// Route to get all properties
router.get('/:propertyId', getEquipmentsForProperty);
// Route to get a property
router.get('/one/:id', getEquipmentById);
// Route for creating a new property
router.post('/', createEquipment);
// Route for updating a property
router.put('/:id', updateEquipment);
// Route for deleting a property
router.delete('/:id', deleteEquipment);

module.exports = router;
