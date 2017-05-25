"use strict";

const {Converter} = require("kafka-connect");

class JsonConverter extends Converter {

    fromConnectData(data, callback){
        const messageValue = JSON.stringify(data);
        callback(null, messageValue);
    }

    toConnectData(message, callback){
        message.value = JSON.parse(message.value);
        callback(null, message);
    }
}

module.exports = JsonConverter;