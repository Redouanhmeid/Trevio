// routes/propertyTask.js
const express = require('express');
const router = express.Router();
const {
 createTask,
 updateTask,
 getPropertyTasks,
 getTask,
 deleteTask,
 updateTaskStatus,
 getUserTasks,
} = require('../controllers/PropertyTaskController');

router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.get('/property/:propertyId/tasks', getPropertyTasks);
router.get('/tasks/:id', getTask);
router.delete('/tasks/:id', deleteTask);
router.patch('/tasks/:id/status', updateTaskStatus);
router.get('/user/:clientId/tasks', getUserTasks);

module.exports = router;
