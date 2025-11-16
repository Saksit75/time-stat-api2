const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const findTeacherByUsername = async (username) => {
  return await prisma.teacher.findUnique({ where: { username } });
};

module.exports = { findTeacherByUsername };