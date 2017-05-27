"use strict";

const assert = require("assert");
const { runSourceConnector, runSinkConnector } = require("./../../index.js");
const properties = require("./../test-config.js");

describe("Connector INT", function() {

    describe("Source", function() {

        let config = null;
        let error = null;

        it("should be able to run sequelize source config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSourceConnector(properties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few pollings", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        })

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 500);
        });
    });

    describe("Sink", function() {

        let config = null;
        let error = null;

        it("should be able to run sequelize sink config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSinkConnector(properties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few message puts", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        })

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 500);
        });
    });
});