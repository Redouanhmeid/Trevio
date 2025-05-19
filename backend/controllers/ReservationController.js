const { Op } = require('sequelize');
const {
 Reservation,
 User,
 Property,
 ReservationContract,
 UserProperty,
} = require('../models');
const jwt = require('jsonwebtoken');

// Get single reservation
const getReservation = async (req, res) => {
 try {
  const reservation = await Reservation.findOne({
   where: { id: req.params.id },
   include: [
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
    {
     model: Property,
     attributes: ['id', 'name', 'hashId'],
    },
   ],
  });

  if (!reservation) {
   return res.status(404).json({ message: 'Reservation not found' });
  }

  res.json(reservation);
 } catch (error) {
  console.error('Error fetching reservation:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Get all reservations
const getReservations = async (req, res) => {
 try {
  const reservations = await Reservation.findAll({
   include: [
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
    {
     model: Property,
     attributes: ['id', 'name', 'hashId'],
    },
   ],
  });
  res.json(reservations);
 } catch (error) {
  console.error('Error fetching reservations:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Get reservations by property
const getReservationsByProperty = async (req, res) => {
 try {
  const reservations = await Reservation.findAll({
   where: { propertyId: req.params.propertyId },
   include: [
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
  });
  res.json(reservations);
 } catch (error) {
  console.error('Error fetching property reservations:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Generate a hash ID for the reservation
const generateHashId = () => {
 const crypto = require('crypto');
 const secret = process.env.HASH_SECRET || 'your-secret-key';
 const text = `${Date.now()}-${Math.random()}-${secret}`;
 return crypto.createHash('sha256').update(text).digest('hex').substring(0, 12);
};

// Create a new reservation
const createReservation = async (req, res) => {
 try {
  const {
   propertyId,
   startDate,
   endDate,
   totalPrice,
   bookingSource,
   createdByUserId,
   electronicLockCode,
   electronicLockEnabled,
   calendarEventUID,
  } = req.body;

  // Get the user ID either from req.user (if authenticated) or from the request body
  const userId = req.user?.id || createdByUserId;

  // Check if we have a user ID
  if (!userId) {
   return res.status(400).json({
    error:
     'User ID is required. Please provide createdByUserId in the request body or login properly.',
   });
  }

  // Check if the property exists
  const property = await Property.findByPk(propertyId);
  if (!property) {
   return res.status(404).json({ error: 'Property not found' });
  }

  // Check if the property is available for the selected dates
  const { available, conflictingReservations } =
   await Reservation.checkAvailability(propertyId, startDate, endDate);

  if (!available) {
   return res.status(400).json({
    error: 'Selected dates are not available',
    conflictingReservations,
   });
  }

  const hashId = generateHashId();

  // Create the reservation
  const reservation = await Reservation.create({
   propertyId,
   createdByUserId: userId,
   startDate,
   endDate,
   totalPrice,
   bookingSource,
   status: 'draft',
   hashId: hashId,
   electronicLockCode,
   electronicLockEnabled: electronicLockEnabled || false,
   calendarEventUID,
  });

  // Include the property in the response
  const reservationWithProperty = await Reservation.findByPk(reservation.id, {
   include: [{ model: Property }],
  });

  res.status(201).json(reservationWithProperty);
 } catch (error) {
  console.error('Error creating reservation:', error);
  res.status(500).json({ error: 'Failed to create reservation' });
 }
};

// Send reservation to guest
const sendToGuest = async (req, res) => {
 try {
  const { id } = req.params;
  const reservation = await Reservation.findByPk(id, {
   include: [
    {
     model: Property,
     attributes: ['id', 'name', 'hashId'],
    },
   ],
  });

  if (!reservation) {
   return res.status(404).json({ error: 'Reservation not found' });
  }

  // First check availability before sending to guest
  const { available, conflictingReservations } =
   await Reservation.checkAvailability(
    reservation.propertyId,
    reservation.startDate,
    reservation.endDate,
    reservation.id
   );

  if (!available) {
   return res.status(400).json({
    error:
     'Cannot send to guest due to date conflict with existing reservations',
    conflictingReservations,
   });
  }

  // Find the associated contract
  const contract = await ReservationContract.findOne({
   where: { reservationId: id },
  });

  if (!contract) {
   return res
    .status(404)
    .json({ error: 'Contract not found. Please generate a contract first.' });
  }

  // Current date as placeholder for birthDate
  const placeholderDate = new Date();

  // Set temporary placeholder values for required fields
  const placeholderUpdates = {
   firstname: 'Guest',
   lastname: 'User',
   birthDate: placeholderDate, // Add birthDate placeholder
   sex: 'MALE', // Add sex placeholder
   nationality: 'Pending', // Add nationality placeholder
   email: 'pending@example.com',
   phone: 'N/A',
   residenceCountry: 'Pending',
   residenceCity: 'Pending',
   residenceAddress: 'Pending',
   residencePostalCode: '00000',
   documentType: 'PASSPORT', // Add document type placeholder
   documentNumber: 'PENDING', // Add document number placeholder
   documentIssueDate: placeholderDate, // Add document issue date placeholder
   status: 'SENT',
  };

  // Update contract with placeholder data
  await contract.update(placeholderUpdates);

  // Update reservation status
  await reservation.update({ status: 'sent' });

  // Generate a public URL for the contract form
  const contractFormUrl = `${process.env.FRONTEND_URL}/guest/contract/${contract.hashId}`;

  res.status(200).json({
   message: 'Reservation sent to guest successfully',
   contractFormUrl,
  });
 } catch (error) {
  console.error('Error sending reservation to guest:', error);
  res
   .status(500)
   .json({ error: 'Failed to send reservation to guest: ' + error.message });
 }
};

const generateRevenue = async (req, res) => {
 try {
  const { id } = req.params;
  const { amount, notes, createdBy } = req.body;

  // Verify reservation exists
  const reservation = await Reservation.findByPk(id);
  if (!reservation) {
   return res.status(404).json({ error: 'Reservation not found' });
  }

  // Check if revenue already exists for this reservation
  const existingRevenue = await PropertyRevenue.findOne({
   where: { reservationId: id },
  });

  if (existingRevenue) {
   return res.status(400).json({
    error: 'Revenue already exists for this reservation',
    revenue: existingRevenue,
   });
  }

  // Create revenue entry with reservation dates
  const revenue = await PropertyRevenue.create({
   propertyId: reservation.propertyId,
   reservationId: id,
   amount,
   startDate: reservation.startDate,
   endDate: reservation.endDate,
   notes: notes || `Revenue from reservation #${id}`,
   createdBy: createdBy || reservation.createdByUserId,
  });

  res.status(201).json(revenue);
 } catch (error) {
  console.error('Error generating revenue:', error);
  res
   .status(500)
   .json({ error: 'Failed to generate revenue', details: error.message });
 }
};

// Update reservation
const updateReservation = async (req, res) => {
 try {
  const { id } = req.params;
  const { totalPrice } = req.body;

  const reservation = await Reservation.findByPk(id);

  if (!reservation) {
   return res.status(404).json({ message: 'Reservation not found' });
  }

  // Update only the fields provided in the request body
  if (totalPrice !== undefined) {
   reservation.totalPrice = totalPrice;
  }

  await reservation.save();

  res.json({ message: 'Reservation updated successfully', reservation });
 } catch (error) {
  console.error('Error updating reservation:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Update reservation status
const updateReservationStatus = async (req, res) => {
 try {
  const { status } = req.body;
  const reservation = await Reservation.findByPk(req.params.id);

  if (!reservation) {
   return res.status(404).json({ message: 'Reservation not found' });
  }

  if (!['draft', 'sent', 'signed', 'confirmed', 'cancelled'].includes(status)) {
   return res.status(400).json({ message: 'Invalid status' });
  }

  // Only check availability when moving from draft to sent/confirmed
  if (
   reservation.status === 'draft' &&
   (status === 'sent' || status === 'confirmed' || status === 'signed')
  ) {
   // Check for overlapping reservations
   const { available, conflictingReservations } =
    await Reservation.checkAvailability(
     reservation.propertyId,
     reservation.startDate,
     reservation.endDate,
     reservation.id
    );

   if (!available) {
    return res.status(400).json({
     message:
      'Cannot update status due to date conflict with existing reservations',
     conflictingReservations,
    });
   }
  }

  await reservation.update({ status });
  res.json({ message: 'Reservation status updated', reservation });
 } catch (error) {
  console.error('Error updating reservation status:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Delete reservation
const deleteReservation = async (req, res) => {
 try {
  const reservation = await Reservation.findByPk(req.params.id);

  if (!reservation) {
   return res.status(404).json({ message: 'Reservation not found' });
  }

  await reservation.destroy();
  res.json({ message: 'Reservation deleted successfully' });
 } catch (error) {
  console.error('Error deleting reservation:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Get contract for a reservation
const getReservationContract = async (req, res) => {
 try {
  const { id } = req.params;

  const contract = await ReservationContract.findOne({
   where: { reservationId: id },
   include: [
    {
     model: Property,
     as: 'property', // Make sure this matches the association alias
    },
   ],
  });

  if (!contract) {
   return res
    .status(404)
    .json({ error: 'No contract found for this reservation' });
  }

  res.status(200).json(contract);
 } catch (error) {
  console.error('Error fetching reservation contract:', error);
  res.status(500).json({ error: 'Failed to fetch contract' });
 }
};

// Add this function to ReservationController.js
const getReservationByHash = async (req, res) => {
 try {
  const { hashId } = req.params;

  const reservation = await Reservation.findOne({
   where: { hashId },
   include: [
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
    {
     model: Property,
     attributes: ['id', 'name', 'hashId'],
    },
   ],
  });

  if (!reservation) {
   return res.status(404).json({ error: 'Reservation not found' });
  }

  res.json(reservation);
 } catch (error) {
  console.error('Error fetching reservation by hash:', error);
  res.status(500).json({ error: 'Failed to fetch reservation' });
 }
};

const getClientReservations = async (req, res) => {
 try {
  const { clientId } = req.params;

  // Find all reservations created by this client
  const reservations = await Reservation.findAll({
   where: { createdByUserId: clientId },
   include: [
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
    {
     model: Property,
     attributes: ['id', 'name', 'hashId'],
    },
   ],
  });

  res.json(reservations);
 } catch (error) {
  console.error('Error fetching client reservations:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};
// Get reservations for properties assigned to a concierge
const getConciergeReservations = async (req, res) => {
 try {
  const { conciergeId } = req.params;

  // Find all properties assigned to this concierge
  const conciergeAssignments = await UserProperty.findAll({
   where: {
    conciergeId,
    status: 'active',
   },
   attributes: ['propertyId'],
  });

  if (!conciergeAssignments || conciergeAssignments.length === 0) {
   return res.json([]);
  }

  const propertyIds = conciergeAssignments.map(
   (assignment) => assignment.propertyId
  );

  // Find all reservations for these properties
  const reservations = await Reservation.findAll({
   where: {
    propertyId: {
     [Op.in]: propertyIds,
    },
   },
   include: [
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
    {
     model: Property,
     attributes: ['id', 'name', 'hashId'],
    },
   ],
  });

  res.json(reservations);
 } catch (error) {
  console.error('Error fetching concierge reservations:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

const generateContract = async (req, res) => {
 try {
  const { id } = req.params;
  const reservation = await Reservation.findByPk(id, {
   include: [{ model: Property }],
  });

  if (!reservation) {
   return res.status(404).json({ error: 'Reservation not found' });
  }

  // Check if a contract already exists
  const existingContract = await ReservationContract.findOne({
   where: { reservationId: id },
  });

  if (existingContract) {
   return res.status(200).json(existingContract); // Return existing contract
  }

  // Generate a hashId for the contract - this is unnecessary as your hook will do it,
  // but we're including it here to be safe
  const crypto = require('crypto');
  const secret = process.env.HASH_SECRET || 'your-secret-key';
  const text = `contract-${Date.now()}-${Math.random()}-${secret}`;
  const hashId = crypto
   .createHash('sha256')
   .update(text)
   .digest('hex')
   .substring(0, 12);

  // Create a new contract with minimum required fields
  const contract = await ReservationContract.create({
   reservationId: id,
   propertyId: reservation.propertyId,
   checkInDate: reservation.startDate,
   checkOutDate: reservation.endDate,
   email: 'pending@example.com', // Required field
   residenceCountry: 'PENDING', // Required field
   status: 'DRAFT',
   hashId: hashId, // This will be overwritten by the hook, but including it anyway
  });

  res.status(201).json(contract);
 } catch (error) {
  console.error('Error generating contract:', error);
  res.status(500).json({ error: 'Failed to generate contract' });
 }
};

const updateElectronicLock = async (req, res) => {
 try {
  const { reservationId } = req.params;
  const { electronicLockEnabled } = req.body;
  let { electronicLockCode } = req.body;

  // Find the reservation
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
   return res.status(404).json({ error: 'Reservation not found' });
  }

  // Validate the lock code if it's being set
  if (
   electronicLockEnabled &&
   electronicLockCode !== null &&
   electronicLockCode !== undefined
  ) {
   // Convert to string if it's not already
   const codeString = String(electronicLockCode);

   // Check if the code contains only digits and is no more than 10 digits
   if (!/^\d+$/.test(codeString)) {
    return res.status(400).json({
     error: 'Electronic lock code must contain only digits',
    });
   }

   if (codeString.length > 10) {
    return res.status(400).json({
     error: 'Electronic lock code must not exceed 10 digits',
    });
   }

   // Assign the string representation to be saved
   electronicLockCode = codeString;
  }

  // Update the reservation
  await reservation.update({
   electronicLockEnabled:
    electronicLockEnabled !== undefined
     ? electronicLockEnabled
     : reservation.electronicLockEnabled,
   electronicLockCode: electronicLockEnabled ? electronicLockCode : null,
  });

  res.status(200).json({
   success: true,
   message: 'Electronic lock settings updated successfully',
   data: {
    electronicLockEnabled: reservation.electronicLockEnabled,
    electronicLockCode: reservation.electronicLockEnabled
     ? reservation.electronicLockCode
     : null,
   },
  });
 } catch (error) {
  console.error('Error updating electronic lock settings:', error);
  res.status(500).json({
   error: 'Failed to update electronic lock settings',
   details: error.message,
  });
 }
};

const checkAvailability = async (req, res) => {
 const { propertyId } = req.params;
 const { startDate, endDate, excludeReservationId } = req.query;

 try {
  if (!propertyId || !startDate || !endDate) {
   return res.status(400).json({
    error: 'Missing required parameters',
    details: 'propertyId, startDate and endDate are required',
   });
  }

  // Convert the excludeReservationId to a number if it exists
  const excludeId = excludeReservationId
   ? parseInt(excludeReservationId, 10)
   : null;

  // Use the model's static method to check availability
  const result = await Reservation.checkAvailability(
   propertyId,
   startDate,
   endDate,
   excludeId
  );

  // Format the response to include dates for easier consumption by the frontend
  const formattedResult = {
   ...result,
   propertyId,
   startDate,
   endDate,
   conflictingReservations: result.conflictingReservations.map(
    (reservation) => ({
     id: reservation.id,
     startDate: reservation.startDate,
     endDate: reservation.endDate,
     status: reservation.status,
    })
   ),
  };

  res.status(200).json(formattedResult);
 } catch (error) {
  console.error('Error checking availability:', error);
  res.status(500).json({
   error: 'Failed to check availability',
   details: error.message,
  });
 }
};

const checkReservationUID = async (req, res) => {
 const { uid } = req.params;
 try {
  const reservation = await Reservation.findOne({
   where: { calendarEventUID: uid },
  });
  res.json({ exists: !!reservation });
 } catch (error) {
  console.error('Error checking reservation UID:', error);
  res.status(500).json({ error: 'Error checking UID' });
 }
};

// POST /api/reservation/identifierUtilisateur
const identifierUtilisateur = async (req, res) => {
 try {
  const { sessionId, email, id, reservationId, propertyId } = req.body;

  let userId, user;

  // Authentication logic (same as before)
  if (sessionId) {
   try {
    if (sessionId === 'google-auth' || sessionId.includes('google-auth')) {
     if (!email) {
      return res.status(400).json({
       status: 'error',
       message: 'Email is required when using Google Auth',
      });
     }

     user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'firstname', 'lastname', 'role'],
     });

     if (!user) {
      return res.status(404).json({
       status: 'error',
       message: 'User not found',
      });
     }

     userId = user.id;
    } else {
     const decoded = jwt.verify(sessionId, process.env.SECRET);
     userId = decoded.id;

     // Get user details to check role
     user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'firstname', 'lastname', 'role'],
     });
    }
   } catch (jwtError) {
    console.log('Invalid JWT token:', jwtError.message);
   }
  }

  if (!userId || !user) {
   let userQueryCondition = {};

   if (email) {
    userQueryCondition.email = email;
   } else if (id) {
    userQueryCondition.id = id;
   } else {
    return res.status(400).json({
     status: 'error',
     message: 'Authentication required',
    });
   }

   user = await User.findOne({
    where: userQueryCondition,
    attributes: ['id', 'email', 'firstname', 'lastname', 'role'],
   });

   if (!user) {
    return res.status(404).json({
     status: 'error',
     message: 'User not found',
    });
   }

   userId = user.id;
  }

  // Check if user is a concierge
  const isConcierge =
   user.role === 'concierge' ||
   (await UserProperty.findOne({
    where: { conciergeId: userId, status: 'active' },
   }));

  if (isConcierge) {
   // CONCIERGE LOGIC: Get reservations for managed properties

   // Get properties managed by this concierge
   const managedProperties = await UserProperty.findAll({
    where: {
     conciergeId: userId,
     status: 'active',
    },
    include: [
     {
      model: Property,
      as: 'property',
      attributes: ['id', 'name', 'type', 'placeName'],
     },
    ],
   });

   if (!managedProperties || managedProperties.length === 0) {
    return res.status(200).json({
     status: 'success',
     Reservation: null,
     message: 'No properties assigned to this concierge',
     userType: 'concierge',
    });
   }

   const propertyIds = managedProperties.map((mp) => mp.propertyId);

   // If specific propertyId provided, filter by it
   let targetPropertyIds = propertyIds;
   if (propertyId) {
    if (!propertyIds.includes(parseInt(propertyId))) {
     return res.status(403).json({
      status: 'error',
      message: 'You do not have access to this property',
     });
    }
    targetPropertyIds = [parseInt(propertyId)];
   }

   // Get active/today reservations for managed properties
   const currentDate = new Date();
   const todayStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
   );
   const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

   // Priority 1: Check-ins today
   let reservations = await Reservation.findAll({
    where: {
     propertyId: { [Op.in]: targetPropertyIds },
     startDate: { [Op.between]: [todayStart, todayEnd] },
     status: { [Op.in]: ['signed', 'confirmed'] },
    },
    include: [
     {
      model: Property,
      attributes: ['id', 'name', 'type', 'placeName'],
     },
     {
      model: ReservationContract,
      as: 'contract',
      attributes: [
       'id',
       'checkInDate',
       'checkOutDate',
       'status',
       'firstname',
       'lastname',
      ],
     },
    ],
    order: [['startDate', 'ASC']],
   });

   if (reservations.length > 0) {
    return res.status(200).json({
     status: 'success',
     Reservation: reservations[0],
     allTodayReservations: reservations,
     userType: 'concierge',
     managedProperties: managedProperties.map((mp) => mp.property),
     message: `${reservations.length} check-ins today`,
    });
   }

   // Priority 2: Active reservations
   reservations = await Reservation.findAll({
    where: {
     propertyId: { [Op.in]: targetPropertyIds },
     startDate: { [Op.lte]: currentDate },
     endDate: { [Op.gte]: currentDate },
     status: { [Op.in]: ['signed', 'confirmed'] },
    },
    include: [
     {
      model: Property,
      attributes: ['id', 'name', 'type', 'placeName'],
     },
     {
      model: ReservationContract,
      as: 'contract',
      attributes: [
       'id',
       'checkInDate',
       'checkOutDate',
       'status',
       'firstname',
       'lastname',
      ],
     },
    ],
    order: [['startDate', 'ASC']],
   });

   if (reservations.length > 0) {
    return res.status(200).json({
     status: 'success',
     Reservation: reservations[0],
     allActiveReservations: reservations,
     userType: 'concierge',
     managedProperties: managedProperties.map((mp) => mp.property),
     message: `${reservations.length} active reservations`,
    });
   }

   // Priority 3: Upcoming reservations (next 7 days)
   const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
   reservations = await Reservation.findAll({
    where: {
     propertyId: { [Op.in]: targetPropertyIds },
     startDate: { [Op.between]: [currentDate, nextWeek] },
     status: { [Op.in]: ['signed', 'confirmed'] },
    },
    include: [
     {
      model: Property,
      attributes: ['id', 'name', 'type', 'placeName'],
     },
     {
      model: ReservationContract,
      as: 'contract',
      attributes: [
       'id',
       'checkInDate',
       'checkOutDate',
       'status',
       'firstname',
       'lastname',
      ],
     },
    ],
    order: [['startDate', 'ASC']],
    limit: 5,
   });

   return res.status(200).json({
    status: 'success',
    Reservation: reservations.length > 0 ? reservations[0] : null,
    allUpcomingReservations: reservations,
    userType: 'concierge',
    managedProperties: managedProperties.map((mp) => mp.property),
    message:
     reservations.length > 0
      ? `${reservations.length} upcoming reservations`
      : 'No upcoming reservations',
   });
  } else {
   // CLIENT LOGIC: Original logic for property owners/guests

   // If specific reservation requested
   if (reservationId) {
    const specificReservation = await Reservation.findOne({
     where: {
      id: reservationId,
      createdByUserId: userId,
     },
     include: [
      {
       model: Property,
       attributes: ['id', 'name', 'type', 'placeName'],
      },
      {
       model: ReservationContract,
       as: 'contract',
       attributes: ['id', 'checkInDate', 'checkOutDate', 'status'],
      },
     ],
    });

    if (!specificReservation) {
     return res.status(404).json({
      status: 'error',
      message: 'Reservation not found',
     });
    }

    return res.status(200).json({
     status: 'success',
     Reservation: specificReservation,
     userType: 'client',
    });
   }

   // Continue with original client logic...
   // [Rest of the original identifierUtilisateur logic for clients]

   const currentDate = new Date();

   // Active reservations for client
   const activeReservations = await Reservation.findAll({
    where: {
     createdByUserId: userId,
     startDate: { [Op.lte]: currentDate },
     endDate: { [Op.gte]: currentDate },
     status: { [Op.in]: ['signed', 'confirmed'] },
    },
    include: [
     {
      model: Property,
      attributes: ['id', 'name', 'type', 'placeName'],
     },
     {
      model: ReservationContract,
      as: 'contract',
      attributes: ['id', 'checkInDate', 'checkOutDate', 'status'],
     },
    ],
    order: [['startDate', 'ASC']],
   });

   if (activeReservations && activeReservations.length > 0) {
    return res.status(200).json({
     status: 'success',
     Reservation: activeReservations[0],
     userType: 'client',
     multipleReservations: activeReservations.length > 1,
     allActiveReservations: activeReservations,
     message:
      activeReservations.length > 1
       ? `${activeReservations.length} active reservations found`
       : 'Active reservation found',
    });
   }

   // Continue with upcoming, etc. (rest of original logic)
   // ...
  }
 } catch (error) {
  console.error('Error in identifierUtilisateur:', error);
  res.status(500).json({
   status: 'error',
   message: 'Failed to identify user and retrieve reservation',
   details: error.message,
  });
 }
};

// GET /api/v1/reservations/listUserReservations
const listUserReservations = async (req, res) => {
 try {
  const { sessionId, email, id } = req.body;

  let userId;

  // Same authentication logic as identifierUtilisateur
  if (sessionId) {
   try {
    if (sessionId === 'google-auth' || sessionId.includes('google-auth')) {
     if (!email) {
      return res.status(400).json({
       status: 'error',
       message: 'Email is required when using Google Auth',
      });
     }

     const user = await User.findOne({
      where: { email },
      attributes: ['id'],
     });

     if (!user) {
      return res.status(404).json({
       status: 'error',
       message: 'User not found',
      });
     }

     userId = user.id;
    } else {
     const decoded = jwt.verify(sessionId, process.env.SECRET);
     userId = decoded.id;
    }
   } catch (jwtError) {
    console.log('Invalid JWT token:', jwtError.message);
   }
  }

  if (!userId) {
   let userQueryCondition = {};

   if (email) {
    userQueryCondition.email = email;
   } else if (id) {
    userQueryCondition.id = id;
   } else {
    return res.status(400).json({
     status: 'error',
     message: 'Authentication required',
    });
   }

   const user = await User.findOne({
    where: userQueryCondition,
    attributes: ['id'],
   });

   if (!user) {
    return res.status(404).json({
     status: 'error',
     message: 'User not found',
    });
   }

   userId = user.id;
  }

  // Get all reservations for the user, categorized
  const currentDate = new Date();

  // Active reservations
  const activeReservations = await Reservation.findAll({
   where: {
    createdByUserId: userId,
    startDate: { [Op.lte]: currentDate },
    endDate: { [Op.gte]: currentDate },
    status: { [Op.in]: ['signed', 'confirmed'] },
   },
   include: [
    {
     model: Property,
     attributes: ['id', 'name', 'type', 'placeName'],
    },
    {
     model: ReservationContract,
     as: 'contract',
     attributes: ['id', 'checkInDate', 'checkOutDate', 'status'],
    },
   ],
   order: [['startDate', 'ASC']],
  });

  // Upcoming reservations
  const upcomingReservations = await Reservation.findAll({
   where: {
    createdByUserId: userId,
    startDate: { [Op.gt]: currentDate },
    status: { [Op.in]: ['signed', 'confirmed'] },
   },
   include: [
    {
     model: Property,
     attributes: ['id', 'name', 'type', 'placeName'],
    },
    {
     model: ReservationContract,
     as: 'contract',
     attributes: ['id', 'checkInDate', 'checkOutDate', 'status'],
    },
   ],
   order: [['startDate', 'ASC']],
   limit: 10,
  });

  // Recent past reservations
  const pastReservations = await Reservation.findAll({
   where: {
    createdByUserId: userId,
    endDate: { [Op.lt]: currentDate },
    status: { [Op.in]: ['signed', 'confirmed'] },
   },
   include: [
    {
     model: Property,
     attributes: ['id', 'name', 'type', 'placeName'],
    },
    {
     model: ReservationContract,
     as: 'contract',
     attributes: ['id', 'checkInDate', 'checkOutDate', 'status'],
    },
   ],
   order: [['endDate', 'DESC']],
   limit: 5,
  });

  res.status(200).json({
   status: 'success',
   reservations: {
    active: activeReservations,
    upcoming: upcomingReservations,
    past: pastReservations,
    total: {
     active: activeReservations.length,
     upcoming: upcomingReservations.length,
     past: pastReservations.length,
    },
   },
  });
 } catch (error) {
  console.error('Error in listUserReservations:', error);
  res.status(500).json({
   status: 'error',
   message: 'Failed to retrieve user reservations',
   details: error.message,
  });
 }
};

module.exports = {
 getReservation,
 getReservations,
 getReservationsByProperty,
 createReservation,
 getReservationContract,
 sendToGuest,
 generateRevenue,
 updateReservation,
 updateReservationStatus,
 getReservationByHash,
 deleteReservation,
 getClientReservations,
 getConciergeReservations,
 generateContract,
 updateElectronicLock,
 checkAvailability,
 checkReservationUID,
 identifierUtilisateur,
 listUserReservations,
};
