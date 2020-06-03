const cron = require("node-cron");

const moment = require('moment-timezone');
var jwt = require('jsonwebtoken'); 

const appointmentCtrl = require('./appointment.controller');
const authCtrl = require('./auth.controller');
const config = require('../../config/config');
const emailCtrl = require('./emailer.controller');

async function getDailyAppointmentPreview() {

   let today = moment(moment().clone().format("MM-DD-YYYY"), "MM-DD-YYYY");
   let tomorrow = moment(today.clone().add(1, 'day').format("MM-DD-YYYY"), "MM-DD-YYYY")

    let docUsers = await authCtrl.getUsersByScope("doc");
    let recipientsArray = [];
    docUsers.forEach(element => {
        recipientsArray.push(element.userName);
    });
    
    let appointments = await appointmentCtrl._getAppointmentsFromDateRange(today, tomorrow).catch(err => {
        throw err;
    });

    let appointmentsArray = [];

    appointments.forEach(appointmentObj => {
        let startDate = moment(appointmentObj.appointmentObj.start);
        let displayStartDate = startDate.tz(config.timeZone).locale("de");

        let endDate = moment(appointmentObj.appointmentObj.end);
        let displayEndTime = endDate.tz(config.timeZone).locale("de");

        let item = {
            "displayStartDate" : displayStartDate.format("LLL"),
            "displayEndTime" : displayEndTime.format("LT"),
            "doc" : appointmentObj.doc.userName,
            "type" : appointmentObj.appointmentType.name
        }

        appointmentsArray.push(item);
    });   

    let displayBaseDate = today.tz(config.timeZone).locale("de");

    let emailContext = {
        "baseDate" : displayBaseDate.format('dddd MMM Do YYYY')
    };

    if (appointmentsArray.length > 0){
        emailContext["teleappointments"] = appointmentsArray;
    }
    

    await emailCtrl.sendDailyAppointmentPreview(recipientsArray, emailContext).catch(err => {
        console.error(err);
    });

    console.log("Daily preview has run...");

}

async function notifyPatientUpcomingTeleAppointment() {

    try{

        let tomorrow = moment(moment().add(1, 'day').format("MM-DD-YYYY"), "MM-DD-YYYY");
        let dayAfterTomorrow = moment(tomorrow.clone().add(2, 'day').format("MM-DD-YYYY"), "MM-DD-YYYY")
          
        let appointments = await appointmentCtrl._getAppointmentsFromDateRange(tomorrow, dayAfterTomorrow).catch(err => {
            throw err;
        });
    
        let appointmentsArray = [];
    
        for (var i = 0; i < appointments.length; i++) {
            let appointmentObj = appointments[i];
    
            if (typeof(appointmentObj.reminderSent) == "undefined"){
                await sendTeleAppointmentReminder(appointmentObj).catch(err => {
                    throw err;
                })
        
                appointmentsArray.push(appointmentObj._id);
            }        
    
        }
        
        if (appointmentsArray.length > 0){
            await appointmentCtrl.markAppointmentsAsReminded(appointmentsArray).catch(err => {
                throw err;
            })
        }
        
    }catch(err){
        console.error(err);
    }
 
 }

  function sendTeleAppointmentReminder(appointmentObject){

    return new Promise(async (resolve, reject) => {

        try{

            let appointmentId = appointmentObject._id.toString();

            let userObj = await authCtrl.getUserById(appointmentObject.userId).catch(err => {
                throw err;
            });

            if (typeof(userObj.notifications) == "undefined"){
                return resolve("User has not specified notification settings");
            }

            if(!userObj.notifications.reminderAppointments){
                return resolve("User does not wish to be notified");
            }
    
            let startDate = moment(appointmentObject.appointmentObj.start);
            let endDate = moment(appointmentObject.appointmentObj.end);
    
            let data = {
                "_id" : appointmentObject["userId"], 
                "appointmentId" : appointmentId
            };
    
            let now = moment();
    
            var token = jwt.sign(data, config.auth.jwtsec, {
                expiresIn: ((endDate.unix() - now.unix())*1000)
            });
    
            let urlBase;
    
            if (config.env == "development"){
                urlBase = config.hostProto + "://" + config.hostBase + ":" + config.hostExposedPort  + "/home?c=cancel-appointment&appointmentId="  + appointmentId  + "&token=";
            }else{
                urlBase = config.hostProto + "://" + config.hostBase + "/home?c=cancel-appointment&appointmentId="  + appointmentId  + "&token=";
            }
    
            let tokenUrl = encodeURI(urlBase + token);
    
            let displayStartDate = startDate.tz(config.timeZone).locale("de");
    
            let emailContext = {
                userEmail : userObj.userName,
                userName : userObj.name || userObj.userName,
                patientCode : appointmentObject.tele.patientCode, 
                dialInUrlPatient : appointmentObject.tele["dialInUrlPatient"], 
                appointmentDate : displayStartDate.format("LLL"), 
                appointmentType : appointmentObject.appointmentType.name, 
                docName : appointmentObject.doc.userName, 
                startDate : startDate, 
                endDate : endDate, 
                tokenUrl : tokenUrl
            }
    
            await emailCtrl.sendTeleAppointment(emailContext, true).catch(err => {
                throw err;
            });

            resolve(true);

        }catch(err){
            reject(err);
        }

    })

}


function init(){

    // the following cron jobs are scheduled based on UTC time

    // function to notify doctors in the morning about upcoming appointments at 4am UTC
    cron.schedule("0 4 * * *", getDailyAppointmentPreview);

    // function to notify patients about upcoming appointment at 8am UTC

    cron.schedule("0 8 * * *", notifyPatientUpcomingTeleAppointment);

}

module.exports = {
    init
}