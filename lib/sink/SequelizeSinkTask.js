"use strict";

const { SinkTask } = require("kafka-connect");

class SequelizeSinkTask extends SinkTask {

    start(properties, callback, parentConfig) {

        this.parentConfig = parentConfig;
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

        //schema must be cloned, otherwise the reference would cause serious anomalies
        const clonedSchema = JSON.parse(JSON.stringify(record.valueSchema));

        this.Model = this.sequelize.define(
            this.table,
            clonedSchema,
            Object.assign({}, {
                timestamps: false,
                freezeTableName: true,
                tableName: this.table
            }, record.schemaAttributes)
        );

        return this.sequelize.sync();
    }

    putRecords(records) {
        return Promise.all(records.map(record => {

            if (record.value !== null && record.value !== "null") {
                this.parentConfig.emit("model-upsert", record.key.toString());
                return this.Model.upsert(record.value);
            }

            //if record.value is null, we will use the key to delete the field
            this.parentConfig.emit("model-delete", record.key.toString());
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