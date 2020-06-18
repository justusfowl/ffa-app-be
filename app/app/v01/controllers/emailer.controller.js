const config = require('../../config/config');
const path = require('path');
var moment = require("moment");
const ical = require('ical-generator');

var nodeMailer = require("nodemailer");
var hbs = require('nodemailer-express-handlebars');

const logger = require('../../../logger');

var transporter = nodeMailer.createTransport({
    host:  config.email.smtpServer,
    secure: false, 
    auth: {
      user: config.email.smtpEmail,
      pass: config.email.smtpPass
    },
    tls: {rejectUnauthorized: false},
    debug: true
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
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : userName, 
            subject : "myFFA | Account-Aktivierung" , 
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

function sendForgotPasswordEmail (userName, tokenUrl) {

    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : userName, 
            subject : "myFFA | Passwort-Reset" , 
            template: 'forgotPassword',
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

function sendGeneralAutoReply (userName, email, messageText, medicationsArray = [], 
    flagCollectFromPractice=false, collectDrugStore="", subject="Eingang | Wir haben Ihre Nachricht erhalten") {

    return new Promise((resolve, reject) => {

        var flagHasMedication = false;

        if (Array.isArray(medicationsArray)){
            if (medicationsArray.length > 0){
                flagHasMedication = true;
            }
        }

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : email, 
            subject :  subject, 
            template: 'generalAutoReply',
            context: {
                "userName": userName, 
                "messageText" : messageText, 
                "flagHasMedication" : flagHasMedication, 
                "medications" : medicationsArray, 
                "flagCollectFromPractice" : flagCollectFromPractice,
                "collectDrugStore" : collectDrugStore
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

function sendVacationAutoReply (userName, email, messageText, vacationObject, 
    medicationsArray = [], flagCollectFromPractice=false, collectDrugStore="", subject="Eingang und Urlaubsnotiz | Wir haben Ihre Nachricht erhalten") {

    return new Promise((resolve, reject) => {

        var flagHasSubs = false;
        var flagHasMedication = false;

        if (Array.isArray(medicationsArray)){
            if (medicationsArray.length > 0){
                flagHasMedication = true;
            }
        }

        if (vacationObject.subs){
            if (vacationObject.subs.length > 0){
                flagHasSubs = true;
            }
        }


        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : email, 
            subject : subject , 
            template: 'vacationAutoReply',
            context: {
                "userName": userName, 
                "messageText" : messageText, 
                "substitutes" : vacationObject.subs,
                "flagHasSubs" : flagHasSubs,
                "vacationEndDate" : new Date(vacationObject.vacationEnd).toDateString(), 
                "flagHasMedication" : flagHasMedication, 
                "medications" : medicationsArray, 
                "flagCollectFromPractice" : flagCollectFromPractice,
                "collectDrugStore" : collectDrugStore
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

function sendMessageToBackOffice (contextObj) {

    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : config.email.backofficeEmailReceiver, 
            subject : "myFFA | Eingang einer Nachricht über die Website" , 
            template: 'backofficeGeneral',
            context: contextObj
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

function sendPasswordWasResetEmail(contextObj){
    
    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail,  
            to : contextObj.userName, 
            subject : "myFFA | Passwort-Reset" , 
            template: 'forgotPasswordSuccess',
            context: contextObj
        }

        transporter.sendMail(options, function (err, info){
            if (err){
                reject(err); 

            }else{
                resolve(info);
            }
        })

    });
}

function sendPreRegistrationEmail (userName, tokenUrl) {

    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : userName, 
            subject : "myFFA | Account-Aktivierung" , 
            template: 'preregistrationWelcome',
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

function sendTeleAppointment (contextObj, reminder=false) {

    if (contextObj.docName == 'Egal'){
        contextObj.docName = "einem unserer Fachärzte*innen"
    }

    contextObj["reminder"] = reminder;

    let template = 'teleAppointment';
    let subject = "myFFA | Ihre Video-Konsultation";

    if (reminder){
        subject = "myFFA | Erinnerung: Ihre Video-Konsultation steht an";
    }

    let domain = config.email.smtpEmail.substring(config.email.smtpEmail.indexOf("@")+1, config.email.smtpEmail.length);

        const cal = ical({
            domain: domain,
            prodId: {company: domain, product: 'ical-generator'},
            timezone: config.timeZone
        });

        const event = cal.createEvent({
            start: contextObj.startDate,
            end: contextObj.endDate,
            timestamp: moment(),
            summary: 'Ihre Video-Konsultation (' + contextObj.appointmentType + ') mit ' + contextObj.docName,
            organizer: config.email.smtpEmailSenderName + ' <' + config.email.smtpEmail + ">", 
            location : contextObj.dialInUrlPatient, 
            htmlDescription : '<html><bod><p><h4><a href="' + contextObj.dialInUrlPatient + '">Konsultation starten</a></h4></p><p>Ihr Praxis-Team</p></body></html>'
        });
       
        const alarm = event.createAlarm({type: 'audio', trigger: 300});
        const category = event.createCategory({name: 'APPOINTMENT'});

    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : contextObj.userEmail, 
            subject : subject , 
            template: template,
            context: contextObj
        }

        if (!reminder){
            options["icalEvent"] = {
                filename: 'tele-consult.ics',
                method: 'request',
                content: cal.toString()
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

function sendAdminRemoveTeleAppointment (contextObj) {

    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : contextObj.userEmail, 
            subject : "myFFA | Absage Termin Video-Sprechstunde" , 
            template: 'adminCancelTeleAppointment',
            context: contextObj
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

function testEmail (req, res){
    let email = req.query.email;
    if (!email){
        return res.send(500, "Email missing");
    }
    testEmailOut(email, "Test").then(result => {
        res.json({"message" : "OK"})
    }).catch(err => {
        logger.error(err); 
        return res.send(500, err);
    })
}

function testEmailOut (userName, tokenUrl) {

    return new Promise((resolve, reject) => {

        let domain = config.email.smtpEmail.substring(config.email.smtpEmail.indexOf("@")+1, config.email.smtpEmail.length)

        const cal = ical({
            domain: domain,
            prodId: {company: domain, product: 'ical-generator'},
            timezone: config.timeZone
        });

        const event = cal.createEvent({
            start: moment().add(15, 'minutes'),
            end: moment().add(15, 'minutes'),
            timestamp: moment(),
            summary: 'Ihre Video-Konsultation',
            organizer: config.email.smtpEmailSenderName + ' <' + config.email.smtpEmail + ">"
        });
       
        const alarm = event.createAlarm({type: 'audio', trigger: 300});
        const category = event.createCategory({name: 'APPOINTMENT'});
        
        logger.info(cal.toString())

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : userName, 
            subject : "myFFA | Account-Aktivierung" , 
            template: 'test',
            context: {
                "userName": userName, 
                "activateUrl" : tokenUrl
            }, 
            icalEvent: {
                filename: 'tele-consult.ics',
                method: 'request',
                content: cal.toString()
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

function sendDailyAppointmentPreview (recipientsArray, contextObj) {

    return new Promise((resolve, reject) => {

        let options = {
            from : '"' + config.email.smtpEmailSenderName + '" ' + config.email.smtpEmail, 
            to : recipientsArray, 
            subject : "myFFA | Heutige Video-Sprechstunden" , 
            template: 'dailyPreviewTeleAppointments',
            context: contextObj
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
    sendValidateAccountEmail, 
    sendGeneralAutoReply,
    sendVacationAutoReply, 
    sendMessageToBackOffice, 
    sendForgotPasswordEmail,
    sendPasswordWasResetEmail, 
    sendPreRegistrationEmail,
    sendTeleAppointment,
    sendAdminRemoveTeleAppointment,

    sendDailyAppointmentPreview,

    testEmail
}