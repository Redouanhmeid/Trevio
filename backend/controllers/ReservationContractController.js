const { ReservationContract, Reservation, Property } = require('../models');

// Create a new contract
const createContract = async (req, res) => {
 try {
  const contractData = req.body;
  const contract = await ReservationContract.createContract(contractData);
  res.status(201).json(contract);
 } catch (error) {
  console.error('Error creating contract:', error);
  res.status(500).json({
   error: 'Failed to create contract',
   details: error.message,
  });
 }
};

// Update an existing contract
const updateContract = async (req, res) => {
 const { id } = req.params;
 const updatedData = req.body;

 try {
  const contract = await ReservationContract.findByPk(id);
  if (!contract) {
   return res.status(404).json({ error: 'Contract not found' });
  }
  await contract.update(updatedData);
  res.status(200).json(contract);
 } catch (error) {
  console.error('Error updating contract:', error);
  res.status(500).json({
   error: 'Failed to update contract',
   details: error.message,
  });
 }
};

// Delete an existing contract
const deleteContract = async (req, res) => {
 try {
  const { id } = req.params;
  const contract = await ReservationContract.findByPk(id);

  if (!contract) {
   return res.status(404).json({ error: 'Contract not found' });
  }

  // Check if contract can be deleted (e.g., not already signed)
  if (contract.status === 'SIGNED' || contract.status === 'COMPLETED') {
   return res.status(400).json({
    error: 'Cannot delete a signed or completed contract',
   });
  }

  await contract.destroy();
  res.status(200).json({ message: 'Contract deleted successfully' });
 } catch (error) {
  console.error('Error deleting contract:', error);
  res.status(500).json({
   error: 'Failed to delete contract',
   details: error.message,
  });
 }
};

// Get all contracts for a property
const getContractsForProperty = async (req, res) => {
 const { propertyId } = req.params;
 try {
  const contracts = await ReservationContract.findContractsByProperty(
   propertyId
  );
  res.status(200).json(contracts);
 } catch (error) {
  console.error('Error getting contracts:', error);
  res.status(500).json({
   error: 'Failed to get contracts',
   details: error.message,
  });
 }
};

// Get contract by ID
const getContractById = async (req, res) => {
 const { id } = req.params;
 try {
  const contract = await ReservationContract.findByPk(id);
  if (!contract) {
   return res.status(404).json({ error: 'Contract not found' });
  }
  res.json(contract);
 } catch (error) {
  console.error('Error getting contract:', error);
  res.status(500).json({
   error: 'Error getting contract by ID',
   details: error.message,
  });
 }
};

// Get contract by reservation ID
const getContractByReservationId = async (req, res) => {
 const { reservationId } = req.params;

 try {
  const contract = await ReservationContract.findOne({
   where: { reservationId: reservationId },
  });

  if (!contract) {
   return res
    .status(404)
    .json({ error: 'Contract not found for this reservation' });
  }

  res.status(200).json(contract);
 } catch (error) {
  console.error('Error getting contract by reservation ID:', error);
  res.status(500).json({
   error: 'Failed to get contract',
   details: error.message,
  });
 }
};

// Get contract by hash
const getContractByHash = async (req, res) => {
 const { hashId } = req.params;

 try {
  const contract = await ReservationContract.findByHash(hashId);

  if (!contract) {
   return res.status(404).json({ error: 'Contract not found' });
  }

  // Include the associated reservation to get electronic lock data
  const reservation = await Reservation.findOne({
   where: { id: contract.reservationId },
   attributes: [
    'id',
    'startDate',
    'endDate',
    'electronicLockEnabled',
    'electronicLockCode',
   ],
  });

  const responseData = contract.toJSON();
  if (reservation) {
   responseData.reservation = reservation;
  }

  res.status(200).json(responseData);
 } catch (error) {
  console.error('Error getting contract by hash:', error);
  res.status(500).json({
   error: 'Failed to get contract',
   details: error.message,
  });
 }
};

// Update contract status
const updateContractStatus = async (req, res) => {
 const { id } = req.params;
 const { status } = req.body;

 try {
  const contract = await ReservationContract.findByPk(id);
  if (!contract) {
   return res.status(404).json({ error: 'Contract not found' });
  }

  // Validate status transition
  const validTransitions = {
   DRAFT: ['SENT'],
   SENT: ['SIGNED'],
   SIGNED: ['COMPLETED', 'REJECTED'],
   REJECTED: [],
   COMPLETED: [],
  };

  if (!validTransitions[contract.status].includes(status)) {
   return res.status(400).json({
    error: `Invalid status transition from ${contract.status} to ${status}`,
   });
  }

  // Update status and related fields
  const updateData = {
   status,
   ...(status === 'SIGNED' && {
    signedAt: new Date(),
    signingIpAddress: req.ip,
   }),
  };

  await contract.update(updateData);

  // Find the associated reservation
  const reservation = await Reservation.findByPk(contract.reservationId);
  if (reservation) {
   // Update reservation status based on contract status
   if (status === 'SIGNED') {
    // When contract is signed, reservation becomes 'signed'
    await reservation.update({ status: 'signed' });
   } else if (status === 'COMPLETED') {
    // When contract is completed, reservation becomes 'confirmed'
    await reservation.update({ status: 'confirmed' });
   }
  }

  res.status(200).json(contract);
 } catch (error) {
  console.error('Error updating contract status:', error);
  res.status(500).json({
   error: 'Failed to update contract status',
   details: error.message,
  });
 }
};

// Check property availability
const checkAvailability = async (req, res) => {
 const { propertyId } = req.params;
 const { startDate, endDate } = req.query; // For GET request
 // const { startDate, endDate } = req.body;  // If you prefer POST

 try {
  if (!startDate || !endDate) {
   return res.status(400).json({
    error: 'Missing required dates',
    details: 'Both startDate and endDate are required',
   });
  }

  const result = await ReservationContract.checkAvailability(
   propertyId,
   startDate,
   endDate
  );

  res.status(200).json({
   propertyId,
   startDate,
   endDate,
   ...result,
  });
 } catch (error) {
  console.error('Error checking availability:', error);
  res.status(500).json({
   error: 'Failed to check availability',
   details: error.message,
  });
 }
};

const getContractDetails = async (req, res) => {
 try {
  const { contractId } = req.params;

  const contract = await ReservationContract.findByPk(contractId, {
   include: [
    {
     model: Property,
     as: 'property',
     attributes: [
      'name',
      'placeName',
      'checkInTime',
      'checkOutTime',
      'capacity',
     ],
    },
    {
     model: Reservation,
     as: 'reservation',
     attributes: [
      'id',
      'startDate',
      'endDate',
      'bookingSource',
      'status',
      'totalPrice',
     ],
    },
   ],
  });

  if (!contract) {
   return res.status(404).json({ error: 'Contract not found' });
  }

  // Format the response
  const contractDetails = {
   propertyName: contract.property?.name || null,
   propertyPlaceName: contract.property?.placeName || null,
   checkInDate: contract.reservation?.startDate || null,
   checkInTime: contract.property?.checkInTime || null,
   checkOutDate: contract.reservation?.endDate || null,
   checkOutTime: contract.property?.checkOutTime || null,
   capacity: contract.property?.capacity || null,
   guestFirstname: contract.firstname || null,
   guestLastname: contract.lastname || null,
   guestEmail: contract.email || null,
   guestPhone: contract.phone || null,
   bookingSource: contract.reservation?.bookingSource || null,
   reservationStatus: contract.reservation?.status || null,
   contractGenerationLink: contract.reservation?.id
    ? `${process.env.FRONTEND_URL || ''}/generate-contract/${
       contract.reservation.id
      }`
    : null,
   totalPrice: contract.reservation?.totalPrice || null,
  };

  res.status(200).json(contractDetails);
 } catch (error) {
  console.error('Error fetching contract details:', error);
  res.status(500).json({
   error: 'Failed to fetch contract details',
   details: error.message,
  });
 }
};

// Alternative: Get contract details by reservation ID
const getContractDetailsByReservationId = async (req, res) => {
 try {
  const { reservationId } = req.params;

  const contract = await ReservationContract.findOne({
   where: { reservationId },
   include: [
    {
     model: Property,
     as: 'property',
     attributes: [
      'name',
      'placeName',
      'checkInTime',
      'checkOutTime',
      'capacity',
     ],
    },
    {
     model: Reservation,
     as: 'reservation',
     attributes: [
      'id',
      'startDate',
      'endDate',
      'bookingSource',
      'status',
      'totalPrice',
     ],
    },
   ],
  });

  if (!contract) {
   return res
    .status(404)
    .json({ error: 'Contract not found for this reservation' });
  }

  // Format the response
  const contractDetails = {
   propertyName: contract.property?.name || null,
   propertyPlaceName: contract.property?.placeName || null,
   checkInDate: contract.reservation?.startDate || null,
   checkInTime: contract.property?.checkInTime || null,
   checkOutDate: contract.reservation?.endDate || null,
   checkOutTime: contract.property?.checkOutTime || null,
   capacity: contract.property?.capacity || null,
   guestFirstname: contract.firstname || null,
   guestLastname: contract.lastname || null,
   guestEmail: contract.email || null,
   guestPhone: contract.phone || null,
   bookingSource: contract.reservation?.bookingSource || null,
   reservationStatus: contract.reservation?.status || null,
   contractGenerationLink: contract.reservation?.id
    ? `${process.env.FRONTEND_URL || ''}/generate-contract/${
       contract.reservation.id
      }`
    : null,
   totalPrice: contract.reservation?.totalPrice || null,
  };

  res.status(200).json(contractDetails);
 } catch (error) {
  console.error('Error fetching contract details by reservation:', error);
  res.status(500).json({
   error: 'Failed to fetch contract details',
   details: error.message,
  });
 }
};

module.exports = {
 createContract,
 updateContract,
 deleteContract,
 getContractsForProperty,
 getContractById,
 getContractByReservationId,
 getContractByHash,
 updateContractStatus,
 checkAvailability,
 getContractDetails,
 getContractDetailsByReservationId,
};
