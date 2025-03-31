const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks for a user
router.get('/', checkJwt, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.auth.sub });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post('/', checkJwt, async (req, res) => {
  const task = new Task({
    ...req.body,
    userId: req.auth.sub,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a task
router.patch('/:id', checkJwt, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.auth.sub });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.auth.sub });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;