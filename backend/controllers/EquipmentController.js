const { Equipment } = require('../models');
const { deleteEquipmentFiles } = require('../helpers/utils');

// Create a new equipement
const createEquipment = async (req, res) => {
 try {
  const equipementData = req.body;
  const equipement = await Equipment.createEquipment(equipementData);
  res.status(201).json(equipement);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to create property' });
 }
};

// Update an existing equipement
const updateEquipment = async (req, res) => {
 const { id } = req.params;
 const updatedData = req.body;

 try {
  const equipement = await Equipment.findByPk(id);
  if (!equipement) {
   return res.status(404).json({ error: 'Equipment not found' });
  }
  await equipement.update(updatedData);
  res.status(200).json(equipement);
 } catch (error) {
  console.error('Error updating equipement:', error);
  res.status(500).json({ error: 'Failed to update equipement' });
 }
};

// Delete an existing equipement
const deleteEquipment = async (req, res) => {
 try {
  const { id } = req.params;
  const equipement = await Equipment.findByPk(id);

  if (!equipement) {
   return res.status(404).json({ error: 'Equipment not found' });
  }

  // Delete associated files first
  try {
   await deleteEquipmentFiles(equipement);
  } catch (fileError) {
   console.error('Error deleting equipement files:', fileError);
   // Continue with equipement deletion even if some files fail to delete
  }

  // Then delete the equipement record
  await equipement.destroy();

  res.status(200).json({ message: 'Equipment deleted successfully' });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to delete equipement' });
 }
};

// Get all equipements for a property
const getEquipmentsForProperty = async (req, res) => {
 const { propertyId } = req.params;
 try {
  const equipements = await Equipment.findAll({ where: { propertyId } });
  res.status(200).json(equipements);
 } catch (error) {
  console.error('Error getting equipements:', error);
  res
   .status(500)
   .json({ error: 'Failed to get equipements', details: error.message });
 }
};

const getEquipmentById = async (req, res) => {
 const { id } = req.params;
 try {
  const equipement = await Equipment.findByPk(id);
  if (!equipement) {
   throw new Error('Equipment not found');
  }
  if (equipement) {
   res.json(equipement);
  } else {
   res.status(404).json('No equipement found');
  }
 } catch (error) {
  res
   .status(500)
   .json({ error: 'Error getting equipement by ID', details: error.message });
 }
};

module.exports = {
 createEquipment,
 updateEquipment,
 deleteEquipment,
 getEquipmentsForProperty,
 getEquipmentById,
};
