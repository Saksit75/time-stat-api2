const loginService = require('./login.service');

const userLogin = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const login = await loginService.userLogin(username, password);

    res.status(200).json({
      success: true,
      message: 'Login successfully',
      data: {
        access_token: login.access_token,
        user: {
          id: login.id,
          username: login.username,
          role: login.role,
        },
      },
    });

  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      errors: err.errors || [{ field: 'server', message: 'Internal Server Error' }],
    });
  }
};

module.exports = { userLogin };
