const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const Member = require('../models/member');

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  const group = new Group(req.body);
  try {
    const newGroup = await group.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a group
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a group
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    // Remove this group from all members
    for (const memberId of group.memberIds) {
      await Member.updateOne(
        { _id: memberId },
        { $pull: { groupIds: group._id } }
      );
    }
    
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auto-assign members to group based on filters
router.post('/:id/auto-assign', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const filters = group.filters || {};
    
    // Build query from filters
    const query = {};
    Object.keys(filters).forEach(key => {
      if (key.startsWith('attributes.')) {
        query[key] = filters[key];
      }
    });
    
    // Find matching members
    const matchingMembers = await Member.find(query);
    
    // Add members to group
    group.memberIds = [...new Set([...group.memberIds, ...matchingMembers.map(m => m._id)])];
    await group.save();
    
    // Add group to members
    for (const member of matchingMembers) {
      if (!member.groupIds.includes(group._id)) {
        member.groupIds.push(group._id);
        await member.save();
      }
    }
    
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
