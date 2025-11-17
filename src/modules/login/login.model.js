const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const findTeacherByUsername = async (username) => {
  return await prisma.teacher.findFirst({
    where: {
      username: username,
      status: "in"
    }
  });
};

module.exports = { findTeacherByUsername };