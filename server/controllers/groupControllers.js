const groupModel = require('../models/groupModel');
const userModel = require('../models/userModel');

module.exports.createGroup = async (req, res, next) => {
  try {
    const { group_name, description, max_capacity, location, meet_time } = req.body;
    const user_id = req.session.user_id;
    
    if (!group_name) return res.status(400).send({ error: 'Group name is required.' });
    if (!description) return res.status(400).send({ error: 'Description is required.' });
    if (!max_capacity) return res.status(400).send({ error: 'Max capacity is required.' });
    if (!location) return res.status(400).send({ error: 'Location is required.' });
    if (!meet_time) return res.status(400).send({ error: 'Meet time is required.' });
    if (!user_id) return res.status(401).send({ error: 'You must be logged in to create a group.' });
    
    const group = await groupModel.create(group_name, description, max_capacity, location, meet_time);
    
    // Automatically add creator to the group
    await groupModel.addUserToGroup(group.group_id, user_id);
    
    res.status(201).send(group);
  } catch (err) {
    next(err);
  }
};

module.exports.getGroup = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    // Get additional data for the group
    const members = await groupModel.getMembers(parseInt(group_id));
    const books = await groupModel.getBooks(parseInt(group_id));
    
    res.send({ ...group, members, books });
  } catch (err) {
    next(err);
  }
};

module.exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await groupModel.findAll();
    res.send(groups);
  } catch (err) {
    next(err);
  }
};

module.exports.updateGroup = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    const { group_name, description, max_capacity, location, meet_time } = req.body;
    const user_id = req.session.user_id;
    
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    // Check if user is a member of this group
    const isMember = await groupModel.isUserInGroup(parseInt(group_id), user_id);
    if (!isMember) {
      return res.status(403).send({ error: 'Only group members can edit group details.' });
    }
    
    const updatedGroup = await groupModel.update(parseInt(group_id), group_name, description, max_capacity, location, meet_time);
    res.send(updatedGroup);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteGroup = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    const user_id = req.session.user_id;
    
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    // Check if user is a member (creator check would need a "created_by" field)
    const isMember = await groupModel.isUserInGroup(parseInt(group_id), user_id);
    if (!isMember) {
      return res.status(403).send({ error: 'Only group members can delete the group.' });
    }
    
    await groupModel.delete(parseInt(group_id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports.getGroupMembers = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    const members = await groupModel.getMembers(parseInt(group_id));
    res.send(members);
  } catch (err) {
    next(err);
  }
};

module.exports.getGroupBooks = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    const books = await groupModel.getBooks(parseInt(group_id));
    res.send(books);
  } catch (err) {
    next(err);
  }
};

//group-user

module.exports.addUserToGroup = async (req, res, next) => {
  try {
    const { group_id, user_id } = req.params;
    const requesting_user_id = req.session.user_id;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    // Check if group exists
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    // Check if user exists
    const user = await userModel.find(parseInt(user_id));
    if (!user) return res.status(404).send({ error: 'User not found.' });
    
    // Check if group is at capacity
    const members = await groupModel.getMembers(parseInt(group_id));
    if (members.length >= group.max_capacity) {
      return res.status(400).send({ error: 'Group has reached maximum capacity.' });
    }
    
    const membership = await groupModel.addUserToGroup(parseInt(group_id), parseInt(user_id));
    if (!membership) return res.status(409).send({ error: 'User is already in this group.' });
    
    res.status(201).send(membership);
  } catch (err) {
    next(err);
  }
};

module.exports.removeUserFromGroup = async (req, res, next) => {
  try {
    const { group_id, user_id } = req.params;
    const requesting_user_id = req.session.user_id;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    // Check if group exists
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    const membership = await groupModel.removeUserFromGroup(parseInt(group_id), parseInt(user_id));
    if (!membership) return res.status(404).send({ error: 'User is not a member of this group.' });
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports.getUserGroups = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    const groups = await groupModel.getGroupsForUser(parseInt(user_id));
    res.send(groups);
  } catch (err) {
    next(err);
  }
};

module.exports.checkUserInGroup = async (req, res, next) => {
  try {
    const { group_id, user_id } = req.params;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    const isMember = await groupModel.isUserInGroup(parseInt(group_id), parseInt(user_id));
    res.send({ isMember });
  } catch (err) {
    next(err);
  }
};