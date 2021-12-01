import User from '../models/users';
import jwt from '../utils/jwt';

export default {
  createUser: async (req, res, next) => {
    const { name, email, password, passwordConfirmation, roles } = req.body;

    if (password !== passwordConfirmation) {
      return res.status(400).json({
        message: 'Password and password confirmation do not match',
        error: true,
        data: null,
      });
    }

    try {
      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          message: 'User already exists',
          error: true,
          data: null,
        });
      }

      const newUser = new User({
        name,
        email,
        password,
        roles,
      });

      await newUser.save();

      return res.status(201).json({
        message: 'User created successfully',
        error: false,
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  },
  getUsers: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      if (!decoded) {
        return res.status(401).json({
          message: 'Invalid token',
          error: true,
          data: null,
        });
      }

      const users = await User.find({});

      return res.status(200).json({
        message: 'Users retrieved successfully',
        error: false,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
  getUser: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    // Get user by id
    try {
      // Verify token
      const decoded = jwt.verify(token);

      const user = await User.findById(decoded.id);

      await user.populate('clubs');
      await user.populate('recents');

      return res.status(200).json({
        message: 'User retrieved successfully',
        error: false,
        data: {
          ...user.toObject(),
          recents: user.recents.reverse(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
  updateUser: async (req, res, next) => {
    // Get token from header
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: 'No token provided',
        error: true,
        data: null,
      });
    }

    const token = req.headers.authorization.split(' ')[1];

    // Get user by id
    try {
      // Verify token
      const decoded = jwt.verify(token);
      const user = await User.findById(decoded.id);

      // Update user
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.roles = req.body.roles || user.roles;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;

      await user.save();

      // Save log to recents
      await user.saveLog('update', 'user');

      return res.status(200).json({
        message: 'User updated successfully',
        error: false,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteUser: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token);

    // Get user by id
    try {
      const user = await User.findById(decoded.id);

      await user.remove();

      return res.status(200).json({
        message: 'User deleted successfully',
        error: false,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
  getUserClubs: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    // Get user by id
    try {
      // Verify token
      const decoded = jwt.verify(token);

      const user = await User.findById(decoded.id);

      await user.populate('clubs');
      await user.populate('clubs.clubAdmin');

      return res.status(200).json({
        message: 'User clubs retrieved successfully',
        error: false,
        data: user.clubs,
      });
    } catch (error) {
      next(error);
    }
  },
};
