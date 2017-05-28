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

        this.initialisedTable = false;
        this.Model = null;

        callback(null);
    }

    beforeFirstPut(record) {

        this.Model = this.sequelize.define(
            this.table,
            record.valueSchema, {
                timestamps: false,
                freezeTableName: true,
                tableName: this.table
            });

        return this.sequelize.sync();
    }

    putRecords(records) {
        return Promise.all(records.map(record => this.Model.upsert(record.value)));
    }

    put(records, callback) {

        if (!this.initialisedTable) {
            return this.beforeFirstPut(records[0]).then(_ => {
                this.initialisedTable = true;
                return this.putRecords(records);
            }).then(() => {
                callback(null);
            }).catch(error => {
                callback(error);
            });
        }

        this.putRecords(records).then(() => {
            callback(null);
        }).catch(error => {
            callback(error);
        });
    }

    stop() {
        //empty (con is closed by connector)
    }
}

module.exports = SequelizeSinkTask;