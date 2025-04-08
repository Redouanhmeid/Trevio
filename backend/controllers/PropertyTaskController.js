// controllers/PropertyTaskController.js
const { PropertyTask, Property, User, UserProperty } = require('../models');
const { Op } = require('sequelize');

const createTask = async (req, res) => {
 try {
  const { propertyId, title, priority, dueDate, notes } = req.body;

  const task = await PropertyTask.create({
   propertyId,
   title,
   priority,
   dueDate,
   notes,
   createdBy: req.user?.id || req.body.createdBy, // Handle both auth and manual creation
  });

  res.status(201).json(task);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to create task' });
 }
};

const updateTask = async (req, res) => {
 try {
  const { id } = req.params;
  const { title, priority, dueDate, notes, status } = req.body;

  const task = await PropertyTask.findByPk(id);

  if (!task) {
   return res.status(404).json({ error: 'Task not found' });
  }

  await task.update({
   title,
   priority,
   dueDate,
   notes,
   status,
  });

  res.status(200).json(task);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update task' });
 }
};

const getPropertyTasks = async (req, res) => {
 try {
  const { propertyId } = req.params;
  const { status, priority, startDate, endDate } = req.query;

  const whereClause = { propertyId };

  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (startDate && endDate) {
   whereClause.dueDate = {
    [Op.between]: [new Date(startDate), new Date(endDate)],
   };
  }

  const tasks = await PropertyTask.findAll({
   where: whereClause,
   order: [
    ['dueDate', 'ASC'],
    ['priority', 'DESC'],
   ],
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['name'],
    },
   ],
  });

  res.status(200).json(tasks);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to fetch tasks' });
 }
};

const getTask = async (req, res) => {
 try {
  const { id } = req.params;

  const task = await PropertyTask.findByPk(id, {
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['name'],
    },
   ],
  });

  if (!task) {
   return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(task);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to fetch task' });
 }
};

const deleteTask = async (req, res) => {
 try {
  const { id } = req.params;

  const task = await PropertyTask.findByPk(id);

  if (!task) {
   return res.status(404).json({ error: 'Task not found' });
  }

  await task.destroy();

  res.status(200).json({ message: 'Task deleted successfully' });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to delete task' });
 }
};

const updateTaskStatus = async (req, res) => {
 try {
  const { id } = req.params;
  const { status } = req.body;

  const task = await PropertyTask.findByPk(id);

  if (!task) {
   return res.status(404).json({ error: 'Task not found' });
  }

  await task.update({ status });

  res.status(200).json(task);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to update task status' });
 }
};

const getUserTasks = async (req, res) => {
 try {
  const clientId = req.params.clientId;

  const tasks = await PropertyTask.findAll({
   include: [
    {
     model: Property,
     as: 'property',
     where: { clientId },
     attributes: ['name', 'id'],
    },
   ],
   order: [
    ['dueDate', 'ASC'],
    ['priority', 'DESC'],
   ],
  });

  res.status(200).json(tasks);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to fetch user tasks' });
 }
};

// Get tasks assigned to a specific user
const getAssignedTasks = async (req, res) => {
 try {
  const userId = req.params.userId;

  // Find all tasks assigned to this user
  const assignedTasks = await PropertyTask.findAll({
   where: {
    assignedTo: userId,
   },
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['id', 'name', 'clientId', 'hashId'],
    },
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
   order: [
    ['dueDate', 'ASC'],
    ['priority', 'DESC'],
   ],
  });

  // Find all properties this user manages as a concierge
  const managedProperties = await UserProperty.findAll({
   where: {
    conciergeId: userId,
    status: 'active',
   },
   attributes: ['propertyId'],
  });

  const managedPropertyIds = managedProperties.map((p) => p.propertyId);

  // Find all tasks for properties this user manages (but isn't directly assigned to)
  const managedTasks = await PropertyTask.findAll({
   where: {
    propertyId: {
     [Op.in]: managedPropertyIds,
    },
    // Exclude tasks already included in assignedTasks
    assignedTo: {
     [Op.or]: [{ [Op.ne]: userId }, { [Op.is]: null }],
    },
   },
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['id', 'name', 'clientId', 'hashId'],
    },
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
    {
     model: User,
     as: 'assignee',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
   order: [
    ['dueDate', 'ASC'],
    ['priority', 'DESC'],
   ],
  });

  // Combine both sets of tasks, ensuring no duplicates
  const taskMap = new Map();

  // Add assigned tasks first
  assignedTasks.forEach((task) => {
   taskMap.set(task.id, {
    ...task.toJSON(),
    assignmentType: 'direct',
   });
  });

  // Add managed tasks
  managedTasks.forEach((task) => {
   if (!taskMap.has(task.id)) {
    taskMap.set(task.id, {
     ...task.toJSON(),
     assignmentType: 'property',
    });
   }
  });

  // Convert map to array
  const allTasks = Array.from(taskMap.values());

  res.status(200).json(allTasks);
 } catch (error) {
  console.error('Error in getAssignedTasks:', error);
  res.status(500).json({ error: 'Failed to fetch assigned tasks' });
 }
};

const getUserPropertyTasks = async (req, res) => {
 try {
  const userId = req.params.userId;

  // First find all properties owned by this user
  const ownedProperties = await Property.findAll({
   where: { clientId: userId },
   attributes: ['id'],
  });

  // Find all properties the user manages as a concierge
  const managedProperties = await UserProperty.findAll({
   where: {
    conciergeId: userId,
    status: 'active',
   },
   attributes: ['propertyId'],
  });

  // Combine property IDs from both sources
  const ownedPropertyIds = ownedProperties.map((prop) => prop.id);
  const managedPropertyIds = managedProperties.map((prop) => prop.propertyId);
  const allPropertyIds = [
   ...new Set([...ownedPropertyIds, ...managedPropertyIds]),
  ];

  // No properties found
  if (allPropertyIds.length === 0) {
   return res.status(200).json([]);
  }

  // Find all tasks for these properties
  const tasks = await PropertyTask.findAll({
   where: {
    propertyId: {
     [Op.in]: allPropertyIds,
    },
   },
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['id', 'name', 'clientId', 'hashId'],
    },
    {
     model: User,
     as: 'creator',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
   order: [
    ['dueDate', 'ASC'],
    ['priority', 'DESC'],
   ],
  });

  // Add a property to indicate if the user is the owner or concierge
  const enhancedTasks = tasks.map((task) => {
   const isOwner = ownedPropertyIds.includes(task.propertyId);
   const isConcierge = managedPropertyIds.includes(task.propertyId);

   return {
    ...task.toJSON(),
    userRelationship: {
     isOwner,
     isConcierge,
    },
   };
  });

  res.status(200).json(enhancedTasks);
 } catch (error) {
  console.error('Error in getUserPropertyTasks:', error);
  res.status(500).json({ error: 'Failed to fetch property tasks' });
 }
};

module.exports = {
 createTask,
 updateTask,
 getPropertyTasks,
 getTask,
 deleteTask,
 updateTaskStatus,
 getUserTasks,
 getAssignedTasks,
 getUserPropertyTasks,
};
