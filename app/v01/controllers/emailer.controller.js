/**
 * Created by olyjosh on 29/06/2017.
 */

const config = require('../../config/config');
const path = require('path');

var sender = 'smtps://' + config.email.smtpEmail // youremailAddress%40gmail.com'   // The emailto use in sending the email
//(Change the @ symbol to %40 or do a url encoding )
var password = config.email.smtpPass  // password of the email to use

var nodeMailer = require("nodemailer");
var hbs = require('nodemailer-express-handlebars');

var transporter = nodeMailer.createTransport({
    host:  config.email.smtpServer,
    secure: false, 
    auth: {
      user: config.email.smtpEmail,
      pass: config.email.smtpPass
    },
    tls: {rejectUnauthorized: false},
    debug:true
  });

const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve(__dirname, '../templates/') ,
        layoutsDir: path.resolve(__dirname, '../templates/') ,
        defaultLayout: '',
    },
    viewPath: path.resolve(__dirname, '../templates/') ,
    extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));


function sendValidateAccountEmail (userName, tokenUrl) {

    return new Promise((resolve, reject) => {

        let options = {
            from : config.email.smtpEmail, 
            to : userName, 
            subject : "Account-Aktivierung" , 
            template: 'accountActivation',
            context: {
                "userName": userName, 
                "activateUrl" : tokenUrl
            }
        }

        transporter.sendMail(options, function (err, info){
            if (err){
                reject(err); 

            }else{
                resolve(info);
            }
        })

    });
   
};

module.exports = {
    sendValidateAccountEmail
}