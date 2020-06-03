const cron = require("node-cron");

const moment = require('moment-timezone');


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



function init(){

    // function to notify patients about upcoming appointment at 4am UTC
    cron.schedule("0 4 * * *", getDailyAppointmentPreview);

    // function to notify doctors in the morning about upcoming appointments

    // function to send up updates / newsletter to patients that accepted 


}

module.exports = {
    init
}