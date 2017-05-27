"use strict";

const { SourceConnector } = require("kafka-connect");
const Sequelize = require("sequelize");

class SequelizeSourceConnector extends SourceConnector {

    start(properties, callback) {

        this.properties = properties;

        this.sequelize = new Sequelize(properties.database,
            properties.user, properties.password,
            properties.options);

        this.sequelize.authenticate().then(() => {
            callback(null);
        }).catch(error => {
            console.log(error);
            callback(error);
        });
    }

    taskConfigs(maxTasks, callback) {

        const taskConfig = {
            maxTasks,
            sequelize: this.sequelize,
            table: this.properties.table,
            maxPollCount: this.properties.maxPollCount,
            incrementingColumnName: this.properties.incrementingColumnName
        };

        callback(null, taskConfig);
    }

    stop() {
        this.sequelize.close();
    }
}

module.exports = SequelizeSourceConnector;