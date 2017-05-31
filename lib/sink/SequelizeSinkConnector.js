"use strict";

const { SinkConnector } = require("kafka-connect");
const Sequelize = require("sequelize");

class SequelizeSinkConnector extends SinkConnector {

    start(properties, callback) {

        this.properties = properties;

        this.sequelize = new Sequelize(properties.database,
            properties.user, properties.password,
            properties.options);

        this.sequelize.authenticate().then(() => {
            callback(null);
        }).catch(error => {
            callback(error);
        });
    }

    taskConfigs(maxTasks, callback) {

        const taskConfig = {
            maxTasks,
            sequelize: this.sequelize,
            table: this.properties.table,
            incrementingColumnName: this.properties.incrementingColumnName
        };

        callback(null, taskConfig);
    }

    stop() {
        this.sequelize.close();
    }
}

module.exports = SequelizeSinkConnector;