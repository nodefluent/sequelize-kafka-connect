"use strict";

const { Converter } = require("kafka-connect");

class JsonConverter extends Converter {

    fromConnectData(data, callback) {
        callback(null, data); //no action required, as we produce objects directly
    }

    toConnectData(message, callback) {
        try {
            message.value = JSON.parse(message.value);
            callback(null, message);
        } catch (error) {
            callback(error);
        }
    }
}

module.exports = JsonConverter;