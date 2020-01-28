const express = require('express');
const session = require('express-session');

const KnexSessionStore = require('connect-session-knex')(session);
const dbConnection = require('../database/dbConfig.js');

const apiRouter = require('./api-router.js');
const configureMiddleware = require('./configure-middleware.js');

const server = express();

const sessionConfig = {
    name: "myCookie",
    secret: process.env.SESSION_SECRET || "Keep it secret, keep it safe!",
    cookie: {
        maxAge: 1000 * 60 * 10,
        secure: false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: true,
    store: new KnexSessionStore({
        knex: dbConnection,
        tablename: "sessions",
        sidfieldname: "sid",
        createtable: true,
        clearInterval: 60000,
    }),
};

configureMiddleware(server);
server.use(session(sessionConfig));

server.use('/api', apiRouter);

module.exports = server;