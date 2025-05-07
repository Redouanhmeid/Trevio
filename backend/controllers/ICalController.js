const { Property, Reservation } = require('../models');
const axios = require('axios');
const ical = require('node-ical');

const syncPropertyICalReservations = async (req, res) => {
 const { propertyId } = req.params;

 try {
  const property = await Property.findByPk(propertyId);

  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Parse iCal links
  let iCalLinks = [];
  if (property.iCalLinks) {
   try {
    iCalLinks =
     typeof property.iCalLinks === 'string'
      ? JSON.parse(property.iCalLinks)
      : property.iCalLinks;
   } catch (e) {
    console.error('Error parsing iCal links:', e);
   }
  }

  if (!Array.isArray(iCalLinks) || iCalLinks.length === 0) {
   return res
    .status(200)
    .json({ message: 'No iCal links found for this property' });
  }

  // Process each iCal link
  const results = await Promise.allSettled(
   iCalLinks.map(async (link) => {
    const response = await axios.get(link.url);
    const events = ical.parseICS(response.data);

    // Process and create/update reservations from events
    // This part would depend on your specific implementation
    // and how you map iCal events to your reservation schema
   })
  );

  res.status(200).json({
   message: 'iCal synchronization completed',
   results: {
    successful: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
    total: iCalLinks.length,
   },
  });
 } catch (error) {
  console.error('Error syncing iCal reservations:', error);
  res.status(500).json({
   error: 'Failed to sync iCal reservations',
   details: error.message,
  });
 }
};

const fetchICalContent = async (req, res) => {
 try {
  const { url } = req.body;

  // Validate the URL if needed
  if (!url) {
   return res.status(400).json({ error: 'URL is required' });
  }

  // Fetch the iCal content
  const response = await axios.get(url, {
   headers: {
    'User-Agent': 'Trevio Reservation Sync',
    Accept: 'text/calendar',
   },
   timeout: 10000, // 10 seconds timeout
  });

  // Return the iCal content
  res.status(200).send(response.data);
 } catch (error) {
  console.error('Error fetching iCal:', error);
  res.status(500).json({
   error: 'Failed to fetch iCal',
   details: error.message,
  });
 }
};

module.exports = {
 syncPropertyICalReservations,
 fetchICalContent,
};
