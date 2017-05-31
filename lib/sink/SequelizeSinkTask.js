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
        this.incrementingColumnName = incrementingColumnName || "id";

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
        return Promise.all(records.map(record => {

            if (record.value !== null && record.value !== "null") {
                return this.Model.upsert(record.value);
            }

            //if record.value is null, we will use the key to delete the field
            return this.Model.destroy({
                where: {
                    [this.incrementingColumnName]: record.key.toString()
                }
            });
        }));
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