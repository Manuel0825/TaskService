const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;

//sin este fichero no podremos utilizar prisma en la applicacion    
