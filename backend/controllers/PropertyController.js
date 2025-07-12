const haversine = require('haversine-distance');
const {
 Property,
 Equipment,
 UserProperty,
 ServiceWorker,
} = require('../models');
const { deletePropertyFiles } = require('../helpers/utils');
const { Sequelize, Op } = require('sequelize');

// find one Property
const getProperty = async (req, res) => {
 Property.findOne({ where: { id: req.params.id } }).then((property) => {
  res.json(property);
 });
};
// Add this function to PropertyController.js

const getAvailablePropertiesForAssignment = async (req, res) => {
 const { clientId } = req.params;

 try {
  // First, get all properties for this client
  const clientProperties = await Property.findAll({
   where: {
    clientId: clientId,
    status: 'enable', // Only get enabled properties
   },
  });

  if (!clientProperties || clientProperties.length === 0) {
   return res.status(200).json([]);
  }

  // Find all properties that are already assigned to concierges with active status
  const assignedProperties = await UserProperty.findAll({
   where: {
    clientId: clientId,
    status: 'active',
   },
   attributes: ['propertyId'],
  });

  // Extract just the property IDs
  const assignedPropertyIds = assignedProperties.map(
   (assignment) => assignment.propertyId
  );

  // Filter out properties that are already assigned
  const availableProperties = clientProperties.filter(
   (property) => !assignedPropertyIds.includes(property.id)
  );

  return res.status(200).json(availableProperties);
 } catch (error) {
  console.error('Error fetching available properties:', error);
  return res.status(500).json({
   error: 'Failed to fetch available properties',
   details: error.message,
  });
 }
};
// find Property by userId
const getPropertiesByClientId = async (req, res) => {
 const clientId = req.params.clientId; // Assuming id is passed in the URL params
 Property.findAll({ where: { clientId } }).then((properties) => {
  res.json(properties);
 });
};
// find all Properties
const getProperties = async (req, res) => {
 try {
  const properties = await Property.findAll({
   where: {
    status: 'enable', // Filters properties with status 'enable'
   },
  });
  res.json(properties); // Send the filtered properties as the response
 } catch (error) {
  console.error('Error fetching properties:', error);
  res.status(500).json({ error: 'Failed to fetch properties' });
 }
};
// find all Pending Properties
const getPendingProperties = async (req, res) => {
 try {
  // Find all properties with a status of 'pending'
  const pendingProperties = await Property.findAll({
   where: { status: 'pending' },
  });

  res.status(200).json(pendingProperties);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to retrieve pending properties' });
 }
};
const createProperty = async (req, res) => {
 try {
  const propertyData = req.body;
  const property = await Property.createProperty(propertyData);
  res.status(201).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to create property' });
 }
};

const updateProperty = async (req, res) => {
 try {
  const { id } = req.params;
  const propertyData = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update(propertyData);

  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property' });
 }
};

const deleteProperty = async (req, res) => {
 try {
  const { id } = req.params;

  const equipments = await Equipment.findAll({
   where: { propertyId: id },
  });
  const property = await Property.findByPk(id);

  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Add the equipements to the property object
  property.Equipments = equipments;

  // Delete all associated files first
  try {
   await deletePropertyFiles(property);
  } catch (fileError) {
   console.error('Error deleting property files:', fileError);
   // Continue with property deletion even if some files fail to delete
  }

  // Delete the property from database

  await property.destroy();

  res.status(200).json({ message: 'Property deleted successfully' });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to delete property' });
 }
};

const getPropertiesbyLatLon = async (propertyLat, propertyLon) => {
 const RADIUS = 120000; // Radius in meters (120 kilometers)
 // Parse latitude and longitude as floats
 const lat = parseFloat(propertyLat);
 const lon = parseFloat(propertyLon);
 // Get all places
 let places;
 try {
  // Find properties with absolute difference in latitude and longitude
  const places = await Property.findAll({
   where: {
    status: 'enable',
   },
   order: [
    // Order by the combined absolute difference of latitude and longitude
    Sequelize.literal(`ABS(latitude - ${lat}) + ABS(longitude - ${lon})`),
   ],
  });

  return places;
 } catch (error) {
  console.error('Error fetching places:', error); // Log any errors
  return [];
 }

 // Calculate distance for each place and add it to the place object
 const placesWithDistance = places.map((place) => {
  const placeCoords = { latitude: place.latitude, longitude: place.longitude };
  const propertyCoords = { latitude: lat, longitude: lon };
  const distance = haversine(placeCoords, propertyCoords);
  return { ...place.toJSON(), distance };
 });

 // Sort places by distance
 const sortedPlaces = placesWithDistance.sort(
  (a, b) => a.distance - b.distance
 );

 // Filter places within 10km radius
 const properties = sortedPlaces.filter((place) => place.distance <= RADIUS);

 return properties;
};

const getPropertiesByPlaceLatLon = async (req, res) => {
 const { latitude, longitude, limit } = req.query;

 if (!latitude || !longitude) {
  return res.status(400).json({ error: 'Latitude and longitude are required' });
 }

 try {
  // Use provided limit or default to 10 properties
  const searchLimit = limit ? parseInt(limit) : 50;
  const properties = await getPropertiesbyLatLon(
   latitude,
   longitude,
   searchLimit
  );

  if (properties.length === 0) {
   return res.status(500).json({ error: 'No properties found' });
  }

  res.json(properties);
 } catch (error) {
  res.status(500).json({ error: 'Something went wrong' });
 }
};

const updatePropertyBasicInfo = async (req, res) => {
 try {
  const { id } = req.params;
  const {
   name,
   description,
   type,
   airbnbUrl,
   bookingUrl,
   latitude,
   longitude,
   placeName,
   price,
   capacity,
   rooms,
   beds,
   frontPhoto,
  } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({
   name,
   description,
   type,
   airbnbUrl,
   bookingUrl,
   latitude,
   longitude,
   placeName,
   price,
   capacity,
   rooms,
   beds,
   frontPhoto,
  });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property basic info' });
 }
};

const updatePropertyEquipements = async (req, res) => {
 try {
  const { id } = req.params;
  const { basicEquipements } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({ basicEquipements });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property equipements' });
 }
};

const updatePropertyCapacity = async (req, res) => {
 try {
  const { id } = req.params;
  const { price, capacity, rooms, beds } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({ price, capacity, rooms, beds });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property capacity' });
 }
};

const updatePropertyRules = async (req, res) => {
 try {
  const { id } = req.params;
  const { houseRules } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({ houseRules });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property rules' });
 }
};

const updatePropertyCheckIn = async (req, res) => {
 try {
  const { id } = req.params;
  const {
   checkInTime,
   earlyCheckIn,
   frontPhoto,
   accessToProperty,
   guestAccessInfo,
   videoCheckIn,
  } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({
   checkInTime,
   earlyCheckIn,
   frontPhoto,
   accessToProperty,
   guestAccessInfo,
   videoCheckIn,
  });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property check-in info' });
 }
};

const updatePropertyCheckOut = async (req, res) => {
 try {
  const { id } = req.params;
  const {
   checkOutTime,
   lateCheckOutPolicy,
   beforeCheckOut,
   additionalCheckOutInfo,
  } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({
   checkOutTime,
   lateCheckOutPolicy,
   beforeCheckOut,
   additionalCheckOutInfo,
  });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property check-out info' });
 }
};

const updatePropertyPhotos = async (req, res) => {
 try {
  const { id } = req.params;
  const { photos } = req.body;
  const property = await Property.findByPk(id);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }
  await property.update({ photos });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property photos' });
 }
};

const verifyProperty = async (req, res) => {
 try {
  const { id } = req.params;
  const property = await Property.findByPk(id);

  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Ensure only `pending` properties can be verified
  if (property.status !== 'pending') {
   return res.status(400).json({ error: 'Property is not in pending status' });
  }

  // Set the property status to `verified`
  await property.update({ status: 'enable' });
  res.status(200).json({ message: 'Property enabled successfully', property });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to enabled property' });
 }
};

const bulkVerifyProperties = async (req, res) => {
 try {
  const { ids } = req.body; // Expecting an array of property IDs

  if (!Array.isArray(ids) || ids.length === 0) {
   return res.status(400).json({ error: 'Invalid or missing property IDs' });
  }

  const properties = await Property.findAll({
   where: {
    id: ids,
   },
  });

  if (properties.length === 0) {
   return res
    .status(404)
    .json({ error: 'No properties found for the given IDs' });
  }

  const results = await Promise.all(
   properties.map(async (property) => {
    if (property.status === 'pending') {
     await property.update({ status: 'enable' });
     return { id: property.id, status: 'success' };
    }
    return {
     id: property.id,
     status: 'failed',
     reason: 'Not in pending status',
    };
   })
  );

  const successfulUpdates = results.filter(
   (result) => result.status === 'success'
  );
  const failedUpdates = results.filter((result) => result.status === 'failed');

  res.status(200).json({
   message: 'Bulk verification process completed',
   successful: successfulUpdates,
   failed: failedUpdates,
  });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to bulk verify properties' });
 }
};

const toggleEnableProperty = async (req, res) => {
 try {
  const { id } = req.params;
  const property = await Property.findByPk(id);

  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Toggle between `enable` and `disable`
  const newStatus = property.status === 'enable' ? 'disable' : 'enable';
  await property.update({ status: newStatus });
  res
   .status(200)
   .json({ message: `Property ${newStatus} successfully`, property });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property status' });
 }
};

const getIdFromHash = async (req, res) => {
 if (!req || !res) {
  console.error('Request or response object is undefined');
  return;
 }

 try {
  const { hashId } = req.params;

  if (!hashId) {
   return res.status(400).json({ error: 'HashId is required' });
  }

  const property = await Property.findOne({
   where: { hashId },
   attributes: ['id'],
  });

  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  return res.status(200).json({ id: property.id });
 } catch (error) {
  console.error('Error in getIdFromHash:', error);
  return res.status(500).json({ error: error.message });
 }
};

const updatePropertyICalLinks = async (req, res) => {
 try {
  const { id } = req.params;
  const { iCalLinks } = req.body;
  const property = await Property.findByPk(id);

  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  await property.update({ iCalLinks });
  res.status(200).json(property);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update property iCal links' });
 }
};

// GET /api/proprietes/:propertyId (for chatbot)
const getPropertyForChatbot = async (req, res) => {
 try {
  const { propertyId } = req.params;

  // Fetch property details first
  const property = await Property.findByPk(propertyId);

  if (!property) {
   return res.status(404).json({
    status: 'error',
    message: 'Property not found',
   });
  }

  // Fetch equipments separately to avoid association issues
  const equipments = await Equipment.findAll({
   where: { propertyId },
   attributes: ['id', 'name', 'description', 'wifiName', 'wifiPassword'],
  });

  // Fetch guest-visible service workers separately
  const serviceWorkers = await ServiceWorker.findAll({
   where: {
    propertyId,
    isVisibleToGuests: true,
   },
   attributes: ['id', 'name', 'category', 'phone', 'email'],
  });

  // Parse JSON fields if they are strings
  const parseJsonField = (field) => {
   if (typeof field === 'string') {
    try {
     return JSON.parse(field);
    } catch (e) {
     return field;
    }
   }
   return field;
  };

  // Prepare response with all relevant information for chatbot
  const propertyData = {
   id: property.id,
   name: property.name,
   description: property.description,
   type: property.type,
   placeName: property.placeName,
   price: property.price,
   capacity: property.capacity,
   rooms: property.rooms,
   beds: property.beds,

   // Check-in information
   checkIn: {
    time: property.checkInTime,
    earlyCheckIn: parseJsonField(property.earlyCheckIn),
    accessToProperty: parseJsonField(property.accessToProperty),
    guestAccessInfo: property.guestAccessInfo,
    videoCheckIn: property.videoCheckIn,
   },

   // Check-out information
   checkOut: {
    time: property.checkOutTime,
    lateCheckOutPolicy: parseJsonField(property.lateCheckOutPolicy),
    beforeCheckOut: parseJsonField(property.beforeCheckOut),
    additionalCheckOutInfo: property.additionalCheckOutInfo,
   },

   // House rules and amenities
   houseRules: parseJsonField(property.houseRules),
   basicEquipements: parseJsonField(property.basicEquipements),

   // Equipment details
   equipments: equipments || [],

   // Service workers (guest-visible only)
   serviceWorkers: serviceWorkers || [],

   // Photos
   photos: parseJsonField(property.photos),
   frontPhoto: property.frontPhoto,
  };

  res.status(200).json({
   status: 'success',
   propriete: propertyData,
  });
 } catch (error) {
  console.error('Error in getPropertyForChatbot:', error);
  res.status(500).json({
   status: 'error',
   message: 'Failed to retrieve property details',
   details: error.message,
  });
 }
};

module.exports = {
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
};
