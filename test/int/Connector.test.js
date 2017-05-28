"use strict";

const assert = require("assert");
const Sequelize = require("sequelize");
const { runSourceConnector, runSinkConnector } = require("./../../index.js");
const sinkProperties = require("./../sink-config.js");
const sourceProperties = require("./../source-config.js");

describe("Connector INT", function() {

    describe("Source", function() {

        let config = null;
        let error = null;

        it("should be able to run sequelize source config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSourceConnector(sourceProperties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few pollings", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 1500);
        })

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 500);
        });
    });

    describe("Sink", function() {

        before((done) => {
            const { database, options, user, password, table } = sinkProperties.connector;
            const sequelize = new Sequelize(database, user, password, options);
            sequelize.query(`DROP TABLE IF EXISTS ${table}`)
                .catch(error => console.log(error))
                .then(() => {
                    sequelize.close();
                    done();
                });
        });

        let config = null;
        let error = null;

        it("should be able to run sequelize sink config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSinkConnector(sinkProperties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few message puts", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 1500);
        })

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 500);
        });

        it("should see table data", function() {
            const { database, options, user, password, table } = sinkProperties.connector;
            const sequelize = new Sequelize(database, user, password, options);
            return sequelize.query(`SELECT * FROM ${table}`)
                .then(([results]) => {
                    console.log(results);
                    assert.equal(results.length, 2);
                    sequelize.close();
                    return true;
                });
        });
    });
});