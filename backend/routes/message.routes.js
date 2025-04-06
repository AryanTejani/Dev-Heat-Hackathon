// routes/message.routes.js
import express from "express"
const router = express.Router();
import Message from "../models/message.model.js"
import { authUser } from '../middleware/auth.middleware.js';

// Save a new message
router.post('/save', authUser, async (req, res) => {
  try {
    const { message, sender, projectId, timestamp } = req.body;
    
    if (!message || !sender || !projectId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = new Message({
      message,
      sender,
      projectId,
      timestamp: timestamp || new Date()
    });

    await newMessage.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'Message saved successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get message history for a project
router.get('/history/:projectId', authUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Find all messages for this project, sorted by timestamp
    const messages = await Message.find({ projectId })
      .sort({ timestamp: 1 })
      .lean();
    
    return res.status(200).json({ 
      success: true, 
      messages 
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return res.status(500).json({ error: 'Failed to fetch message history' });
  }
});


// Add these to routes/message.routes.js

// Delete a specific message
router.delete('/delete/:messageId', authUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Find the message to get its project ID
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Optional: Check if user has permission to delete this message
    // For example, only allow message creator or project owner to delete
    // This depends on your application's permission model
    
    // Delete the message
    await Message.findByIdAndDelete(messageId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Clear all messages for a project
router.delete('/clear/:projectId', authUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Delete all messages for this project
    const result = await Message.deleteMany({ projectId });
    
    return res.status(200).json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} messages from project`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing message history:', error);
    return res.status(500).json({ error: 'Failed to clear message history' });
  }
});

export default router
