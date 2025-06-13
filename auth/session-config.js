const session = require("express-session");
const prisma = require("../prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// Initialize prisma client in a separate file
const sessionConfig = session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // ms, 1 week
  },
  secret: process.env.SESSION_SECRET || "a silly secret",
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, //ms, 2 minutes
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
});

module.exports = sessionConfig;
