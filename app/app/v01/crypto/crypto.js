'use strict';

const config = require('../../config/config');
var CryptoJS = require('crypto-js');
var AES = require("crypto-js/aes");

function encrypt (val){

    val = val.toString();

    let encrypted = AES.encrypt(val, config.appSecret.encryptionKey.toString()).toString();

    return encrypted;
}

function decrypt (val){
    
    return AES.decrypt(val, config.appSecret.encryptionKey.toString()).toString(CryptoJS.enc.Utf8);
}

module.exports = {
    encrypt,
    decrypt
}