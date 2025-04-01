const { ServiceWorker, Property } = require('../models');

// Get all service workers for a property
const getPropertyServiceWorkers = async (req, res) => {
 try {
  const { propertyId } = req.params;

  // Verify property exists
  const property = await Property.findByPk(propertyId);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Get all service workers for the property
  const serviceWorkers = await ServiceWorker.findByProperty(propertyId);
  res.status(200).json(serviceWorkers);
 } catch (error) {
  console.error('Error fetching service workers:', error);
  res.status(500).json({ error: 'Failed to fetch service workers' });
 }
};

// Get service workers for guests (only the ones marked as visible to guests)
const getGuestVisibleServiceWorkers = async (req, res) => {
 try {
  const { propertyId } = req.params;

  // Verify property exists
  const property = await Property.findByPk(propertyId);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Get only service workers that are visible to guests
  const serviceWorkers = await ServiceWorker.findAll({
   where: {
    propertyId,
    isVisibleToGuests: true,
   },
   order: [['category', 'ASC']],
  });

  res.status(200).json(serviceWorkers);
 } catch (error) {
  console.error('Error fetching guest-visible service workers:', error);
  res.status(500).json({ error: 'Failed to fetch service workers' });
 }
};

// Get a single service worker by ID
const getServiceWorker = async (req, res) => {
 try {
  const { id } = req.params;
  const serviceWorker = await ServiceWorker.findWorkerById(id);

  if (!serviceWorker) {
   return res.status(404).json({ error: 'Service worker not found' });
  }

  res.status(200).json(serviceWorker);
 } catch (error) {
  console.error('Error fetching service worker:', error);
  res.status(500).json({ error: 'Failed to fetch service worker' });
 }
};

// Create a new service worker
const createServiceWorker = async (req, res) => {
 try {
  const workerData = req.body;

  // Verify property exists
  const property = await Property.findByPk(workerData.propertyId);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  const serviceWorker = await ServiceWorker.createWorker(workerData);
  res.status(201).json(serviceWorker);
 } catch (error) {
  console.error('Error creating service worker:', error);
  res.status(500).json({ error: 'Failed to create service worker' });
 }
};

// Update a service worker
const updateServiceWorker = async (req, res) => {
 try {
  const { id } = req.params;
  const workerData = req.body;

  const serviceWorker = await ServiceWorker.findWorkerById(id);
  if (!serviceWorker) {
   return res.status(404).json({ error: 'Service worker not found' });
  }

  await serviceWorker.update(workerData);
  res.status(200).json(serviceWorker);
 } catch (error) {
  console.error('Error updating service worker:', error);
  res.status(500).json({ error: 'Failed to update service worker' });
 }
};

// Delete a service worker
const deleteServiceWorker = async (req, res) => {
 try {
  const { id } = req.params;

  const serviceWorker = await ServiceWorker.findWorkerById(id);
  if (!serviceWorker) {
   return res.status(404).json({ error: 'Service worker not found' });
  }

  await serviceWorker.destroy();
  res.status(200).json({ message: 'Service worker deleted successfully' });
 } catch (error) {
  console.error('Error deleting service worker:', error);
  res.status(500).json({ error: 'Failed to delete service worker' });
 }
};

// Bulk create service workers
const bulkCreateServiceWorkers = async (req, res) => {
 try {
  const { propertyId, workers } = req.body;

  // Verify property exists
  const property = await Property.findByPk(propertyId);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Add propertyId to each worker object
  const workersWithPropertyId = workers.map((worker) => ({
   ...worker,
   propertyId,
  }));

  const createdWorkers = await ServiceWorker.bulkCreate(workersWithPropertyId);
  res.status(201).json(createdWorkers);
 } catch (error) {
  console.error('Error bulk creating service workers:', error);
  res.status(500).json({ error: 'Failed to create service workers' });
 }
};

module.exports = {
 getPropertyServiceWorkers,
 getGuestVisibleServiceWorkers,
 getServiceWorker,
 createServiceWorker,
 updateServiceWorker,
 deleteServiceWorker,
 bulkCreateServiceWorkers,
};
