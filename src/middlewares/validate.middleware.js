const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // error.issues เป็น array ของแต่ละ validation error
        const errorMessages = error.issues.map(err => ({
          path: err.path.join('.') || 'unknown',
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: errorMessages
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
          errors: [{ field: 'server', message: error.message }]
        });
      }
    }
  };
};
module.exports = { validate };
