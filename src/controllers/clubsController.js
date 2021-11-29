import jwt from '../utils/jwt';
import Club from '../models/clubs';
import randoms from '../utils/randoms';
import Recents from '../models/recents';
import User from '../models/users';
import Comment from '../models/comment';
import Works from '../models/works';

export default {
  createClub: async (req, res, next) => {
    const { name, description } = req.body;

    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Check club name
      const club = await Club.findOne({ name });

      if (club) {
        return res.status(400).json({
          message: 'Club name already exists',
          error: true,
          data: null,
        });
      }

      // Create new club
      const newClub = new Club({
        name,
        description,
        clubAdmin: decoded.id,
        inviteCode: randoms.generateInviteCodeString(),
      });

      // Save club
      await newClub.save();

      // Save to recents
      const recent = new Recents({
        type: `club-[${newClub.name}]`,
        activityName: 'create',
        time: Date.now(),
        user: decoded.id,
      });

      await recent.save();

      await User.findByIdAndUpdate(decoded.id, {
        $push: {
          clubs: newClub._id,
          recents: recent._id,
        },
      });

      return res.status(201).json({
        message: 'Club created successfully',
        error: false,
        data: newClub,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },
  getClubs: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get all clubs
      const clubs = await Club.find({}).populate('clubAdmin');

      return res.status(200).json({
        message: 'Clubs retrieved successfully',
        error: false,
        data: clubs,
      });
    } catch (error) {
      return next(error);
    }
  },
  getClub: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.query.clubId).populate('members');

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      await club.populate('clubAdmin');
      await club.populate('comments');
      await club.populate('comments.user');

      return res.status(200).json({
        message: 'Club retrieved successfully',
        error: false,
        data: club,
      });
    } catch (error) {
      return next(error);
    }
  },
  updateClub: async (req, res, next) => {
    const { name, description, avatar } = req.body;
    console.log(req.body);
    // Get token from header
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      // Check if user is admin
      if (decoded.id !== club.clubAdmin.toString()) {
        return res.status(401).json({
          message: 'You are not authorized to perform this action',
          error: true,
          data: null,
        });
      }

      // Check club name
      const clubName = await Club.findOne({ name });

      if (clubName && clubName._id.toString() !== club._id.toString()) {
        return res.status(400).json({
          message: 'Club name already exists',
          error: true,
          data: null,
        });
      }

      // Update club
      club.name = name || club.name;
      club.description = description || club.description;
      club.avatar = avatar || club.avatar;

      // Save club
      await club.save();

      await club.populate('clubAdmin');

      return res.status(200).json({
        message: 'Club updated successfully',
        error: false,
        data: club,
      });
    } catch (error) {
      return next(error);
    }
  },
  deleteClub: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      // Check if user is admin
      if (decoded.id !== club.clubAdmin.toString()) {
        return res.status(401).json({
          message: 'You are not authorized to perform this action',
          error: true,
          data: null,
        });
      }

      // If club has members, do not delete
      console.log(club.members.length);
      if (club.members.length > 0) {
        return res.status(400).json({
          message: 'Club has members, cannot delete',
          error: true,
          data: null,
        });
      }

      // Delete club
      await club.deleteOne();

      const recent = new Recents({
        type: `club-[${club.name}]`,
        activityName: 'delete',
        time: Date.now(),
        user: decoded.id,
      });

      await recent.save();

      await User.findByIdAndUpdate(decoded.id, {
        $push: {
          recents: recent._id,
        },
      });

      await Comment.deleteMany({
        club: club._id,
      });

      return res.status(200).json({
        message: 'Club deleted successfully',
        error: false,
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  },
  addMember: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.body.id);

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      // Check if user is admin
      if (decoded.id !== club.clubAdmin) {
        return res.status(401).json({
          message: 'You are not authorized to perform this action',
          error: true,
          data: null,
        });
      }

      // Check if user is already member
      if (club.members.includes(req.body.id)) {
        return res.status(400).json({
          message: 'User is already a member',
          error: true,
          data: null,
        });
      }

      // Add user to members
      club.members.push(req.body.id);
      club.membersQuantity = club.members.length;

      // Save club
      await club.save();

      return res.status(200).json({
        message: 'User added to club successfully',
        error: false,
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  },
  removeMember: async (req, res, next) => {
    // Get token from header
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      // Check if user is admin
      if (decoded.id !== club.clubAdmin.toString()) {
        return res.status(401).json({
          message: 'You are not authorized to perform this action',
          error: true,
          data: null,
        });
      }

      // Check if user is already member
      if (!club.members.includes(req.params.memberId)) {
        return res.status(400).json({
          message: 'User is not a member',
          error: true,
          data: null,
        });
      }

      // Remove user from members
      club.members = club.members.filter(
        (member) => member.toString() !== req.params.memberId,
      );
      club.membersQuantity = club.members.length;

      // Save club
      await club.save();

      await User.findByIdAndUpdate(req.params.memberId, {
        $pull: {
          clubs: club._id,
        },
      });

      return res.status(200).json({
        message: 'User removed from club successfully',
        error: false,
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  },
  joinClub: async (req, res, next) => {
    const { inviteCode } = req.body;

    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findOne({ inviteCode });

      if (!club) {
        return res.status(404).json({
          message: 'Invite code is invalid',
          error: true,
          data: null,
        });
      }

      if (
        club.members.includes(decoded.id) ||
        club.clubAdmin.toString() === decoded.id
      ) {
        return res.status(400).json({
          message: 'User is already a member',
          error: true,
          data: null,
        });
      }

      // Add user to members
      club.members.push(decoded.id);
      club.membersQuantity = club.members.length;

      const works = await Works.find({ club: club._id });

      works.forEach(async (work) => {
        await work.updateOne({
          $push: {
            members: decoded.id,
          },
        });
      });

      // Update user club
      await User.findByIdAndUpdate(decoded.id, {
        $push: {
          clubs: club._id,
        },
      });

      // Save club
      await club.save();

      return res.status(200).json({
        message: 'Joined to club successfully',
        error: false,
        data: {
          id: club._id,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
  addComment: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      // Check if user is already member or admin
      if (
        !club.members.includes(decoded.id) &&
        decoded.id !== club.clubAdmin.toString()
      ) {
        return res.status(401).json({
          message: 'You are not authorized to perform this action',
          error: true,
          data: null,
        });
      }

      // Create comment
      const comment = new Comment({
        user: decoded.id,
        content: req.body.comment,
        club: req.params.id,
      });

      // Save comment
      await comment.save();

      // Add comment to club
      if (!club.comments) {
        club.comments = [];
      }
      club.comments.push(comment._id);

      // Save club
      await club.save();

      await club.populate('comments');
      await club.populate('comments.user');

      return res.status(200).json({
        message: 'Comment added to club successfully',
        error: false,
        data: club,
      });
    } catch (error) {
      return next(error);
    }
  },
  leaveClub: async (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
        error: true,
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token);

      // Get club
      const club = await Club.findById(req.params.id);

      if (!club) {
        return res.status(404).json({
          message: 'Club not found',
          error: true,
          data: null,
        });
      }

      // Check if user is already member
      if (!club.members.includes(decoded.id)) {
        return res.status(400).json({
          message: 'User is not a member',
          error: true,
          data: null,
        });
      }

      // Remove user from members
      await club.updateOne({
        $pull: {
          members: decoded.id,
        },
        membersQuantity: club.members.length - 1,
      });

      const recent = new Recents({
        user: decoded.id,
        type: `club-[${club.name}]`,
        activityName: 'leave',
        time: Date.now(),
      });

      await recent.save();

      // Update user club
      await User.findByIdAndUpdate(decoded.id, {
        $pull: {
          clubs: club._id,
        },
        $push: {
          recents: recent._id,
        },
      });

      return res.status(200).json({
        message: 'Left club successfully',
        error: false,
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  },
};
