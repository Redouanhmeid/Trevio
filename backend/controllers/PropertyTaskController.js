// controllers/PropertyTaskController.js
const { PropertyTask, Property } = require('../models');
const { Op } = require('sequelize');

const createTask = async (req, res) => {
 try {
  const { propertyId, title, priority, dueDate, notes, assignedTo } = req.body;

  const task = await PropertyTask.create({
   propertyId,
   title,
   priority,
   dueDate,
   notes,
   assignedTo,
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
  const { title, priority, dueDate, notes, status, assignedTo } = req.body;

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
   assignedTo,
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
  const userId = req.params.userId;

  const tasks = await PropertyTask.findAll({
   include: [
    {
     model: Property,
     as: 'property',
     where: { userId },
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

module.exports = {
 createTask,
 updateTask,
 getPropertyTasks,
 getTask,
 deleteTask,
 updateTaskStatus,
 getUserTasks,
};
