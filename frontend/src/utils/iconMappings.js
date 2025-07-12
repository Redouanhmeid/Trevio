export const getHouseRuleDetails = (rule) => {
 const icons = {
  noNoise: {
   icon: <i className="icon-style-dg fa-light fa-volume-slash"></i>,
   title: 'rules.noNoise',
  },
  noFoodDrinks: {
   icon: <i className="icon-style-dg fa-light fa-utensils-slash"></i>,
   title: 'rules.noFoodDrinks',
  },
  noParties: {
   icon: <i className="icon-style-dg fa-light fa-champagne-glasses"></i>,
   title: 'rules.noParties',
  },
  noSmoking: {
   icon: <i className="icon-style-dg fa-light fa-ban-smoking"></i>,
   title: 'rules.noSmoking',
  },
  noPets: {
   icon: <i className="icon-style-dg fa-light fa-paw-simple"></i>,
   title: 'rules.noPets',
  },
  additionalRules: {
   icon: <i className="icon-style-dg fa-light fa-circle-info"></i>,
   title: 'rules.additionalRules',
  },
 };
 return icons[rule] || { icon: null, title: '' };
};

export const getElementsDetails = (element) => {
 const elements = {
  cameras: {
   icon: <i className="icon-style-dg fa-light fa-camera-cctv"></i>,
   title: 'elements.cameras',
  },
  sonometers: {
   icon: <i className="icon-style-dg fa-light fa-gauge-low"></i>,
   title: 'elements.sonometers',
  },
 };
 return elements[element] || { icon: null, title: '' };
};

export const getSafetyFeaturesDetails = (feature) => {
 const features = {
  smokeDetector: {
   icon: <i className="icon-style-dg fa-light fa-sensor-cloud"></i>,
   title: 'safetyFeatures.smokeDetector',
  },
  firstAidKit: {
   icon: <i className="icon-style-dg fa-light fa-suitcase-medical"></i>,
   title: 'safetyFeatures.firstAidKit',
  },
  fireExtinguisher: {
   icon: <i className="icon-style-dg fa-light fa-fire-extinguisher"></i>,
   title: 'safetyFeatures.fireExtinguisher',
  },
  carbonMonoxideDetector: {
   icon: <i className="icon-style-dg fa-light fa-sensor"></i>,
   title: 'safetyFeatures.carbonMonoxideDetector',
  },
 };
 return features[feature] || { icon: null, title: '' };
};

export const getEarlyCheckInDetails = (earlyCheckIn) => {
 switch (earlyCheckIn) {
  case 'heureNonFlexible':
   return 'checkIn.policy.notFlexible';
  case 'ajustementHeure':
   return 'checkIn.policy.adjustTime';
  case 'autreHeureArrivee':
   return 'checkIn.policy.alternateTime';
  case 'laissezBagages':
   return 'checkIn.policy.storeBags';
  default:
   return '';
 }
};

export const getAccessToPropertyDetails = (accessToProperty) => {
 switch (accessToProperty) {
  case 'cleDansBoite':
   return 'checkIn.access.keyInBox';
  case 'acceuilContactezMoi':
   return 'checkIn.access.welcomeContact';
  case 'codesAccesCourriel':
   return 'checkIn.access.codesByEmail';
  case 'verifiezCourriel':
   return 'checkIn.access.checkEmail';
  case 'serrureNumero':
   return 'checkIn.access.numberLock';
  default:
   return '';
 }
};

export const getLateCheckOutPolicyDetails = (lateCheckOutPolicy) => {
 switch (lateCheckOutPolicy) {
  case 'heureNonFlexible':
   return 'checkOut.policy.notFlexible';
  case 'heureDepartAlternative':
   return 'checkOut.policy.alternateTime';
  case 'contactezNous':
   return 'checkOut.policy.contactUs';
  case 'optionDepartTardif':
   return 'checkOut.policy.lateOption';
  default:
   return '';
 }
};

export const getBeforeCheckOutDetails = (beforeCheckOut) => {
 switch (beforeCheckOut) {
  case 'vaisselleLaveVaisselle':
   return 'checkOut.tasks.finalDishes';
  case 'eteindreAppareilsElectriques':
   return 'checkOut.tasks.turnOffAppliances';
  case 'porteNonVerrouillee':
   return 'checkOut.tasks.doorLocked';
  case 'laissezBagages':
   return 'checkOut.tasks.storeBags';
  case 'signezLivreOr':
   return 'checkOut.tasks.guestBook';
  case 'litsNonFaits':
   return 'checkOut.tasks.unmadeBeds';
  case 'laverVaisselle':
   return 'checkOut.tasks.cleanDishes';
  case 'replacezMeubles':
   return 'checkOut.tasks.replaceFurniture';
  case 'deposePoubelles':
   return 'checkOut.tasks.garbage';
  case 'serviettesDansBaignoire':
   return 'checkOut.tasks.towelsInBath';
  case 'serviettesParTerre':
   return 'checkOut.tasks.towelsOnFloor';
  case 'portesVerrouillees':
   return 'checkOut.tasks.doorUnlocked';
  case 'laissezCleMaison':
   return 'checkOut.tasks.keyInHouse';
  case 'laissezCleBoiteCle':
   return 'checkOut.tasks.keyInBox';
  default:
   return '';
 }
};
