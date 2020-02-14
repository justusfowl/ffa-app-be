var sockets = {};

/*
let questions = [{
    "varname" : "testvar",
    "q_en" : "How are you?", 
    "q_de" : "Wie geht es dir?",
    "type" : "date",  
    "meta" : [
      {
        "val" : 1, 
        "display_en" : "Very bad",
        "display_de" : "Sehr schlecht"
      },
      {
        "val" : 5, 
        "display_en" : "Very good",
        "display_de" : "Sehr gut"
      }
    ]
  },
  {
    "varname" : "testvar2",
    "q_en" : "This is test 2?", 
    "q_de" : "Dies ist test 2?",
    "type" : "continuous", 
    "meta" : {
        "min" : 0, 
        "max" : 100, 
        "steps" : 5
    }
  },
];
*/

let questions = [{'varname': 'AKoft12_k',
'q_de': 'Alkohol i.d.l. 12 Mon. in 6 Kat.',
'q_en': 'Alcohol i.d.l. 12 months in 6 Cat.',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Daily. alcohol consumption',
  'display_de': 'Tägl. Alkoholkonsum'},
 {'val': 2.0,
  'display_en': 'Weekly. alcohol consumption',
  'display_de': 'Wöchentl. Alkoholkonsum'},
 {'val': 5.0,
  'display_en': 'Monthly. alcohol consumption',
  'display_de': 'Monatl. Alkoholkonsum'},
 {'val': 7.0,
  'display_en': 'Less than monthly. alcohol consumption',
  'display_de': 'Weniger als monatl. Alkoholkonsum'},
 {'val': 8.0,
  'display_en': 'No more alcohol consumption',
  'display_de': 'Kein Alkoholkonsum mehr'},
 {'val': 9.0,
  'display_en': 'No alcohol consumption',
  'display_de': 'Kein Alkoholkonsum'}]},
{'varname': 'AMarztB',
'q_de': 'Einnahme Medikamente v. Arzt verschrieben i.d.l. 2 Wo',
'q_en': 'Taking medications v. Doctor prescribed i.d.l. 2 Where',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'AMfrei',
'q_de': 'Einnahme Medikamente nicht v. Arzt verschrieben i.d.l. 2 Wo',
'q_en': 'v not taking medication. Doctor prescribed i.d.l. 2 Where',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'AUarbzD_k',
'q_de': 'Krankheitsbedingt nicht zur Arbeit: Wochen',
'q_en': 'not due to illness to work: weeks',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'BBbehB',
'q_de': 'Amtlich anerkannte Behinderung',
'q_en': 'Officially recognized disability',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'BBblas12B',
'q_de': 'Harninkontinenz: I.d.l.12 Mon.',
'q_en': 'Urinary incontinence: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'BBdors112',
'q_de': 'Beschwerden unterer Rücken: I.d.l.12 Mon.',
'q_en': 'Lower back pain: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'BBdors212',
'q_de': 'Beschwerden Nacken, Halswirbelsäule: I.d.l.12 Mon.',
'q_en': 'Complaints neck, cervical spine: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'BBgehen',
'q_de': 'Schwierigk. beim Laufen ohne Gehhilfe auf 500m',
'q_en': 'Schwierigk. when walking without walking aids at 500m',
'type': 'select',
'meta': [{'val': 4.0,
  'display_en': "It is not possible for me / I'm not capable of doing",
  'display_de': 'Es ist mir nicht möglich/Ich bin dazu nicht in der Lage'},
 {'val': 3.0,
  'display_en': 'Great difficulties',
  'display_de': 'Große Schwierigkeiten'},
 {'val': 1.0,
  'display_en': 'No difficulties',
  'display_de': 'Keine Schwierigkeiten'},
 {'val': 2.0,
  'display_en': 'some difficulties',
  'display_de': 'Einige Schwierigkeiten'}]},
{'varname': 'BBmyo12',
'q_de': 'Chronische Beschwerden nach Herzinfarkt: I.d.l.12 Mon.',
'q_en': 'Chronic pain after heart attack: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'BBsa12',
'q_de': 'Chronische Beschw. infolge eines Schlaganfalls: I.d.l.12 Mon.',
'q_en': 'Chronic plaints. following a stroke: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'BBtreppe',
'q_de': 'Schwierigk. Treppe mit 12 Stufen',
'q_en': 'Schwierigk. Staircase with 12 steps',
'type': 'select',
'meta': [{'val': 3.0,
  'display_en': 'Great difficulties',
  'display_de': 'Große Schwierigkeiten'},
 {'val': 2.0,
  'display_en': 'some difficulties',
  'display_de': 'Einige Schwierigkeiten'},
 {'val': 1.0,
  'display_en': 'No difficulties',
  'display_de': 'Keine Schwierigkeiten'},
 {'val': 4.0,
  'display_en': "It is not possible for me / I'm not capable of doing",
  'display_de': 'Es ist mir nicht möglich/Ich bin dazu nicht in der Lage'}]},
{'varname': 'ENgemBz1',
'q_de': 'Verzehr von Gemüse: pro Tag',
'q_en': 'Consumption of vegetables: per day',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'ENobstBz1',
'q_de': 'Verzehr von Obst: pro Tag',
'q_en': 'Consumption of fruits: per day',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'GZmehm1',
'q_de': 'Allg. Gesundheitszustand',
'q_en': 'Gen. health status',
'type': 'select',
'meta': [{'val': 4.0, 'display_en': 'Good', 'display_de': 'Gut'},
 {'val': 5.0, 'display_en': 'Very good', 'display_de': 'Sehr gut'},
 {'val': 2.0, 'display_en': 'Bad', 'display_de': 'Schlecht'},
 {'val': 3.0, 'display_en': 'Mediocre', 'display_de': 'Mittelmäßig'},
 {'val': 1.0, 'display_en': 'Very bad', 'display_de': 'Sehr schlecht'}]},
{'varname': 'GZmehm2D',
'q_de': 'Einschränkung durch Krankheit seit mind. 6 Monaten',
'q_en': 'Limited by disease for min. 6 months',
'type': 'select',
'meta': [{'val': 3.0,
  'display_en': 'No, not limited',
  'display_de': 'Nein, nicht eingeschränkt'},
 {'val': 2.0,
  'display_en': 'Yes, moderately restricted',
  'display_de': 'Ja, mäßig eingeschränkt'},
 {'val': 1.0,
  'display_en': 'Yes, strongly limited',
  'display_de': 'Ja, stark eingeschränkt'}]},
{'varname': 'GZmehm3C',
'q_de': 'Chronische Krankheiten',
'q_en': 'Chronic diseases',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'GZsubj1',
'q_de': 'Achten auf Gesundheit',
'q_en': 'Pay attention to health',
'type': 'select',
'meta': [{'val': 5.0,
  'display_en': 'Very strong',
  'display_de': 'Sehr stark'},
 {'val': 4.0, 'display_en': 'strongly', 'display_de': 'Stark'},
 {'val': 3.0, 'display_en': 'Mediocre', 'display_de': 'Mittelmäßig'},
 {'val': 2.0, 'display_en': 'Less strong', 'display_de': 'Weniger stark'},
 {'val': 1.0, 'display_en': 'Not at all', 'display_de': 'Gar nicht'}]},
{'varname': 'IAarzt14B',
'q_de': 'Zahnmedizinische Untersuchung',
'q_en': 'Dental examination',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Less than 6 months',
  'display_de': 'Vor weniger als 6 Monaten'},
 {'val': 4.0, 'display_en': 'Never', 'display_de': 'Nie'},
 {'val': 2.0,
  'display_en': '6 to less than 12 months',
  'display_de': 'Vor 6 bis weniger als 12 Monaten'},
 {'val': 3.0,
  'display_en': '12 months or more ago',
  'display_de': 'Vor 12 Monaten oder länger'}]},
{'varname': 'IAarzt1B4w',
'q_de': 'Besuch Allgemeinarzt oder Hausarzt i.d.l. 4 Wochen: Anzahl',
'q_en': 'Visit general practitioners or family doctor i.d.l. 4 weeks: Number',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'IAarzt8C',
'q_de': 'Besuch Psychologen i.d.l. 12 Mon.',
'q_en': 'Visit psychologists i.d.l. 12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'IAcholus',
'q_de': 'Letzte Blutfettwertebestimmung',
'q_en': 'Last blood fat determination',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Within the last 12 months',
  'display_de': 'Innerhalb der letzten 12 Monate'},
 {'val': 4.0,
  'display_en': 'more 5 years ago or',
  'display_de': 'Vor 5 Jahren oder mehr'},
 {'val': 3.0,
  'display_en': '3 to less than 5 years',
  'display_de': 'Vor 3 bis weniger als 5 Jahren'},
 {'val': 2.0,
  'display_en': '1 to less than 3 years',
  'display_de': 'Vor 1 bis weniger als 3 Jahren'},
 {'val': 5.0, 'display_en': 'Never', 'display_de': 'Nie'}]},
{'varname': 'IAdiabus',
'q_de': 'Letzte Blutzuckermessung',
'q_en': 'Last blood glucose monitoring',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Within the last 12 months',
  'display_de': 'Innerhalb der letzten 12 Monate'},
 {'val': 2.0,
  'display_en': '1 to less than 3 years',
  'display_de': 'Vor 1 bis weniger als 3 Jahren'},
 {'val': 3.0,
  'display_en': '3 to less than 5 years',
  'display_de': 'Vor 3 bis weniger als 5 Jahren'},
 {'val': 5.0, 'display_en': 'Never', 'display_de': 'Nie'},
 {'val': 4.0,
  'display_en': 'more 5 years ago or',
  'display_de': 'Vor 5 Jahren oder mehr'}]},
{'varname': 'IAfa4w',
'q_de': 'Besuch Facharzt i.d.l. 4 Wochen: Anzahl',
'q_en': 'Visiting Specialist i.d.l. 4 weeks: Number',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'IAhypus',
'q_de': 'Letzte Blutdruckmessung',
'q_en': 'Last blood pressure measurement',
'type': 'select',
'meta': [{'val': 5.0, 'display_en': 'Never', 'display_de': 'Nie'},
 {'val': 4.0,
  'display_en': 'more 5 years ago or',
  'display_de': 'Vor 5 Jahren oder mehr'},
 {'val': 3.0,
  'display_en': '3 to less than 5 years',
  'display_de': 'Vor 3 bis weniger als 5 Jahren'},
 {'val': 2.0,
  'display_en': '1 to less than 3 years',
  'display_de': 'Vor 1 bis weniger als 3 Jahren'},
 {'val': 1.0,
  'display_en': 'Within the last 12 months',
  'display_de': 'Innerhalb der letzten 12 Monate'}]},
{'varname': 'IAkfutyp2B_lz',
'q_de': 'Letzter Stuhltest',
'q_en': 'Last stool test',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Within the last 12 months',
  'display_de': 'Innerhalb der letzten 12 Monate'},
 {'val': 5.0, 'display_en': 'Never', 'display_de': 'Nie'},
 {'val': 4.0,
  'display_en': 'more 3 years ago or',
  'display_de': 'Vor 3 Jahren oder mehr'},
 {'val': 3.0,
  'display_en': '2 to less than 3 years',
  'display_de': 'Vor 2 bis weniger als 3 Jahren'},
 {'val': 2.0,
  'display_en': '1 to less than 2 years',
  'display_de': 'Vor 1 bis weniger als 2 Jahren'}]},
{'varname': 'IAkfutyp4B_lz',
'q_de': 'Letzte Darmspiegelung',
'q_en': 'Last colonoscopy',
'type': 'select',
'meta': [{'val': 4.0,
  'display_en': 'more 10 years ago or',
  'display_de': 'Vor 10 Jahren oder mehr'},
 {'val': 3.0,
  'display_en': 'Before 5 to less than 10 years',
  'display_de': 'Vor 5 bis weniger als 10 Jahren'},
 {'val': 2.0,
  'display_en': '1 to less than 5 years',
  'display_de': 'Vor 1 bis weniger als 5 Jahren'},
 {'val': 1.0,
  'display_en': 'Within the last 12 months',
  'display_de': 'Innerhalb der letzten 12 Monate'},
 {'val': 5.0, 'display_en': 'Never', 'display_de': 'Nie'}]},
{'varname': 'IAkhs',
'q_de': 'Stationär im Krankenhaus i.d.l. 12 Mon.',
'q_en': 'Stationary i.d.l. in hospital 12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'IAkhs_k',
'q_de': 'Stationär im Krankenhaus i.d.l. 12 Mon.: Anzahl der Nächte (kat)',
'q_en': 'Stationary i.d.l. in hospital 12 month .: Number of nights (cat)',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'IApflege',
'q_de': 'Inanspruchnahme häuslicher Pflegedienst: I.d.l. 12 Mon.',
'q_en': 'Use of home care services: I.d.l. 12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'IAtermin',
'q_de': 'Auf Untersuchungstermin gewartet i.d.l. 12 Mon.',
'q_en': 'i.d.l. waiting for examination appointment 12 Mon.',
'type': 'select',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 3.0,
  'display_en': 'No need for examination or treatment',
  'display_de': 'Kein Bedarf an Untersuchung oder Behandlung'}]},
{'varname': 'IAther2B',
'q_de': 'Besuch Physiotherapeuten i.d.l. 12 Mon',
'q_en': 'Visit physiotherapists i.d.l. 12 Mon',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'IAweg',
'q_de': 'Untersuchung verzögert wegen Entfernung i.d.l. 12 Mon.',
'q_en': 'Investigation delayed due i.d.l. Distance 12 Mon.',
'type': 'select',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 3.0,
  'display_en': 'No need for examination or treatment',
  'display_de': 'Kein Bedarf an Untersuchung oder Behandlung'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'IPinfl4',
'q_de': 'Letzte Grippeimpfung',
'q_en': 'Last flu shot',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': "It's been too long (no vaccination in the past year)",
  'display_de': 'Es ist zu lange her (Keine Impfung im vergangenen Jahr)'},
 {'val': 2.0, 'display_en': 'Never', 'display_de': 'Noch nie'},
 {'val': 3.0,
  'display_en': 'vaccination date available',
  'display_de': 'Impfdatum vorhanden'}]},
{'varname': 'IPinfl6B',
'q_de': 'Häufigkeit Grippeimpfung, generiert',
'q_en': 'Frequency flu vaccine generated',
'type': 'select',
'meta': [{'val': 4.0, 'display_en': '5 times', 'display_de': '5 Mal'},
 {'val': 3.0, 'display_en': '3-4 times', 'display_de': '3-4 Mal'},
 {'val': 2.0, 'display_en': '1-2 times', 'display_de': '1-2 Mal'},
 {'val': 1.0, 'display_en': 'Not at all', 'display_de': 'Gar nicht'}]},
{'varname': 'IPtet_lz',
'q_de': 'Letzte Tetanusimpfung',
'q_en': 'Last tetanus shot',
'type': 'binary',
'meta': [{'val': 1.0,
  'display_en': 'Less than 10 years',
  'display_de': 'Weniger als 10 Jahre'},
 {'val': 2.0,
  'display_en': '10 years or more',
  'display_de': '10 Jahre oder länger'}]},
{'varname': 'KAehispaq2',
'q_de': 'Bewegung zu Fuß: Tage pro Woche',
'q_en': 'Movement on foot: days a week',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'KAehispaq4',
'q_de': 'Bewegung mit Fahrrad: Tage pro Woche',
'q_en': 'Movement with bicycle: days a week',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'KAehispaq8',
'q_de': 'Aufbau/Kräftigung: Tage pro Woche',
'q_en': 'Building / strengthening: days a week',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'KAgfa',
'q_de': '>= 150 min Ausdaueraktiv.und 2 x/ Woche Aktiv. zur Muskelkräft.(Einhalt. beider WHO-Empf.)',
'q_en': '> = 150 min Ausdaueraktiv.und 2x / week Active. for Muskelkräft. (stop. WHO both Sens.)',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KAgfka',
'q_de': 'Einhalt. aerobe WHO-Bew.empf. (mit Gehen >= 150 Min. aerobe körp. Aktiv./Wo)',
'q_en': 'Stop. aerobic WHO Bew.empf. (With Go> = 150 min. Aerobic körp. Aktiv./Wo)',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'KAgfka1',
'q_de': 'Einhalt. aerobe WHO-Bew.empf. (o. Gehen >= 150 Min. aerobe körp. Aktiv./Wo)',
'q_en': 'Stop. aerobic WHO Bew.empf. (O. Go> = 150 aerobic körp. Aktiv./Wo min.)',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KAgfmk',
'q_de': 'WHO-Empf. zur Muskelkräft. (>= 2x/Wo. Aktivit. zur Muskelkräftigung)',
'q_en': 'WHO Rec. to Muskelkräft. (> = 2x / wk. Activities. To strengthen the muscles)',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KAspodauC_k',
'q_de': 'Sport pro Woche insgesamt (in 30 min kategoriesiert)',
'q_en': 'Sports week in total (category Siert in 30 min)',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'KHab12',
'q_de': 'Asthma: I.d.l.12 Mon.',
'q_en': 'Asthma: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'KHalgi112',
'q_de': 'Allergien: I.d.l. 12 Mon.',
'q_en': 'Allergies: I.d.l. 12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHcb12',
'q_de': 'Chronische Bronchitis: I.d.l.12 Mon.',
'q_en': 'Chronic bronchitis: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHced12',
'q_de': 'Chronisch entzündliche Darmerkrankung: I.d.l.12 Mon.',
'q_en': 'Inflammatory bowel disease: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHcle12',
'q_de': 'Andere chronische Lebererkrankungen: I.d.l.12 Mon.',
'q_en': 'Other chronic liver diseases: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHdge12',
'q_de': 'Arthrose: I.d.l.12 Mon.',
'q_en': 'Osteoarthritis: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHdiabB12',
'q_de': 'Diabetes: I.d.l.12 Mon.',
'q_en': 'Diabetes: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'KHhi12',
'q_de': 'Herzinsuffizienz: I.d.l.12 Mon.',
'q_en': 'Heart failure: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHhyp',
'q_de': 'Bluthochdruck: Jemals ärztlich diagnostiziert',
'q_en': 'Hypertension: Ever diagnosed medically',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHhyp12',
'q_de': 'Bluthochdruck: I.d.l.12 Mon.',
'q_en': 'Hypertension: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'KHhypmedC',
'q_de': 'Indikator blutdrucksenkende Mittel bei bekannter Hypertonie',
'q_en': 'Indicator antihypertensive agents with known hypertension',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'KHkarz12',
'q_de': 'Krebserkrankung: I.d.l.12 Mon.',
'q_en': 'Cancer: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHkhk12',
'q_de': 'Koronare Herzerkrankung/Angina Pectoris: I.d.l.12 Mon.',
'q_en': 'Coronary heart disease / angina pectoris: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHlip12A',
'q_de': 'Erhöhte Blutfette/Chol.: I.d.l.12 Mon.',
'q_en': 'Elevated blood lipids / Chol .: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHlipA',
'q_de': 'Jemals erhöhte Blutfette/Cholesterinw. (Arztdiagnose)',
'q_en': 'Ever elevated blood lipids / Cholesterinw. (Physician diagnosis)',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHlipmedA',
'q_de': 'Erhöhtes Cholesterin: Zurzeit Medikamenteneinnahme',
'q_en': 'Elevated cholesterol: Currently taking medication',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHlz12',
'q_de': 'Leberzirrhose: I.d.l.12 Mon.',
'q_en': 'Cirrhosis: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHmyo12',
'q_de': 'Herzinfarkt: I.d.l. 12 Mon.',
'q_en': 'Heart Attack: I.d.l. 12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHniB12',
'q_de': 'Chron. Nierenprobleme: I.d.l.12 Mon.',
'q_en': '. Chronic kidney problems: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHos12',
'q_de': 'Osteoporose: I.d.l.12 Mon.',
'q_en': 'Osteoporosis: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHra12',
'q_de': 'Arthritis: I.d.l.12 Mon.',
'q_en': 'Arthritis: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'KHsa12',
'q_de': 'Schlaganfall: I.d.l.12 Mon.',
'q_en': 'Stroke: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'KHulc12',
'q_de': 'Magen- oder Zwölffingerdarmgeschwür: I.d.l.12 Mon.',
'q_en': 'Gastric or duodenal ulcer: I.d.l.12 Mon.',
'type': 'binary',
'meta': [{'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'LQsf367C',
'q_de': 'Stärke Schmerzen i.d.l. 4 Wochen',
'q_en': 'Strength pain i.d.l. 4 weeks',
'type': 'select',
'meta': [{'val': 3.0, 'display_en': 'Light', 'display_de': 'Leicht'},
 {'val': 6.0, 'display_en': 'Very strong', 'display_de': 'Sehr stark'},
 {'val': 5.0, 'display_en': 'strongly', 'display_de': 'Stark'},
 {'val': 4.0, 'display_en': 'Moderate', 'display_de': 'Mäßig'},
 {'val': 2.0, 'display_en': 'Very easy', 'display_de': 'Sehr leicht'},
 {'val': 1.0, 'display_en': 'No pain', 'display_de': 'Keine Schmerzen'}]},
{'varname': 'LQsf368C',
'q_de': 'Behinderung in Alltagstätigkeiten durch Schmerzen i.d.l. 4 Wochen',
'q_en': 'Disability in daily activities due to pain i.d.l. 4 weeks',
'type': 'select',
'meta': [{'val': 5.0, 'display_en': 'Very', 'display_de': 'Sehr'},
 {'val': 4.0, 'display_en': 'Quite', 'display_de': 'Ziemlich'},
 {'val': 3.0, 'display_en': 'Moderate', 'display_de': 'Mäßig'},
 {'val': 2.0, 'display_en': 'Something', 'display_de': 'Etwas'},
 {'val': 1.0, 'display_en': 'Not at all', 'display_de': 'Überhaupt nicht'}]},
{'varname': 'LQzufrB10',
'q_de': 'Zufriedenheit: Leben insgesamt',
'q_en': 'overall life satisfaction',
'type': 'continuous',
'meta': {'min': 0, 'max': 1000, 'step': 1}},
{'varname': 'PKdep12',
'q_de': 'Depression: I.d.l. 12 Mon.',
'q_en': 'Depression: I.d.l. 12 Mon.',
'type': 'binary',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'}]},
{'varname': 'RCstat',
'q_de': 'Rauchen',
'q_en': 'Smoke',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Yes, daily',
  'display_de': 'Ja, täglich'},
 {'val': 2.0,
  'display_en': 'Yes, occasionally',
  'display_de': 'Ja, gelegentlich'},
 {'val': 3.0, 'display_en': 'No not more', 'display_de': 'Nein, nicht mehr'},
 {'val': 4.0,
  'display_en': 'Have never smoked',
  'display_de': 'Habe noch nie geraucht'}]},
{'varname': 'SFoslo1C',
'q_de': 'Nahestehende Personen',
'q_en': 'Related parties',
'type': 'select',
'meta': [{'val': 1.0, 'display_en': 'No', 'display_de': 'Keine'},
 {'val': 4.0, 'display_en': '6 or more', 'display_de': '6 oder mehr'},
 {'val': 3.0, 'display_en': '3 to 5', 'display_de': '3 bis 5'},
 {'val': 2.0, 'display_en': '1 to 2', 'display_de': '1 bis 2'}]},
{'varname': 'SFoslo3A',
'q_de': 'Erhalt von Hilfe',
'q_en': 'Getting Help',
'type': 'select',
'meta': [{'val': 1.0,
  'display_en': 'Very difficult',
  'display_de': 'Sehr schwierig'},
 {'val': 2.0, 'display_en': 'Difficult', 'display_de': 'Schwierig'},
 {'val': 4.0, 'display_en': 'Simple', 'display_de': 'Einfach'},
 {'val': 3.0, 'display_en': 'Possible', 'display_de': 'Möglich'},
 {'val': 5.0, 'display_en': 'Very easy', 'display_de': 'Sehr einfach'}]},
{'varname': 'SFosloA',
'q_de': 'Soziale Unterstützung (Oslo-3 Social Support Scale)',
'q_en': 'Social support (Oslo 3 Social Support Scale)',
'type': 'select',
'meta': [{'val': 3.0,
  'display_en': 'strong support',
  'display_de': 'Starke Unterstützung'},
 {'val': 1.0,
  'display_en': 'little support',
  'display_de': 'Geringe Unterstützung'},
 {'val': 2.0,
  'display_en': 'medium support',
  'display_de': 'Mittlere Unterstützung'}]},
{'varname': 'SHhoer1',
'q_de': 'Hörgerät',
'q_en': 'hearing Aid',
'type': 'select',
'meta': [{'val': 3.0,
  'display_en': "I'm hard of hearing or deaf",
  'display_de': 'Ich bin hochgradig schwerhörig oder gehörlos'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'}]},
{'varname': 'SHseh1',
'q_de': 'Brille oder Kontaktlinsen',
'q_en': 'Glasses or Contacts',
'type': 'select',
'meta': [{'val': 1.0, 'display_en': 'Yes', 'display_de': 'Ja'},
 {'val': 2.0, 'display_en': 'No', 'display_de': 'Nein'},
 {'val': 3.0,
  'display_en': 'I am severely visually impaired or can not see',
  'display_de': 'Ich bin stark sehbehindert oder kann nicht sehen'}]}];

let globalTestQuestionIdx = 0;

sockets.init = function (server) {
    // socket.io setup
    var io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        console.log('socket connected | ' + socket.id);

        socket.emit('hb', {msg: "OK"});

        socket.emit('userData', {"userName" : "harald"});

        socket.on('coach:ask', function(data){
            
            // if (globalTestQuestionIdx >= questions.length){
            if (globalTestQuestionIdx >= 4){
                globalTestQuestionIdx = 0;
                socket.emit('coach:complete', {score: 81})
            }else{
              socket.emit('coach:question', questions[globalTestQuestionIdx])

              socket.emit('coach:progress', {perc: globalTestQuestionIdx/questions.length})
            }


            globalTestQuestionIdx++;
        })
        // other logic
    });

}

module.exports = sockets;