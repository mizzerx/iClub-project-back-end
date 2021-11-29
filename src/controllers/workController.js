import Clubs from '../models/clubs';
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
