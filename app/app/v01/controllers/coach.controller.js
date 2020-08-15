

var request = require('request');

const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var profileCtrl = require('../controllers/profile.controller');

var MongoUrl = config.getMongoUrl();

const logger = require('../../../logger');


/* #### META DATA REQUESTED FROM BACKEND SERVER ### */

var questions;
/**
 * Function to acquire meta data from the analytical backend
 *  @returns {Promise<object>} Promise : questions object containing the meta data about the surveys, as well as the actionability
 */
async function _getCoachMeta(){

  return new Promise((resolve, reject) => {

    request({
        url: 'http://' + config.procBackend.host + ":" + config.procBackend.port + '/coach/meta',
        method: 'GET',
        json: true
      }, function(error, response, body) {

        try{
          if (error){
            reject(error);
          }else{
            resolve(body);
          }
        }catch(err){
          reject(err);
        }
        
    });
  });

}

(async() => {
  logger.info("_getCoachMeta is deactivated.")
  /*
  questions = await _getCoachMeta().catch(err => {
    logger.error(err);
  });
  */

})();


let questions_order = [

    { "varname" : "GZsubj1", "dependQ": []}, // Achten auf Gesundheit
    // step 3: way of life
    { "varname" : "ENobstBz1", "dependQ": []},  // Verzehr von Obst: pro Tag
    { "varname" : "ENgemBz1", "dependQ": []}, // Verzehr von Gemüse: pro Tag
    { "varname" : "AKoft12_k", "dependQ": []}, // Alkohol i.d.l. 12 Mon. in 6 Kat.
    { "varname" : "RCstat", "dependQ": []},  //  Smoking

    { "varname" : "KAehispaq2", "dependQ": []}, // Bewegung zu Fuß: Tage pro Woche
    { "varname" : "KAehispaq4", "depTriggerVal" : [0], "dependQ": [
      {"varname" : "KAgfka" , "val" : 2},
    ]}, // Bewegung mit Fahrrad: Tage pro Woche
    { "varname" : "KAspodauC_k", "dependQ": []}, // Sport pro Woche insgesamt (in 30 min kategoriesiert)
    { "varname" : "KAehispaq8", "depTriggerVal" : [0], "dependQ": [
      {"varname" : "KAgfmk" , "val" : 2},
    ]}, // Aufbau/Kräftigung: Tage pro Woche
    { "varname" : "KAgfka", "dependQ": []}, // Einhalt. aerobe WHO-Bew.empf. (mit Gehen >= 150 Min. aerobe körp. Aktiv./Wo)
    { "varname" : "KAgfa", "dependQ": []}, // >= 150 min Ausdaueraktiv.und 2 x/ Woche Aktiv. zur Muskelkräft.(Einhalt. beider WHO-Empf.)
    { "varname" : "KAgfka1", "dependQ": []}, // Einhalt. aerobe WHO-Bew.empf. (o. Gehen >= 150 Min. aerobe körp. Aktiv./Wo)
    { "varname" : "KAgfmk", "dependQ": []}, // WHO-Empf. zur Muskelkräft. (>= 2x/Wo. Aktivit. zur Muskelkräftigung)
    // step 4: health care

    { "varname" : "IAarzt_general4w", "depTriggerVal" : [2], "dependQ": [
        {"varname" : "IAarzt1B4w" , "val" : 2},
        {"varname" : "IAfa4w" , "val" : 2}
    ]}, // imputed_question: Generell einen Arzt gesehen in den letzten 4 Wochen?

    { "varname" : "IAarzt1B4w", "dependQ": []}, // Besuch Allgemeinarzt oder Hausarzt i.d.l. 4 Wochen: Anzahl
    { "varname" : "IAfa4w", "dependQ": []}, // Besuch Facharzt i.d.l. 4 Wochen: Anzahl
    { "varname" : "IAarzt8C", "dependQ": []}, // Besuch Psychologen i.d.l. 12 Mon.
    { "varname" : "IAarzt14B", "dependQ": []}, // Zahnmedizinische Untersuchung

    { "varname" : "IAkhs", "depTriggerVal" : [2], "dependQ": [
        {"varname" : "IAkhs_k" , "val" : 0}
    ]}, // Stationär im Krankenhaus i.d.l. 12 Mon.
    { "varname" : "IAkhs_k", "dependQ": []}, // Stationär im Krankenhaus i.d.l. 12 Mon.: Anzahl der Nächte (kat) --> encoded in //  of weeks
    { "varname" : "IAther2B", "dependQ": []}, // Besuch Physiotherapeuten i.d.l. 12 Mon
    { "varname" : "IApflege", "dependQ": []}, // Inanspruchnahme häuslicher Pflegedienst: I.d.l. 12 Mon.

    { "varname" : "IAtermin", "dependQ": []}, // Auf Untersuchungstermin gewartet i.d.l. 12 Mon.
    { "varname" : "IAweg", "dependQ": []}, // Untersuchung verzögert wegen Entfernung i.d.l. 12 Mon.

    { "varname" : "AUarbzD_k", "dependQ": []}, // Krankheitsbedingt nicht zur Arbeit: Wochen

    { "varname" : "AMarztB", "dependQ": []}, // Einnahme Medikamente v. Arzt verschrieben i.d.l. 2 Wo
    { "varname" : "AMfrei", "dependQ": []}, // Einnahme Medikamente nicht v. Arzt verschrieben i.d.l. 2 Wo


    { "varname" : "IPinfl4", "depTriggerVal" : [2], "dependQ": [
        {"varname" : "IPinfl6B" , "val" : 1}
    ]}, // Letzte Grippeimpfung
    { "varname" : "IPinfl6B", "dependQ": []}, // Häufigkeit Grippeimpfung, generiert
    { "varname" : "IPtet_lz", "dependQ": []}, // last tetanus vaccination --> flag cannot be used since there are only "YES" tetanus vaccinated people

    { "varname" : "IAhypus", "dependQ": []}, // Letzte Blutdruckmessung
    { "varname" : "IAcholus", "dependQ": []}, // Letzte Blutfettwertebestimmung
    { "varname" : "IAdiabus", "dependQ": []}, // Letzte Blutzuckermessung
    { "varname" : "IAkfutyp2B_lz", "dependQ": []}, // Letzter Stuhltest
    { "varname" : "IAkfutyp4B_lz", "dependQ": []}, // Letzte Darmspiegelung

    // step 5: health conditions
    // exclude as of now, since only relevant for women: "SEschwA_zz", // Schwanger zur Zeit
    { "varname" : "GZmehm2D", "dependQ": []}, // Einschränkung durch Krankheit seit mind. 6 Monaten
    { "varname" : "BBbehB", "dependQ": []}, // Amtlich anerkannte Behinderung 
    { "varname" : "SHseh1", "dependQ": []}, // Brille oder Kontaktlinsen
    { "varname" : "SHhoer1", "dependQ": []}, // Hörgerät
    { "varname" : "LQsf367C", "dependQ": []}, // Stärke Schmerzen i.d.l. 4 Wochen
    { "varname" : "LQsf368C", "dependQ": []}, // Behinderung in Alltagstätigkeiten durch Schmerzen i.d.l. 4 Wochen
    { "varname" : "flagHadAccident", "dependQ": []} , //  has had any injuries due to accidents in past 12 months

    { "varname" : "BBdors112", "dependQ": []}, // Beschwerden unterer Rücken: I.d.l.12 Mon.
    { "varname" : "BBdors212", "dependQ": []}, // Beschwerden Nacken, Halswirbelsäule: I.d.l.12 Mon.
    { "varname" : "BBblas12B", "dependQ": []}, // Harninkontinenz: I.d.l.12 Mon.
    { "varname" : "BBgehen", "dependQ": []}, // Schwierigk. beim Laufen ohne Gehhilfe auf 500m
    { "varname" : "BBtreppe", "dependQ": []}, // Schwierigk. Treppe mit 12 Stufen
    
    { "varname" : "GZmehm3C", "depTriggerVal" : [2], "dependQ": [
        {"varname" : "BBmyo12" , "val" : 2},
        {"varname" : "BBsa12" , "val" : 2},
        {"varname" : "KHcb12" , "val" : 2},
        {"varname" : "KHced12" , "val" : 2},
        {"varname" : "KHcle12" , "val" : 2},
        {"varname" : "KHniB12" , "val" : 2},
    ]}, // Chronische Krankheiten
    { "varname" : "BBmyo12", "dependQ": []}, // Chronische Beschwerden nach Herzinfarkt: I.d.l.12 Mon.
    { "varname" : "BBsa12", "dependQ": []}, // Chronische Beschw. infolge eines Schlaganfalls: I.d.l.12 Mon.
    { "varname" : "KHcb12", "dependQ": []}, // Chronische Bronchitis: I.d.l.12 Mon.
    { "varname" : "KHced12", "dependQ": []}, // Chronisch entzündliche Darmerkrankung: I.d.l.12 Mon.
    { "varname" : "KHcle12", "dependQ": []}, // Andere chronische Lebererkrankungen: I.d.l.12 Mon.
    { "varname" : "KHniB12", "dependQ": []}, // Chron. Nierenprobleme: I.d.l.12 Mon.

    { "varname" : "KHhyp", "depTriggerVal" : [2],  "dependQ": [
        {"varname" : "KHhyp12" , "val" : 2}, 
        {"varname" : "KHhyp12pB" , "val" : 2}
    ]}, // Bluthochdruck: Jemals ärztlich diagnostiziert
    { "varname" : "KHhyp12", "dependQ": []}, // Bluthochdruck: I.d.l.12 Mon.
    { "varname" : "KHhyp12pB", "dependQ": []}, // Indikator bek. (ärztl. diagn.) Bluthochdruckdruck i.d.l. 12 Mon

    { "varname" : "KHhypmedC", "dependQ": []}, // Indikator blutdrucksenkende Mittel bei bekannter Hypertonie
    { "varname" : "KHmyo12", "depTriggerVal" : [2], "dependQ": [
        {"varname" : "KHbbmyo12" , "val" : 2}
    ]}, // Herzinfarkt: I.d.l. 12 Mon.
    { "varname" : "KHbbmyo12", "dependQ": []}, // Herzinfarkt/chron. Beschw.: I.d.l. 12 Mon.
    { "varname" : "KHkhk12", "dependQ": []}, // Koronare Herzerkrankung/Angina Pectoris: I.d.l.12 Mon.
    { "varname" : "KHhi12", "dependQ": []}, // Herzinsuffizienz: I.d.l.12 Mon.
    { "varname" : "KHsa12", "dependQ": []}, // Schlaganfall: I.d.l.12 Mon.
    { "varname" : "KHdiabB12", "dependQ": []}, // Diabetes: I.d.l.12 Mon.
    { "varname" : "KHab12", "dependQ": []}, // Asthma: I.d.l.12 Mon.
    { "varname" : "KHkarz12", "dependQ": []}, // Krebserkrankung: I.d.l.12 Mon.
    { "varname" : "KHlipA", "depTriggerVal" : [2], "dependQ": [
        {"varname" : "KHlip12A" , "val" : 2}
    ]}, // Jemals erhöhte Blutfette/Cholesterinw. (Arztdiagnose)
    { "varname" : "KHlip12A", "dependQ": []}, // Erhöhte Blutfette/Chol.: I.d.l.12 Mon.
    { "varname" : "KHlipmedA", "dependQ": []}, // Erhöhtes Cholesterin: Zurzeit Medikamenteneinnahme
    { "varname" : "KHulc12", "dependQ": []}, // Magen- oder Zwölffingerdarmgeschwür: I.d.l.12 Mon.
    { "varname" : "KHlz12", "dependQ": []}, // Leberzirrhose: I.d.l.12 Mon.
    { "varname" : "KHdge12", "dependQ": []}, // Arthrose: I.d.l.12 Mon.
    { "varname" : "KHra12", "dependQ": []}, // Arthritis: I.d.l.12 Mon.
    { "varname" : "KHos12", "dependQ": []}, // Osteoporose: I.d.l.12 Mon.
    { "varname" : "KHalgi112", "dependQ": []}, // Allergien: I.d.l. 12 Mon.
    //step 6: psychological health
    { "varname" : "LQzufrB10", "dependQ": []}, // Zufriedenheit: Leben insgesamt
    { "varname" : "PKdep12", "dependQ": []}, // Depression: I.d.l. 12 Mon.
    { "varname" : "SFoslo1C", "dependQ": []}, // Nahestehende Personen
    { "varname" : "SFoslo3A", "dependQ": []}, // Erhalt von Hilfe
    { "varname" : "SFosloA", "dependQ": []} // Soziale Unterstützung (Oslo-3 Social Support Scale)
];


function autoCompleteSessionObj(sessionObj){

    let lastQuestion = sessionObj.questions[sessionObj.questions.length - 1];

    if (typeof(lastQuestion) != "undefined"){

        if (lastQuestion.varname){
            let lastQuestionIndex = questions_order.findIndex(x => x.varname == lastQuestion.varname);

            if (lastQuestionIndex > -1 && lastQuestionIndex+1 < questions_order.length){

                let lastQuestionMetaObj = questions_order[lastQuestionIndex];

                // if the last question has depencies and is answered in the defined way, then add dependent questions accordingly 

                if (lastQuestionMetaObj.depTriggerVal){
                    if (lastQuestionMetaObj.depTriggerVal.indexOf(lastQuestion.response.key) != -1){
                        lastQuestionMetaObj.dependQ.forEach(q => {
                            let qIdx = questions.findIndex(x => x.varname == q.varname);
                            if (qIdx > -1){
                                let generatedQuestion = questions[qIdx];
                                generatedQuestion["response"] = {
                                    "key" : q.val,
                                    "flagGenerated" : true
                                }
                                sessionObj.questions.push(generatedQuestion)
                            }else{
                                logger.info("Question should be imputed but not found: " + q.varname)
                            }

                        });
                    }
                }

            }
            
        }


    }

    // bin the age based on birthdate
    return sessionObj;

}

function getNextQuestion(sessionObj){

    if (typeof(sessionObj.questions) == "undefined"){
        sessionObj.questions = [];
    }

    sessionObj = autoCompleteSessionObj(sessionObj);

    let nextQuestionIdx = 0;
    let lastQuestion = sessionObj.questions[sessionObj.questions.length - 1];

    if (typeof(lastQuestion) != "undefined"){
        if (lastQuestion.varname){
            let lastQuestionIndex = questions_order.findIndex(x => x.varname == lastQuestion.varname);
            nextQuestionIdx = lastQuestionIndex+1;
        }
    }

    if (nextQuestionIdx < questions_order.length){

        let nextQuestionVarName = questions_order[nextQuestionIdx];

        let nextQuestionObjIdx = questions.findIndex(x => x.varname == nextQuestionVarName.varname);
    
        let nextQuestionObj = questions[nextQuestionObjIdx];
    
        let progress = Math.round((nextQuestionIdx/questions_order.length)*100)/100;

        sessionObj.nextQuestion = nextQuestionObj;
        sessionObj.complete = false;
        sessionObj.progress = progress;
    }else{
        sessionObj.nextQuestion = null;
        sessionObj.complete = true;
        sessionObj.progress = 1;
    }

    return sessionObj;

}

function _bin_age5B(age){

  let res_bin = null;
  let b = 0;

  let bins = [
    {
      "k" : 1,
      "l" : 0, 
      "u" : 19 
    },
    {
      "k" : 10,
      "l" : 60, 
      "u" : 64 
    },
    {
      "k" : 11,
      "l" : 65, 
      "u" : 69 
    },
    {
      "k" : 12,
      "l" : 70, 
      "u" : 74 
    },
    {
      "k" : 13,
      "l" : 75, 
      "u" : 79 
    },
    {
      "k" : 14,
      "l" : 80, 
      "u" : 84 
    },
    {
      "k" : 15,
      "l" : 85, 
      "u" : 89 
    },
    {
      "k" : 16,
      "l" : 90, 
      "u" : 3000 
    },
    {
      "k" : 2,
      "l" : 20, 
      "u" : 24 
    },
    {
      "k" : 3,
      "l" : 25, 
      "u" : 29 
    },
    {
      "k" : 4,
      "l" : 30, 
      "u" : 34 
    },
    {
      "k" : 5,
      "l" : 35, 
      "u" : 39 
    },
    {
      "k" : 6,
      "l" : 40, 
      "u" : 44 
    },
    {
      "k" : 7,
      "l" : 45, 
      "u" : 49 
    },
    {
      "k" : 8,
      "l" : 50, 
      "u" : 54 
    },
    {
      "k" : 9,
      "l" : 55, 
      "u" : 59 
    }
  ]

  while (!res_bin || b+1<bins.length){
    if (bins[b].l<=age && age <= bins[b].u ){
      res_bin = bins[b].k;
    }
    b++;
  }

  return res_bin;

}

function _bin_KAspodauC_k(val){
  return parseFloat(val/30).toFixed();
}

function createInputVector(userObj, sessionObj){
  
  let inputVector = {};

  if (typeof(userObj.birthdate) != "undefined"){
    let userAge = Math.round((new Date() - new Date(userObj.birthdate))/31536000000);
    inputVector["age5B"] = _bin_age5B(userAge);
  }

  Object.keys(userObj).forEach(element => {
    if (!Array.isArray(userObj[element])){
      inputVector[element] = userObj[element];
    }
  });

  sessionObj.questions.forEach(element => {

    if (element == '_bin_KAspodauC_k'){
      inputVector[element.varname] =  _bin_KAspodauC_k(element.response.value)
    }else{

      if (typeof((element.response.key)) != "undefined"){
        inputVector[element.varname] = element.response.key;
      }else if (typeof((element.response.value)) != "undefined"){
        inputVector[element.varname] = element.response.value;
      }else{
        inputVector[element.varname] = null;
      }

    }

      
  });

  return inputVector;
}

/**
 * Accessing the model API to retrieve the evaluation of the model
 * @param {*} sessionObj 
 * @returns {Promise<object>} Promise : evaluationObj containing the information about the evaluated input vector (e.g. score, predicted class)
 */
async function getWellbeingEvaluation(userId, sessionObj){

  return new Promise(async(resolve, reject) => {

    let userObj = await profileCtrl.asyncGetUserProfile(userId);

    let inputVector = createInputVector(userObj, sessionObj);

    let requestBody = {
        "inputVector": inputVector
    };

    request({
        url: 'http://' + config.procBackend.host + ":" + config.procBackend.port + '/coach',
        method: 'POST',
        body: requestBody,
        json: true
      }, function(error, response, body) {

        try{

          let response = {
            "score" : body["GZmehm01_score"], 
            "evalDate" : body["evalDate"], 
            "evalDetails" : body["evalDetails"], 
            "suggestions" : body["suggestions"], 
            "inputVector" : inputVector
          };

          resolve(response);
        }catch(err){
          reject(err);
        }
        
    });
  });

}

async function storeSession(userId, inSessionObj){
  // make a deep copy which can be stored, so that ID is not modified
  let sessionObj = JSON.parse(JSON.stringify(inSessionObj));

  sessionObj.userId = userId;
  let sessId;

  if (sessionObj._id){
    sessId = sessionObj._id;
    delete sessionObj._id
  }

  if (sessionObj.evaluation){
    let date = new Date();
    if (typeof(sessionObj.evaluation["evalDate"]) == "undefined"){
      date = new Date(sessionObj.evaluation["evalDate"])
    }
    sessionObj.evaluation["evalDate"] = date;
  }

 return new Promise ((resolve, reject) => {
  try{

      MongoClient.connect(MongoUrl, function(err, db) {

          if (err) throw err;

          
          
          let dbo = db.db(config.mongodb.database);

          const collection = dbo.collection('coach');

          var cb = function(err, docs){
            if (err){
            logger.error(err);
            reject(err);
            }else{
              resolve(docs);
            logger.info("Session stored for userId | " + userId)
            }
              
          };

          if (sessId){
            collection.replaceOne(
              {"_id" : ObjectID(sessId)},
              sessionObj,
                cb
            );
          }else{
            collection.insertOne(
              sessionObj,
                cb
            );
          }
              
        });

  }catch(error){
      logger.error("Something went wrong storing the session for userId | " + userId)
  }

 })

}

function getSessions(req, res){
  let userId = req.userId;

  try{

    MongoClient.connect(MongoUrl, function(err, db) {

          if (err) throw err;
          
          let dbo = db.db(config.mongodb.database);

          const collection = dbo.collection('coach');

          collection.find({
            "userId" : userId
          }).sort( { date: -1 } ).toArray(function(error, result){
              if (error){
                  throw err;
              }
              res.json(result)
          });
              
        });

  }catch(error){
      logger.error(error.stack);
      res.send(403, "Something went wrong getting the sessions.");
  }
}

function _getSessionObj(userId, sessionId){
  return new Promise((resolve, reject) => {

    try{

      MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
  
            const collection = dbo.collection('coach');
  
            collection.findOne({
              "userId" : userId, 
              "_id" : ObjectID(sessionId)
            }, function(error, result){
                if (error){
                  reject(err);
                }else{
                  resolve(result);
                }
            });
          });
  
    }catch(error){
        logger.error(error.stack);
        reject(error);
    }
  })
}

async function loadSession(req, res){
  let userId = req.userId;
  let sessionId = req.params.sessionId;

  let flagReEvaluate = req.query.reevaluate;

  try{

    let sessionObj = await _getSessionObj(userId, sessionId).catch(err => {
      throw err;
    });

    if (flagReEvaluate){
      
      let evaluation = await getWellbeingEvaluation(userId, sessionObj).catch(err => {
        flagValidEval = false;
        error = err;
      });

      sessionObj.evaluation = evaluation;

      let s = await storeSession(userId, sessionObj).catch(err => {
        throw err;
      });

      res.json(sessionObj);

    }else{
      res.json(sessionObj);
    }
  }catch(err){
    res.send(403, "Something went wrong getting the sessions.");
  }


}

function deleteSession(req, res){

  let userId = req.userId;
  let sessionId = req.params.sessionId;

  try{

    MongoClient.connect(MongoUrl, function(err, db) {

          if (err) throw err;
          
          let dbo = db.db(config.mongodb.database);

          const collection = dbo.collection('coach');

          collection.remove({
            "userId" : userId, 
            "_id" : ObjectID(sessionId)
          }, function(error, result){
              if (error){
                  throw err;
              }
              res.json({"msg" : "OK"})
          });
              
        });

  }catch(error){
      logger.error(error.stack);
      res.send(403, "Something went wrong removing the session.");
  }

}


module.exports = {
    getNextQuestion, 
    getWellbeingEvaluation, 
    storeSession, 
    getSessions,
    loadSession, 
    deleteSession
}