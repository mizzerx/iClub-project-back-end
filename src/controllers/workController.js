import { Types } from 'mongoose';
import Clubs from '../models/clubs';
import WorkAnswers from '../models/workAnswers';
import Works from '../models/works';
import jwt from '../utils/jwt';

export const createWork = async (req, res, next) => {
  const { name, description } = req.body;
  const { clubId } = req.params;

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token);

    const club = await Clubs.findById(clubId);

    // Check current user is the owner of the club
    if (decoded.id !== club.clubAdmin.toString()) {
      return res.status(401).json({
        message: 'You are not authorized!',
        error: true,
        data: null,
      });
    }

    const work = new Works({
      name,
      description,
      club: club._id,
      time: Date.now(),
      unHandedIn: club.members,
      handedIn: [],
      workAnswers: [],
    });

    await work.save();

    await Clubs.findByIdAndUpdate(clubId, {
      $push: {
        works: work._id,
      },
    });

    return res.status(200).json({
      message: 'Work created!',
      error: false,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorks = async (req, res, next) => {
  const { clubId } = req.params;

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    jwt.verify(token);

    const works = await Works.find({ club: clubId });

    return res.status(200).json({
      message: 'Works fetched!',
      error: false,
      data: works,
    });
  } catch (error) {
    next(error);
  }
};

export const getWork = async (req, res, next) => {
  const { workId } = req.params;
  console.log(workId);

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    jwt.verify(token);

    const work = await Works.findById(workId);

    await work.populate('handedIn');
    await work.populate('unHandedIn');

    if (!work) {
      return res.status(404).json({
        message: 'Work not found!',
        error: true,
        data: null,
      });
    }

    return res.status(200).json({
      message: 'Work fetched!',
      error: false,
      data: work,
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkAnswer = async (req, res, next) => {
  const { workId } = req.params;
  const { answer, docmentLink } = req.body;

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token);

    const workAnswer = new WorkAnswers({
      answer,
      docmentLink,
      user: decoded.id,
      work: workId,
    });

    await Works.findByIdAndUpdate(workId, {
      $push: {
        workAnswers: workAnswer._id,
        handedIn: decoded.id,
      },
      $pull: {
        unHandedIn: decoded.id,
      },
    });

    await workAnswer.save();

    return res.status(200).json({
      message: 'Work answer created!',
      error: false,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkAnswer = async (req, res, next) => {
  const { answerId } = req.params;
  const { answer, docmentLink, comments } = req.body;

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    jwt.verify(token);

    await WorkAnswers.findByIdAndUpdate(answerId, {
      answer,
      docmentLink,
      comments,
    });

    return res.status(200).json({
      message: 'Work answer updated!',
      error: false,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkAnswer = async (req, res, next) => {
  const { workId } = req.params;

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token);

    const workAnswer = await WorkAnswers.findOne({
      work: Types.ObjectId(workId),
      user: Types.ObjectId(decoded.id),
    });

    if (!workAnswer) {
      return res.status(404).json({
        message: 'Work answer not found!',
        error: true,
        data: null,
      });
    }

    return res.status(200).json({
      message: 'Work answer fetched!',
      error: false,
      data: workAnswer,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkAnswerByUser = async (req, res, next) => {
  const { workId, userId } = req.params;

  // Get token from header
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: 'You are not authorized!',
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      error: true,
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token);

    // Check if user is admin
    const club = await Clubs.findOne({
      clubAdmin: Types.ObjectId(decoded.id),
    });

    if (!club) {
      return res.status(401).json({
        message: 'You are not authorized!',
        error: true,
        data: null,
      });
    }

    const workAnswer = await WorkAnswers.findOne({
      work: Types.ObjectId(workId),
      user: Types.ObjectId(userId),
    });

    if (!workAnswer) {
      return res.status(404).json({
        message: 'Work answer not found!',
        error: true,
        data: null,
      });
    }

    return res.status(200).json({
      message: 'Work answer fetched!',
      error: false,
      data: workAnswer,
    });
  } catch (error) {
    next(error);
  }
};
