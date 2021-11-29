import User from '../models/users';
import randoms from '../utils/randoms';

export default {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          error: true,
          data: null,
        });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid password',
          error: true,
          data: null,
        });
      }
      let token = '';

      // Check user admin or not
      if (user.roles.indexOf('admin') > -1) {
        token = user.generateToken(true);
      } else {
        token = user.generateToken(false);
      }

      return res.status(200).json({
        message: 'Login success',
        error: false,
        data: {
          token,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          error: true,
          data: null,
        });
      }
      const token = user.generateToken(true);
      await user.save();
      const url = `http://localhost:3000/api/v1/auth/reset/${token}`;
      const mailOptions = {
        from: '"Admin" <vuhunglcute@gmail.com>',
        to: email,
        subject: 'Reset Password',
        text: 'Reset Password',
        html: `<p>Click <a href="${url}">here</a> to reset your password</p>`,
      };
      await user.sendEmail(mailOptions);
      return res.status(200).json({
        status: 200,
        data: {
          message: 'Reset password link has been sent to your email',
        },
      });
    } catch (error) {
      return next(error);
    }
  },
  resetPasswordConfirm: async (req, res, next) => {
    try {
      const { token } = req.params;
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          error: true,
          data: null,
        });
      }

      user.password = randoms.createRandomPassword(6);
      await user.save();
      const mailOptions = {
        from: '"Admin" <vuhunglcute@gmail.com>',
        to: user.email,
        subject: 'Reset Password',
        text: 'Reset Password',
        html: `<p>Your new password is: ${user.password}</p>`,
      };
      await user.sendEmail(mailOptions);
      return res.status(200).json({
        message: 'Reset password success',
        error: false,
        data: {
          message: 'Reset password success',
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};
