const path = require('path');
const pino = require('pino');
const { multistream } = require('pino-multi-stream');
const rfs = require('rotating-file-stream');

const axios = require('axios');

const dotenv = require('dotenv-flow');

const Sequelize = require('sequelize');
const Web3 = require('web3');
const fs = require('fs');

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

if (!process.env.MYSQL_DB_NAME) {
    console.log('Error: Missing database name!');
    process.exit(1);
}

if (!process.env.MYSQL_HOST) {
    console.log('Error: Missing database host!');
    process.exit(1);
}

if (!process.env.MYSQL_USER) {
    console.log('Error: Missing database username!');
    process.exit(1);
}

if (!process.env.MYSQL_PORT) {
    process.env.MYSQL_PORT = 3306;
}

// Initialize logger
let logger = {};

// Under server environment
let appLogStream = rfs.createStream('app.log', {
    interval: '1d',
    path: path.join(__dirname, '../logs')
});

let streams = [{ level: 'debug', stream: process.stdout }, // default log level is info, if level is not assigned
{ stream: appLogStream }];

logger = pino({
    name: 'uniqueone',
    prettyPrint: true,
    level: LOG_LEVEL
}, multistream(streams));

// Initialize web3
const WEB3_PROVIDER_URL = process.env.WEB3_PROVIDER_URL;
const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER_URL));

// Initialize Database connection
const sequelize = new Sequelize(process.env.MYSQL_DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: msg => logger.debug(msg),
    logging: console.log
});

logger.info('[tll][admin] Loaded.');

module.exports = {
    web3: web3,
    logger: logger,
    sequelize: sequelize,
    axios: axios

};