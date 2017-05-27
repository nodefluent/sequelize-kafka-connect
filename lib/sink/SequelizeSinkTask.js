"use strict";

const { SinkTask } = require("kafka-connect");

class SequelizeSinkTask extends SinkTask {

    start(properties, callback) {

        this.properties = properties;
        const {
            sequelize,
            maxTasks,
            table,
            incrementingColumnName
        } = this.properties;

        this.sequelize = sequelize;
        this.maxTasks = maxTasks;
        this.table = table;
        this.incrementingColumnName = incrementingColumnName;

        //TODO check if table exists or create it

        callback(null);
    }

    put(records, callback) {
        //upserts list of SinkRecords into table
        //retries on first fails
        //finally emits specific error to stop offset commits

        console.log(records);
        //TODO evalute schema of table

        callback(null);
    }

    stop() {
        //empty (con is closed by connector)
    }
}

module.exports = SequelizeSinkTask;