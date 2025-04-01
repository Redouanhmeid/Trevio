const express = require('express');
const router = express.Router();
const {
 getPropertyServiceWorkers,
 getGuestVisibleServiceWorkers,
 getServiceWorker,
 createServiceWorker,
 updateServiceWorker,
 deleteServiceWorker,
 bulkCreateServiceWorkers,
} = require('../controllers/ServiceWorkerController');

// Get all service workers for a property (admin/owner access)
router.get('/property/:propertyId', getPropertyServiceWorkers);

// Get guest-visible service workers for a property
router.get('/property/:propertyId/guest', getGuestVisibleServiceWorkers);

// Get a single service worker
router.get('/:id', getServiceWorker);

// Create a new service worker
router.post('/', createServiceWorker);

// Bulk create service workers
router.post('/bulk', bulkCreateServiceWorkers);

// Update a service worker
router.put('/:id', updateServiceWorker);

// Delete a service worker
router.delete('/:id', deleteServiceWorker);

module.exports = router;
