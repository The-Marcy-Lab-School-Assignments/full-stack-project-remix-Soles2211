const userModel = require('../models/userModel');

module.exports.getUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    const user = await userModel.find(parseInt(user_id));
    if (!user) return res.status(404).send({ error: 'User not found.' });
    
    res.send(user);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.findAll();
    res.send(users);
  } catch (err) {
    next(err);
  }
};

module.exports.updateUsername = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { username } = req.body;
    
    if (!username) return res.status(400).send({ error: 'Username is required.' });
    
    const existingUser = await userModel.find(parseInt(user_id));
    if (!existingUser) return res.status(404).send({ error: 'User not found.' });
    
    const usernameTaken = await userModel.findByUsername(username);
    if (usernameTaken && usernameTaken.user_id !== parseInt(user_id)) {
      return res.status(409).send({ error: 'Username already taken.' });
    }
    
    const user = await userModel.updateUsername(parseInt(user_id), username);
    res.send(user);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    const user = await userModel.find(parseInt(user_id));
    if (!user) return res.status(404).send({ error: 'User not found.' });
    
    await userModel.delete(parseInt(user_id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};