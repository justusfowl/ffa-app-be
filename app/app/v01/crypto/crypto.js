'use strict';

const config = require('../../config/config');
var CryptoJS = require('crypto-js');
var AES = require("crypto-js/aes");
var logger = require('../../../logger');

function encrypt (val){

    val = val.toString();

    let encrypted = AES.encrypt(val, config.appSecret.encryptionKey.toString()).toString();

    return encrypted;
}

function decrypt (val){
    try{
        return AES.decrypt(val, config.appSecret.encryptionKey.toString()).toString(CryptoJS.enc.Utf8);
    }catch(err){
        logger.error(err);
        return "";
    }
    
}

module.exports = {
    encrypt,
    decrypt
}