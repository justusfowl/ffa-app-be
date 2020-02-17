

var request = require('request');

const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var profileCtrl = require('../controllers/profile.controller');

var MongoUrl = config.getMongoUrl();

let questions = [
    {
      "varname": "AKoft12_k",
      "q_de": "Wie oft trinken Sie Alkohol?",
      "q_en": "How often do you consume alcohol?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Daily",
          "display_de": "Täglich"
        },
        {
          "val": 2,
          "display_en": "Weekly",
          "display_de": "Wöchentlich"
        },
        {
          "val": 5,
          "display_en": "Monthly",
          "display_de": "Monatlich"
        },
        {
          "val": 7,
          "display_en": "Less than monthly",
          "display_de": "Weniger als monatlich"
        },
        {
          "val": 8,
          "display_en": "No more alcohol consumption",
          "display_de": "Kein Alkoholkonsum mehr"
        },
        {
          "val": 9,
          "display_en": "No alcohol consumption",
          "display_de": "Kein Alkoholkonsum"
        }
      ]
    },
    {
      "varname": "AMarztB",
      "q_de": "Haben Sie in den letzten zwei Wochen Medikamente eingenommen, die vom Arzt verschrieben wurden?",
      "q_en": "Did you take medications that have been prescribed by a doctor within the last two weeks?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "AMfrei",
      "q_de": "Freie Präparate: Haben Sie in den letzten zwei Wochen Medikamente eingenommen, die nicht vom Arzt verschrieben wurden?",
      "q_en": "OTC Medication: Did you take medications that have not been prescribed by a doctor within the last two weeks?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "AUarbzD_k",
      "q_de": "Wie viele Wochen im letzten Jahr sind Sie krankheitsbedingt beruflich ausgefallen?",
      "q_en": "How many weeks last year did you miss work due to illness?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 53,
        "step": 1
      }
    },
    {
      "varname": "BBbehB",
      "q_de": "Haben Sie eine amtlich anerkannte Behinderung?",
      "q_en": "Do you have an officially recognized disability?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "BBblas12B",
      "q_de": "Litten Sie in den leztten 12 Monaten unter Harninkontinenz?",
      "q_en": "Have you suffered from urinary incontinence in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "BBdors112",
      "q_de": "Hatten Sie in den letzten 12 Monaten Beschwerden im unteren Rücken?",
      "q_en": "Have you had lower back pain in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "BBdors212",
      "q_de": "Hatten Sie in den letzten 12 Monaten Beschwerden im Nacken / Halswirbelsäule?",
      "q_en": "Have you had  neck, cervical spin pain in the last 12 months? ",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "BBgehen",
      "q_de": "Haben Sie Schwierigkeiten beim Laufen ohne Gehhilfe auf 500m?",
      "q_en": "Do you have difficulty walking without a walking aid at 500m?",
      "type": "select",
      "meta": [
        {
          "val": 4,
          "display_en": "It is not possible for me / I'm not capable of doing",
          "display_de": "Es ist mir nicht möglich/Ich bin dazu nicht in der Lage"
        },
        {
          "val": 3,
          "display_en": "Great difficulties",
          "display_de": "Große Schwierigkeiten"
        },
        {
          "val": 1,
          "display_en": "No difficulties",
          "display_de": "Keine Schwierigkeiten"
        },
        {
          "val": 2,
          "display_en": "some difficulties",
          "display_de": "Einige Schwierigkeiten"
        }
      ]
    },
    {
      "varname": "BBmyo12",
      "q_de": "Haben Sie chronische Beschwerden nach einem Herzinfarkt innerhalb der letzten 12 Monate?",
      "q_en": "Do you have chronic complaints after a heart attack within the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "BBsa12",
      "q_de": "Haben Sie chronische Beschwerden nach einem Schlaganfall innerhalb der letzten 12 Monate?",
      "q_en": "Do you have chronic complaints after a stroke within the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "BBtreppe",
      "q_de": "Haben Sie Schwierigkeiten, eine Treppe mit mehr als 12 Stufen heraufzusteigen?",
      "q_en": "Do you have difficulty climbing stairs with more than 12 steps?",
      "type": "select",
      "meta": [
        {
          "val": 3,
          "display_en": "Great difficulties",
          "display_de": "Große Schwierigkeiten"
        },
        {
          "val": 2,
          "display_en": "some difficulties",
          "display_de": "Einige Schwierigkeiten"
        },
        {
          "val": 1,
          "display_en": "No difficulties",
          "display_de": "Keine Schwierigkeiten"
        },
        {
          "val": 4,
          "display_en": "It is not possible for me / I'm not capable of doing",
          "display_de": "Es ist mir nicht möglich/Ich bin dazu nicht in der Lage"
        }
      ]
    },
    {
      "varname": "ENgemBz1",
      "q_de": "Verzehr von Gemüse: Wie viel Portionen Gemüse essen Sie pro Tag?",
      "q_en": "Consumption of vegetables: How many portions of vegetables do you eat per day?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 10,
        "step": 1
      }
    },
    {
      "varname": "ENobstBz1",
      "q_de": "Verzehr von Obst: Wie viel Portionen Obst essen Sie pro Tag?",
      "q_en": "Consumption of fruit: How many portions of fruit do you eat per day?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 10,
        "step": 1
      }
    },
    {
      "varname": "GZmehm1",
      "q_de": "Wie schätzen Sie Ihren allgemeinen Gesundheitszustand ein?",
      "q_en": "How do you assess your general state of health?",
      "type": "select",
      "meta": [
        {
          "val": 4,
          "display_en": "Good",
          "display_de": "Gut"
        },
        {
          "val": 5,
          "display_en": "Very good",
          "display_de": "Sehr gut"
        },
        {
          "val": 2,
          "display_en": "Bad",
          "display_de": "Schlecht"
        },
        {
          "val": 3,
          "display_en": "Mediocre",
          "display_de": "Mittelmäßig"
        },
        {
          "val": 1,
          "display_en": "Very bad",
          "display_de": "Sehr schlecht"
        }
      ]
    },
    {
      "varname": "GZmehm2D",
      "q_de": "Wurden Sie durch eine Krankheit für mindestens 6 Monate in irgendeiner Art im Leben eingeschränkt?",
      "q_en": "Have you been limited in any way in your life by effects of a disease for at least 6 months?",
      "type": "select",
      "meta": [
        {
          "val": 3,
          "display_en": "No, not limited",
          "display_de": "Nein, nicht eingeschränkt"
        },
        {
          "val": 2,
          "display_en": "Yes, moderately restricted",
          "display_de": "Ja, mäßig eingeschränkt"
        },
        {
          "val": 1,
          "display_en": "Yes, strongly limited",
          "display_de": "Ja, stark eingeschränkt"
        }
      ]
    },
    {
      "varname": "GZmehm3C",
      "q_de": "Haben Sie chronische Krankheiten?",
      "q_en": "Do you have chronic diseases?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "GZsubj1",
      "q_de": "Wie stark achten Sie auf Ihre Gesundheit?",
      "q_en": "How health-concious would you rate yourself?",
      "type": "select",
      "meta": [
        {
          "val": 5,
          "display_en": "Very strong",
          "display_de": "Sehr stark"
        },
        {
          "val": 4,
          "display_en": "strongly",
          "display_de": "Stark"
        },
        {
          "val": 3,
          "display_en": "Mediocre",
          "display_de": "Mittelmäßig"
        },
        {
          "val": 2,
          "display_en": "Less strong",
          "display_de": "Weniger stark"
        },
        {
          "val": 1,
          "display_en": "Not at all",
          "display_de": "Gar nicht"
        }
      ]
    },
    {
      "varname": "IAarzt14B",
      "q_de": "Wann war Ihre letzte zahnmedizinische Untersuchung?",
      "q_en": "When was your last dental examination?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Less than 6 months",
          "display_de": "Vor weniger als 6 Monaten"
        },
        {
          "val": 4,
          "display_en": "Never",
          "display_de": "Nie"
        },
        {
          "val": 2,
          "display_en": "6 to less than 12 months",
          "display_de": "Vor 6 bis weniger als 12 Monaten"
        },
        {
          "val": 3,
          "display_en": "12 months or more ago",
          "display_de": "Vor 12 Monaten oder länger"
        }
      ]
    },
    {
      "varname": "IAarzt1B4w",
      "q_de": "Wie oft haben Sie in den letzten 4 Wochen einen Allgemeinarzt oder Hausarzt aufgesucht?",
      "q_en": "How often have you visited a general practitioner or family doctor in the last 4 weeks?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 10,
        "step": 1
      }
    },
    {
      "varname": "IAarzt8C",
      "q_de": "Wurden Sie in den letzten 12 Monaten bei einem Psychologen vorstellig?",
      "q_en": "Have you seen a psychologist in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "IAcholus",
      "q_de": "Wann war Ihre letzte Blutfettwertebestimmung?",
      "q_en": "When was your last blood fat determination?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Within the last 12 months",
          "display_de": "Innerhalb der letzten 12 Monate"
        },
        {
          "val": 4,
          "display_en": "more 5 years ago or",
          "display_de": "Vor 5 Jahren oder mehr"
        },
        {
          "val": 3,
          "display_en": "3 to less than 5 years",
          "display_de": "Vor 3 bis weniger als 5 Jahren"
        },
        {
          "val": 2,
          "display_en": "1 to less than 3 years",
          "display_de": "Vor 1 bis weniger als 3 Jahren"
        },
        {
          "val": 5,
          "display_en": "Never",
          "display_de": "Nie"
        }
      ]
    },
    {
      "varname": "IAdiabus",
      "q_de": "Wann war Ihre letzte Blutzuckermessung?",
      "q_en": "When was your last blood glucose monitoring?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Within the last 12 months",
          "display_de": "Innerhalb der letzten 12 Monate"
        },
        {
          "val": 2,
          "display_en": "1 to less than 3 years",
          "display_de": "Vor 1 bis weniger als 3 Jahren"
        },
        {
          "val": 3,
          "display_en": "3 to less than 5 years",
          "display_de": "Vor 3 bis weniger als 5 Jahren"
        },
        {
          "val": 5,
          "display_en": "Never",
          "display_de": "Nie"
        },
        {
          "val": 4,
          "display_en": "more 5 years ago or",
          "display_de": "Vor 5 Jahren oder mehr"
        }
      ]
    },
    {
      "varname": "IAfa4w",
      "q_de": "Wie oft waren Sie i.d. letzten 4 Wochen beim Facharzt vorstellig?",
      "q_en": "How often have you been visiting a medical specialist in the past 4 weeks?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 10,
        "step": 1
      }
    },
    {
      "varname": "IAhypus",
      "q_de": "Wann war Ihre letzte Blutdruckmessung?",
      "q_en": "When was your last blood pressure test?",
      "type": "select",
      "meta": [
        {
          "val": 5,
          "display_en": "Never",
          "display_de": "Nie"
        },
        {
          "val": 4,
          "display_en": "more than 5 years ago",
          "display_de": "Vor 5 Jahren oder mehr"
        },
        {
          "val": 3,
          "display_en": "3 or less than 5 years",
          "display_de": "Vor 3 bis weniger als 5 Jahren"
        },
        {
          "val": 2,
          "display_en": "1 or less than 3 years",
          "display_de": "Vor 1 bis weniger als 3 Jahren"
        },
        {
          "val": 1,
          "display_en": "Within the last 12 months",
          "display_de": "Innerhalb der letzten 12 Monate"
        }
      ]
    },
    {
      "varname": "IAkfutyp2B_lz",
      "q_de": "Wann war Ihr letzter Stuhltest?",
      "q_en": "When was your last stool test?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Within the last 12 months",
          "display_de": "Innerhalb der letzten 12 Monate"
        },
        {
          "val": 5,
          "display_en": "Never",
          "display_de": "Nie"
        },
        {
          "val": 4,
          "display_en": "more 3 years ago or",
          "display_de": "Vor 3 Jahren oder mehr"
        },
        {
          "val": 3,
          "display_en": "2 to less than 3 years",
          "display_de": "Vor 2 bis weniger als 3 Jahren"
        },
        {
          "val": 2,
          "display_en": "1 to less than 2 years",
          "display_de": "Vor 1 bis weniger als 2 Jahren"
        }
      ]
    },
    {
      "varname": "IAkfutyp4B_lz",
      "q_de": "Wann war Ihre letzte Darmspiegelung?",
      "q_en": "When did you last have a colonoscopy?",
      "type": "select",
      "meta": [
        {
          "val": 4,
          "display_en": "more 10 years ago or",
          "display_de": "Vor 10 Jahren oder mehr"
        },
        {
          "val": 3,
          "display_en": "Before 5 to less than 10 years",
          "display_de": "Vor 5 bis weniger als 10 Jahren"
        },
        {
          "val": 2,
          "display_en": "1 to less than 5 years",
          "display_de": "Vor 1 bis weniger als 5 Jahren"
        },
        {
          "val": 1,
          "display_en": "Within the last 12 months",
          "display_de": "Innerhalb der letzten 12 Monate"
        },
        {
          "val": 5,
          "display_en": "Never",
          "display_de": "Nie"
        }
      ]
    },
    {
      "varname": "IAkhs",
      "q_de": "Wurden Sie in den letzten 12 Monaten stationär im Krankenhaus aufgenommen?",
      "q_en": "Have you been hospitalized in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "IAkhs_k",
      "q_de": "Wie viele Nächste haben Sie stationär im Krankenhaus verbracht während der letzten 12 Moonate?",
      "q_en": "How many nights have you spent in a hospital in the past 12 months?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 365,
        "step": 7
      }
    },
    {
      "varname": "IApflege",
      "q_de": "Haben Sie in den letzten 12 Monaten den häuslichen Pflegedienst genutzt?",
      "q_en": "Have you used the home care service in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "IAtermin",
      "q_de": "Hat sich bei Ihnen in den letzten 12 Monaten eine Untersuchung oder Behandlung verzögert, weil Sie zu lange auf einen Termin warten mussten?",
      "q_en": "Have you had a delayed examination or treatment in the last 12 months because you had to wait too long for an appointment?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 3,
          "display_en": "No need for examination or treatment",
          "display_de": "Kein Bedarf an Untersuchung oder Behandlung"
        }
      ]
    },
    {
      "varname": "IAther2B",
      "q_de": "Wurden Sie in den letzten 12 Monaten bei einem Physiotherapeuten vorstellig?",
      "q_en": "Have you visited a physiotherapists in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "IAweg",
      "q_de": "Hat sich in den letzten 12 Monaten eine Untersuchung / Behandlung bei Ihnen verzögert, weil Ihr Termin zu weit entfernt war?",
      "q_en": "Has an examination / treatment been delayed in the last 12 months because your appointment was too far away?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 3,
          "display_en": "No need for examination or treatment",
          "display_de": "Kein Bedarf an Untersuchung oder Behandlung"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "IPinfl4",
      "q_de": "Wann war Ihre letzte Grippeimpfung?",
      "q_en": "When was your last flu vaccination?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "It's been too long (no vaccination in the past year)",
          "display_de": "Es ist zu lange her (Keine Impfung im vergangenen Jahr)"
        },
        {
          "val": 2,
          "display_en": "Never",
          "display_de": "Noch nie"
        },
        {
          "val": 3,
          "display_en": "vaccination date available",
          "display_de": "Impfdatum vorhanden"
        }
      ]
    },
    {
      "varname": "IPinfl6B",
      "q_de": "Wie oft haben Sie die Grippeimpfung erhalten?",
      "q_en": "How often have you been vaccinated against the flu?",
      "type": "select",
      "meta": [
        {
          "val": 4,
          "display_en": "5 times",
          "display_de": "5 Mal"
        },
        {
          "val": 3,
          "display_en": "3-4 times",
          "display_de": "3-4 Mal"
        },
        {
          "val": 2,
          "display_en": "1-2 times",
          "display_de": "1-2 Mal"
        },
        {
          "val": 1,
          "display_en": "Not at all",
          "display_de": "Gar nicht"
        }
      ]
    },
    {
      "varname": "IPtet_lz",
      "q_de": "Wann war Ihre letzte Tetanusimpfung?",
      "q_en": "How long has the last tetanus vaccination been?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Less than 10 years",
          "display_de": "Weniger als 10 Jahre"
        },
        {
          "val": 2,
          "display_en": "10 years or more",
          "display_de": "10 Jahre oder länger"
        }
      ]
    },
    {
      "varname": "KAehispaq2",
      "q_de": "An wie vielen Tagen in der Woche bewegen Sie sich zu Fuß fort?",
      "q_en": "How many days a week do you walk?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 7,
        "step": 1
      }
    },
    {
      "varname": "KAehispaq4",
      "q_de": "An wie vielen Tagen in der Woche benutzen Sie das Fahrrad?",
      "q_en": "How many days a week do you use the bicycle?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 7,
        "step": 1
      }
    },
    {
      "varname": "KAehispaq8",
      "q_de": "An wie vielen Tagen in der Woche führen Sie Kräftigungsübungen durch?",
      "q_en": "How many days a week do you do strengthening exercises?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 7,
        "step": 1
      }
    },
    {
      "varname": "KAgfa",
      "q_de": "Betätigen Sie sich mindestens 2x in der Woche mit Ausdauersport in Summe >= 2 Stunden (z.B. Fahrradfahren)?",
      "q_en": "Do you engage in endurance sports at least twice a week for a total of >= 2 hours (e.g. cycling)?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KAgfka",
      "q_de": "Betätigen Sie sich gemäß der WHO Empfehlung mindestens 150 Min. in der Woche aerobe köperlich aktiv (incl. Gehen)?",
      "q_en": "According to WHO recommendations, are you physically active aerobically for at least 150 min/week (including walking)?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "KAgfka1",
      "q_de": "Betätigen Sie sich in der Woche mind. 2 Stunden körperlich aktiv (ohne Gehen)?",
      "q_en": "Are you physically active for at least 2 hours per week (without walking)?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KAgfmk",
      "q_de": "Führen Sie Muskelkräftigung aus (mind. 2x in der Woche)?",
      "q_en": "Do you carry out muscle strengthening (at least twice a week)?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KAspodauC_k",
      "q_de": "Wie viel Sport pro Woche machen Sie insgesamt (in Minuten)",
      "q_en": "How much sport you do per week in total (in minutes)",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 900,
        "step": 30
      }
    },
    {
      "varname": "KHab12",
      "q_de": "Hatten Sie in den letzten 12 Monaten Asthma?",
      "q_en": "Did you have asthma in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "KHalgi112",
      "q_de": "Hatten Sie in den letzten 12 Monaten Allergien?",
      "q_en": "Did you suffer from allergies in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHcb12",
      "q_de": "Hatten Sie in den letzten 12 Monaten chronische Bronchitis?",
      "q_en": "Did you suffer from Chronic bronchitis in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHced12",
      "q_de": "Hatten Sie in den letzten 12 Monaten eine chronische entzündliche Darmerkrankung?",
      "q_en": "Did you have an inflammatory bowel disease in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHcle12",
      "q_de": "Hatten Sie andere chronische Lebererkrankungen in den letzten 12 Monaten?",
      "q_en": "Did you have other chronic liver diseases in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHdge12",
      "q_de": "Hatten Sie in den letzten 12 Monaten Arthrose?",
      "q_en": "Did you suffer from osteoarthritis in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHdiabB12",
      "q_de": "Litten Sie in den letzten 12 Monaten an Diabetis?",
      "q_en": "Have you been diabetic in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "KHhi12",
      "q_de": "Hatten Sie in den letzten 12 Monaten eine Herzinsuffizienz?",
      "q_en": "Did you have a heart failure in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHhyp",
      "q_de": "Wurde bei Ihnen jemals Bluthochdruck diagnostiziert?",
      "q_en": "Have you ever been diagnosed with hypertension?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHhyp12",
      "q_de": "Hatten Sie in den letzten 12 Monaten Bluthochdruck?",
      "q_en": "Have you had hypertension in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
        "varname": "KHhyp12pB",
        "q_de": "Wurde in den letzten 12 Monaten bei Ihnen ärztlich Bluthochdruckdruck diagnostiziert?",
        "q_en": "Have you been medically diagnosed with high blood pressure in the last 12 months?",
        "type": "binary",
        "meta": [
          {
            "val": 2,
            "display_en": "No",
            "display_de": "Nein"
          },
          {
            "val": 1,
            "display_en": "Yes",
            "display_de": "Ja"
          }
        ]
      },
    {
      "varname": "KHhypmedC",
      "q_de": "Nehmen Sie blutdrucksenkende Mittel aufgrund einer bekannten Hypertonie ein?",
      "q_en": "Are you taking antihypertensive medication for a known hypertension?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "KHkarz12",
      "q_de": "Hatten Sie eine Krebserkrankung in den letzten 12 Monaten?",
      "q_en": "Have you been diagnosed with cancer in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHkhk12",
      "q_de": "Hatten Sie in den letzten 12 Monaten eine koronare Herzerkrankung/Angina Pectoris?",
      "q_en": "Have you had coronary artery disease / angina pectoris in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
        "varname": "KHbbmyo12",
        "q_de": "Hatten Sie in den letzten 12 Monaten chronische Probleme mit Ihrem Herz / Herzinfarkt?",
        "q_en": "Have you had chronical issues with your heart / heart attack in the last 12 months?",
        "type": "binary",
        "meta": [
          {
            "val": 1,
            "display_en": "Yes",
            "display_de": "Ja"
          },
          {
            "val": 2,
            "display_en": "No",
            "display_de": "Nein"
          }
        ]
      },    
    {
      "varname": "KHlip12A",
      "q_de": "Hatten Sie in den letzten 12 Monaten erhöhte Blutfette oder Cholesterien?",
      "q_en": "Have you had elevated blood lipids or cholesterol in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHlipA",
      "q_de": "Wurde bei Ihnen jemals ärztlich erhöhte Blutfette/Cholesterinwerte diagnostiziert?",
      "q_en": "Have you ever been diagnosed with elevated blood lipids or cholesterol?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHlipmedA",
      "q_de": "Nehmen Sie aktuell Medikamente ein aufgrund erhöhten Cholesterins?",
      "q_en": "Are you currently taking medication for high cholesterol?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHlz12",
      "q_de": "Hatten Sie in den letzten 12 Monaten eine Leberzirrhose?",
      "q_en": "Have you had cirrhosis of the liver in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHmyo12",
      "q_de": "Hatten Sie in den letzten 12 Monaten einen Herzinfarkt?",
      "q_en": "Did you have a heart attack in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHniB12",
      "q_de": "Hatten Sie chronische Nierenprobleme in den letzten 12 Monaten?",
      "q_en": "Have you had chronic kidney problems in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHos12",
      "q_de": "Hatten Sie Osteoporose in den letzten 12 Monaten?",
      "q_en": "Have you had Osteoporosis in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHra12",
      "q_de": "Hatten Sie Arthritis in den letzten 12 Monaten?",
      "q_en": "Have you had arthritis in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "KHsa12",
      "q_de": "Hatten Sie in den letzten 12 Monaten einen Schlaganfall?",
      "q_en": "Have you had a stroke in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "KHulc12",
      "q_de": "Hatten Sie in den letzten 12 Monaten ein Magen- oder Zwölffingerdarmgeschwür?",
      "q_en": "Have you had a gastric or duodenal ulcer in the past 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "LQsf367C",
      "q_de": "Hatten Sie in den letzten 4 Wochen Schmerzen? Falls, ja, wie stark waren diese?",
      "q_en": "Have you had any pain in the last four weeks? If so, how severe were they?",
      "type": "select",
      "meta": [
        {
          "val": 3,
          "display_en": "Light",
          "display_de": "Leicht"
        },
        {
          "val": 6,
          "display_en": "Very strong",
          "display_de": "Sehr stark"
        },
        {
          "val": 5,
          "display_en": "strongly",
          "display_de": "Stark"
        },
        {
          "val": 4,
          "display_en": "Moderate",
          "display_de": "Mäßig"
        },
        {
          "val": 2,
          "display_en": "Very easy",
          "display_de": "Sehr leicht"
        },
        {
          "val": 1,
          "display_en": "No pain",
          "display_de": "Keine Schmerzen"
        }
      ]
    },
    {
      "varname": "LQsf368C",
      "q_de": "Litten Sie an Behinderung in Alltagstätigkeiten durch Schmerzen in den letzetn 4 Wochen?",
      "q_en": "Have you suffered from disability in everyday activities due to pain in the last 4 weeks?",
      "type": "select",
      "meta": [
        {
          "val": 5,
          "display_en": "Very",
          "display_de": "Sehr"
        },
        {
          "val": 4,
          "display_en": "Quite",
          "display_de": "Ziemlich"
        },
        {
          "val": 3,
          "display_en": "Moderate",
          "display_de": "Mäßig"
        },
        {
          "val": 2,
          "display_en": "Something",
          "display_de": "Etwas"
        },
        {
          "val": 1,
          "display_en": "Not at all",
          "display_de": "Überhaupt nicht"
        }
      ]
    },
    {
      "varname": "LQzufrB10",
      "q_de": "Wie zufrieden sind Sie mit Ihrem Leben insgesamt (10=total zufrieden)?",
      "q_en": "How satisfied are you with your life overall (10=totally satisfied)?",
      "type": "continuous",
      "meta": {
        "min": 0,
        "max": 10,
        "step": 1
      }
    },
    {
      "varname": "PKdep12",
      "q_de": "Hatten Sie eine Depression in den letzten 12 Monaten?",
      "q_en": "Have you had a depression in the last 12 months?",
      "type": "binary",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        }
      ]
    },
    {
      "varname": "RCstat",
      "q_de": "Rauchen Sie?",
      "q_en": "Do you smoke?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes, daily",
          "display_de": "Ja, täglich"
        },
        {
          "val": 2,
          "display_en": "Yes, occasionally",
          "display_de": "Ja, gelegentlich"
        },
        {
          "val": 3,
          "display_en": "No not more",
          "display_de": "Nein, nicht mehr"
        },
        {
          "val": 4,
          "display_en": "Have never smoked",
          "display_de": "Habe noch nie geraucht"
        }
      ]
    },
    {
      "varname": "SFoslo1C",
      "q_de": "Wie viele Personen, würden Sie als Ihnen 'nahe stehend' bezeichnen?",
      "q_en": "How many people would you describe as 'close friends/relatives'?",
      "type": "select",
      "meta": [

        {
          "val": 2,
          "display_en": "1 to 2",
          "display_de": "1 bis 2"
        },
        {
            "val": 3,
            "display_en": "3 to 5",
            "display_de": "3 bis 5"
        },
        {
            "val": 4,
            "display_en": "6 or more",
            "display_de": "6 oder mehr"
        },
        {
            "val": 1,
            "display_en": "No",
            "display_de": "Keine"
        }
      ]
    },
    {
      "varname": "SFoslo3A",
      "q_de": "Wie schwierig ist es für sie, in schwierigen Lebenssituationen von Ihnen nahestehenden Personen zu erbitten?",
      "q_en": "How difficult is it for you to ask people close to you in difficult life situations for help?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Very difficult",
          "display_de": "Sehr schwierig"
        },
        {
          "val": 2,
          "display_en": "Difficult",
          "display_de": "Schwierig"
        },
        {
          "val": 4,
          "display_en": "Simple",
          "display_de": "Einfach"
        },
        {
          "val": 3,
          "display_en": "Possible",
          "display_de": "Möglich"
        },
        {
          "val": 5,
          "display_en": "Very easy",
          "display_de": "Sehr einfach"
        }
      ]
    },
    {
      "varname": "SFosloA",
      "q_de": "Wie schätzen Sie soziale Unterstützung ein, die Sie durch Ihre Familie, Freunde und Angehörige erfahren?",
      "q_en": "How do you rate the social support you receive from your family, friends and loved ones?",
      "type": "select",
      "meta": [
        {
          "val": 3,
          "display_en": "strong support",
          "display_de": "Starke Unterstützung"
        },
        {
          "val": 1,
          "display_en": "little support",
          "display_de": "Geringe Unterstützung"
        },
        {
          "val": 2,
          "display_en": "medium support",
          "display_de": "Mittlere Unterstützung"
        }
      ]
    },
    {
      "varname": "SHhoer1",
      "q_de": "Nutzen Sie ein Hörgerät?",
      "q_en": "Are you using a hearing aid?",
      "type": "select",
      "meta": [
        {
          "val": 3,
          "display_en": "I'm hard of hearing or deaf",
          "display_de": "Ich bin hochgradig schwerhörig oder gehörlos"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        }
      ]
    },
    {
      "varname": "SHseh1",
      "q_de": "Haben Sie eine Brille oder Kontaktlinsen?",
      "q_en": "Do you wear glasses or contacts?",
      "type": "select",
      "meta": [
        {
          "val": 1,
          "display_en": "Yes",
          "display_de": "Ja"
        },
        {
          "val": 2,
          "display_en": "No",
          "display_de": "Nein"
        },
        {
          "val": 3,
          "display_en": "I am severely visually impaired or can not see",
          "display_de": "Ich bin stark sehbehindert oder kann nicht sehen"
        }
      ]
    },
    {
    "varname": "flagHadAccident",
    "q_de": "Hatten Sie in den letzten 12 Monaten einen Unfall, durch den Sie verletzt wurden?", 
    "q_en": "Have you had an accident through which you were injured within the past 12 months?",
    "type": "binary",
    "meta": [
        {
        "val": 1,
        "display_en": "Yes",
        "display_de": "Ja"
        },
        {
        "val": 2,
        "display_en": "No",
        "display_de": "Nein"
        }
    ]
    },

    // imputed / generated questions:
    {
        "varname": "IAarzt_general4w",
        "q_de": "Hatten Sie in den letzten 4 Wochen irgendeinen Arztbesuch?",
        "q_en": "Did you see any doctor within the last four weeks?",
        "type": "binary",
        "meta": [
          {
            "val": 1,
            "display_en": "Yes",
            "display_de": "Ja"
          },
          {
            "val": 2,
            "display_en": "No",
            "display_de": "Nein"
          }
        ]
      }
    
  ];


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
                                console.log("Question should be imputed but not found: " + q.varname)
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

    console.log(sessionObj)

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
    inputVector[element] = userObj[element];
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

    let requestBody = {
        inputVector: createInputVector(userObj, sessionObj)
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
            "evalDetails" : body["evalDetails"]
          };

          resolve(response);
        }catch(err){
          reject(err);
        }
        
    });
  });

}

function storeSession(userId, sessionObj){

 sessionObj.userId = userId;

  try{

     MongoClient.connect(MongoUrl, function(err, db) {

         if (err) throw err;
         
         let dbo = db.db(config.mongodb.database);

         const collection = dbo.collection('coach');

         collection.insertOne(sessionObj,
             function(err, docs){
               if (err){
                console.error(err)
               }else{
                console.log("Session stored for userId | " + userId)
               }
                 
             }
         );
             
       });

 }catch(error){
     console.error("Something went wrong storing the session for userId | " + userId)
 }

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
          }).toArray(function(error, result){
              if (error){
                  throw err;
              }
              res.json(result)
          });
              
        });

  }catch(error){
      console.error(error.stack);
      res.send(403, "Something went wrong getting the sessions.");
  }
}

function loadSession(req, res){
  let userId = req.userId;
  let sessionId = req.params.sessionId;

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
                  throw err;
              }
              res.json(result)
          });
              
        });

  }catch(error){
      console.error(error.stack);
      res.send(403, "Something went wrong getting the sessions.");
  }
}


module.exports = {
    getNextQuestion, 
    getWellbeingEvaluation, 
    storeSession, 
    getSessions,
    loadSession
}