"use strict";

const SequelizeSourceConfig = require("./lib/SequelizeSourceConfig.js");
const SequelizeSinkConfig = require("./lib/SequelizeSinkConfig.js");

const SequelizeSourceConnector = require("./lib/source/SequelizeSourceConnector.js");
const SequelizeSinkConnector = require("./lib/sink/SequelizeSinkConnector.js");

const SequelizeSourceTask = require("./lib/source/SequelizeSourceTask.js");
const SequelizeSinkTask = require("./lib/sink/SequelizeSinkTask.js");

const JsonConverter = require("./lib/utils/JsonConverter.js");
const ConverterFactory = require("./lib/utils/ConverterFactory.js");

const runSourceConnector = (properties, converters = [], onError = null) => {

    const config = new SequelizeSourceConfig(properties,
        SequelizeSourceConnector,
        SequelizeSourceTask, [JsonConverter].concat(converters));

    if (onError) {
        config.on("error", onError);
    }

    return config.run().then(() => {
        return config;
    });
};

const runSinkConnector = (properties, converters = [], onError = null) => {

    const config = new SequelizeSinkConfig(properties,
        SequelizeSinkConnector,
        SequelizeSinkTask, [JsonConverter].concat(converters));

    if (onError) {
        config.on("error", onError);
    }

    return config.run().then(() => {
        return config;
    });
};

module.exports = {
    runSourceConnector,
    runSinkConnector,
    ConverterFactory
};