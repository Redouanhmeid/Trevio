const {
 User,
 UserProperty,
 Property,
 ManagerInvitation,
} = require('../models');
const { Op } = require('sequelize');

// Get all concierges for a client
const getClientConcierges = async (req, res) => {
 try {
  const { clientId } = req.params;

  // First get all accepted manager invitations for this client
  const acceptedInvitations = await ManagerInvitation.findAll({
   where: {
    clientId,
    status: 'accepted',
   },
  });

  // Check if there are any accepted invitations
  if (!acceptedInvitations || acceptedInvitations.length === 0) {
   return res.json([]);
  }

  // Extract the invited emails from acceptedInvitations
  const invitedEmails = acceptedInvitations.map(
   (invitation) => invitation.invitedEmail
  );
  console.log('Invited Emails:', invitedEmails); // Debug log

  // Find the corresponding users
  const managers = await User.findAll({
   where: {
    email: {
     [Op.in]: invitedEmails,
    },
   },
   attributes: [
    'id',
    'firstname',
    'lastname',
    'email',
    'phone',
    'isVerified',
    'avatar',
   ],
  });
  console.log('Found Managers:', managers.length); // Debug log

  // For each manager, get their assigned properties (if any)
  const managersWithProperties = await Promise.all(
   managers.map(async (manager) => {
    // Get property assignments for this manager
    const propertyAssignments = await UserProperty.findAll({
     where: {
      clientId,
      conciergeId: manager.id,
      status: { [Op.ne]: 'inactive' },
     },
     include: [
      {
       model: Property,
       as: 'property',
       attributes: ['id', 'name'],
      },
     ],
    });

    // Return manager data with their properties
    return {
     id: manager.id,
     firstname: manager.firstname,
     lastname: manager.lastname,
     email: manager.email,
     phone: manager.phone,
     isVerified: manager.isVerified,
     avatar: manager.avatar,
     properties: propertyAssignments.map((assignment) => ({
      id: assignment.property?.id,
      name: assignment.property?.name,
      status: assignment.status,
     })),
    };
   })
  );

  res.json(managersWithProperties);
 } catch (error) {
  console.error('Error fetching concierges:', error);
  res.status(500).json({ error: 'Failed to fetch concierges' });
 }
};
// Assign concierge to property
const assignConcierge = async (req, res) => {
 try {
  const { clientId, conciergeId, propertyId } = req.body;

  // Prevent self-assignment
  if (clientId === conciergeId) {
   return res
    .status(400)
    .json({ error: 'Cannot assign yourself as a manager' });
  }

  // Check if assignment already exists
  const existingAssignment = await UserProperty.findOne({
   where: {
    clientId,
    conciergeId,
    propertyId,
    status: { [Op.ne]: 'inactive' },
   },
  });

  if (existingAssignment) {
   return res.status(400).json({ error: 'Assignment already exists' });
  }

  // Check if property is already assigned to a different concierge
  const otherAssignment = await UserProperty.findOne({
   where: {
    propertyId,
    conciergeId: { [Op.ne]: conciergeId },
    status: { [Op.ne]: 'inactive' },
   },
  });

  if (otherAssignment) {
   return res
    .status(400)
    .json({ error: 'Property is already assigned to another concierge' });
  }

  const assignment = await UserProperty.create({
   clientId,
   conciergeId,
   propertyId,
   status: 'active',
  });

  res.status(201).json(assignment);
 } catch (error) {
  console.error('Error assigning concierge:', error);
  res.status(500).json({ error: 'Failed to assign concierge' });
 }
};

// Remove concierge assignment
const removeConcierge = async (req, res) => {
 try {
  const { clientId, conciergeId, propertyId } = req.body;

  const assignment = await UserProperty.findOne({
   where: {
    clientId,
    conciergeId,
    propertyId,
   },
  });

  if (!assignment) {
   return res.status(404).json({ error: 'Assignment not found' });
  }

  // Completely remove the record
  await assignment.destroy();

  res.json({ message: 'Assignment removed successfully' });
 } catch (error) {
  console.error('Error removing property manager:', error);
  res.status(500).json({ error: 'Failed to remove property manager' });
 }
};

// Update assignment status
const updateAssignmentStatus = async (req, res) => {
 try {
  const { assignmentId } = req.params;
  const { status } = req.body;

  const assignment = await UserProperty.findByPk(assignmentId);

  if (!assignment) {
   return res.status(404).json({ error: 'Assignment not found' });
  }

  await assignment.update({ status });

  res.json(assignment);
 } catch (error) {
  console.error('Error updating assignment status:', error);
  res.status(500).json({ error: 'Failed to update status' });
 }
};

// Get concierge details
const getConciergeDetails = async (req, res) => {
 try {
  const { conciergeId } = req.params;

  // Use the correct association names from your models
  const manager = await User.findOne({
   where: {
    id: conciergeId,
   },
   include: [
    {
     model: Property,
     as: 'managedProperties',
     through: {
      model: UserProperty,
      as: 'UserProperty',
      where: {
       status: { [Op.ne]: 'inactive' },
      },
      attributes: ['status', 'assignedAt'],
     },
     required: true,
    },
   ],
   attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'isVerified'],
  });

  if (!manager) {
   return res
    .status(404)
    .json({ error: 'Manager not found or not assigned to any properties' });
  }

  // Transform the response data
  const managerData = {
   id: manager.id,
   firstname: manager.firstname,
   lastname: manager.lastname,
   email: manager.email,
   phone: manager.phone,
   isVerified: manager.isVerified,
   properties: manager.managedProperties.map((property) => ({
    id: property.id,
    name: property.name,
    status: property.UserProperty.status,
    assignedAt: property.UserProperty.assignedAt,
   })),
  };

  res.json(managerData);
 } catch (error) {
  console.error('Error fetching manager details:', error);
  res.status(500).json({ error: 'Failed to fetch manager details' });
 }
};

// Get properties managed by concierge
const getConciergeProperties = async (req, res) => {
 try {
  const { conciergeId } = req.params;

  const assignments = await UserProperty.findAll({
   where: {
    conciergeId,
   },
   include: [
    {
     model: Property,
     as: 'property',
     attributes: [
      'id',
      'hashId',
      'name',
      'type',
      'price',
      'placeName',
      'photos',
      'status',
      'updatedAt',
     ],
    },
   ],
   attributes: ['id', 'clientId', 'status', 'assignedAt'],
  });

  // Transform data to include both assignment and property details
  const propertyAssignments = assignments.map((assignment) => ({
   id: assignment.id,
   clientId: assignment.clientId,
   status: assignment.status,
   assignedAt: assignment.assignedAt,
   property: {
    id: assignment.property.id,
    hashId: assignment.property.hashId,
    name: assignment.property.name,
    type: assignment.property.type,
    price: assignment.property.price,
    placeName: assignment.property.placeName,
    photos: assignment.property.photos,
    status: assignment.property.status,
    updatedAt: assignment.property.updatedAt,
   },
  }));

  res.json(propertyAssignments);
 } catch (error) {
  console.error('Error fetching managed properties:', error);
  res.status(500).json({ error: 'Failed to fetch properties' });
 }
};

module.exports = {
 getClientConcierges,
 assignConcierge,
 removeConcierge,
 updateAssignmentStatus,
 getConciergeDetails,
 getConciergeProperties,
};
