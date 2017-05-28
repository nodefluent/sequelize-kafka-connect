#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const { runSourceConnector } = require("./../index.js");
const pjson = require("./../package.json");
const loadConfig = require("./../config/loadConfig.js");

program
    .version(pjson.version)
    .option("-c, --config [string]", "Path to Config (alternatively)")
    .option("-k, --kafka [string]", "Zookeeper Connection String")
    .option("-n, --name [string]", "Kafka Client Name")
    .option("-t, --topic [string]", "Kafka Topic to Produce to")
    .option("-a, --partitions [integer]", "Amount of Kafka Topic Partitions")
    .option("-h, --db_host [string]", "Database Host")
    .option("-l, --dialect [string]", "Database dialect (mysql, sqlite, mssql, postgres)")
    .option("-b, --db_db [string]", "Database Database")
    .option("-p, --db_port [string]", "Database Port")
    .option("-u, --db_user [string]", "Database User")
    .option("-p, --db_pass [string]", "Database Password")
    .option("-d, --datastore [string]", "Tablename of the Source")
    .option("-f, --ifield [string]", "Table Identifier Fieldname")
    .option("-v, --interval [integer]", "Table poll interval (ms)")
    .option("-o, --max_pollcount [integer]", "Max row count per poll action")
    .option("-q, --sqlite_storage [string]", "SQlite3 DB Storage path (absolute)")
    .parse(process.argv);

const config = loadConfig(program.config);

if (program.kafka) {
    config.kafka.zkConStr = program.kafka;
}

if (program.name) {
    config.kafka.clientName = program.name;
}

if (program.topic) {
    config.topic = program.topic;
}

if (program.partitions) {
    config.partitions = program.partitions;
}

if (program.db_host) {
    config.connector.options.host = program.db_host;
}

if (program.db_db) {
    config.connector.database = program.db_db;
}

if (program.db_port) {
    config.connector.options.port = program.db_port;
}

if (program.db_user) {
    config.connector.user = program.db_user;
}

if (program.db_pass) {
    config.connector.password = program.db_pass;
}

if (program.datastore) {
    config.connector.table = program.datastore;
}

if (program.ifield) {
    config.connector.incrementingColumnName = program.ifield;
}

if (program.interval) {
    config.pollInterval = program.interval;
}

if (program.max_pollcount) {
    config.connector.maxPollCount = program.max_pollcount;
}

if (program.sqlite_storage) {
    config.connector.options.storage = program.sqlite_storage;
}

if (program.dialect) {
    config.connector.options.dialect = program.dialect;
}

runSourceConnector(config, [], console.log.bind(console)).then(sink => {

    const exit = (isExit = false) => {
        sink.stop();
        if (!isExit) {
            process.exit();
        }
    };

    process.on("SIGINT", () => {
        exit(false);
    });

    process.on("exit", () => {
        exit(true);
    });
});