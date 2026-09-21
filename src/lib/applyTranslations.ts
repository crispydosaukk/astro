export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta' | 'kn';

export interface ApplyTranslation {
  portalTitle: string;
  portalBadge: string;
  portalSubtitle: string;
  securityEncrypted: string;
  langSelectLabel: string;
  langSelectDesc: string;

  // Stepper
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;

  // Step 1: Profile Form
  personalInfoSection: string;
  credentialsSection: string;
  kycSection: string;
  practiceSection: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  whatsappLabel: string;
  sameAsPhone: string;
  emailLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  experienceLabel: string;
  specialisationLabel: string;
  specialisationHelp: string;
  languagesLabel: string;
  languagesHelp: string;
  otherLangPlaceholder: string;
  learningBgLabel: string;
  learningBgPlaceholder: string;
  certDetailsLabel: string;
  certDetailsPlaceholder: string;
  docTypeLabel: string;
  idNumberLabel: string;
  uploadDocLabel: string;
  uploadDocHelp: string;
  bioLabel: string;
  bioPlaceholder: string;
  btnStartAssessment: string;

  // Step 2: Theory Assessment
  theoryHeader: string;
  theorySubtitle: string;
  questionSourceLabel: string;
  curatedModeOn: string;
  aiModeOff: string;
  questionsCountLabel: string;
  explanationLabel: string;
  btnGradeAssessment: string;
  btnProceedToChart: string;
  scoreText: string;
  passText: string;
  reviewText: string;
  answeredCount: string;

  // Step 3: Kundali Case
  caseHeader: string;
  caseSubtitle: string;
  caseBadgeCustom: string;
  caseBadgeAi: string;
  clientQueryLabel: string;
  lagnaLabel: string;
  moonSignLabel: string;
  dashaLabel: string;
  keyPlacementsLabel: string;
  analysisSectionTitle: string;
  analysisLabel: string;
  analysisPlaceholder: string;
  remediesLabel: string;
  remediesPlaceholder: string;
  btnProceedToInterview: string;
  btnBackToTheory: string;
  btnRegenerateCase: string;

  // Step 4: AI Interview
  interviewHeader: string;
  interviewSubtitle: string;
  interviewTopicLabel: string;
  interviewAnswerPlaceholder: string;
  btnSendAnswer: string;
  btnNextQuestion: string;
  btnFinalSubmit: string;
  examinerLabel: string;
  candidateLabel: string;
  generatingResponse: string;

  // Step 5: Submission Success
  submissionTitle: string;
  submissionDesc: string;
  appRefLabel: string;
  nextStepsNotice: string;
  btnReturnHome: string;

  // Proctoring
  proctorActive: string;
  tabViolationsLabel: string;
  btnBack: string;
}

export const APPLY_TRANSLATIONS: Record<SupportedLanguage, ApplyTranslation> = {
  en: {
    portalTitle: 'AstroParihar Onboarding Portal',
    portalBadge: 'Verified Astrologer Network',
    portalSubtitle: 'Candidate Credentialing, Vedic Theory Assessment & AI Interview',
    securityEncrypted: 'Encrypted Submission · Gmail SMTP & Firestore Sync',
    langSelectLabel: 'Choose Exam & Application Language',
    langSelectDesc: 'All questions, case studies, and AI interview prompts will adapt to your chosen language.',

    step1Title: '1. Profile & KYC',
    step1Desc: 'Personal & Credentials',
    step2Title: '2. Vedic Theory',
    step2Desc: 'Astrology Questions',
    step3Title: '3. Kundali Case',
    step3Desc: 'Blind Chart Diagnosis',
    step4Title: '4. AI Interview',
    step4Desc: 'Viva & Ethics Exam',
    step5Title: '5. Completed',
    step5Desc: 'Application Status',

    personalInfoSection: '1. Personal & Contact Details',
    credentialsSection: '2. Astrological Qualifications & Credentials',
    kycSection: '3. Identity Proof & KYC Verification (Aadhaar / PAN)',
    practiceSection: '4. Practice & Specialisations',
    fullNameLabel: 'Full Name (Legal Name as on ID Proof) *',
    fullNamePlaceholder: 'e.g. Acharya Rakesh Sharma',
    phoneLabel: 'Calling Phone Number *',
    whatsappLabel: 'WhatsApp Number *',
    sameAsPhone: 'WhatsApp number is same as calling number',
    emailLabel: 'Email Address *',
    passwordLabel: 'Set Astrologer Portal Password *',
    passwordPlaceholder: 'Minimum 6 characters',
    locationLabel: 'City & State *',
    locationPlaceholder: 'e.g. New Delhi, Delhi',
    experienceLabel: 'Total Astrological Experience *',
    specialisationLabel: 'Primary Specialisation *',
    specialisationHelp: '(Select all that apply)',
    languagesLabel: 'Languages Known for Consultations *',
    languagesHelp: '(Select all that apply)',
    otherLangPlaceholder: 'e.g. Odia, Assamese, Punjabi...',
    learningBgLabel: 'Astrological Tradition / Gurukul / University Lineage',
    learningBgPlaceholder: 'e.g. Traditional Gurukul, ICAS, Banaras Hindu University (BHU)',
    certDetailsLabel: 'Certification / Title Details (Optional)',
    certDetailsPlaceholder: 'e.g. Jyotish Praveena, Jyotish Visharad, Acharya',
    docTypeLabel: 'Select Document Type *',
    idNumberLabel: 'Card Number',
    uploadDocLabel: 'Upload Photo / Document',
    uploadDocHelp: 'Supports JPG, PNG, WEBP, or PDF (Max 10MB)',
    bioLabel: 'Professional Bio & Consultation Philosophy',
    bioPlaceholder: 'Briefly describe your consultation methodology, ethical approach, and how you guide seekers...',
    btnStartAssessment: 'Proceed to Vedic Theory Assessment →',

    theoryHeader: 'Vedic Astrology Theory Assessment',
    theorySubtitle: 'Evaluate classical astrological logic, divisional charts, dasha analysis, and ethical consultation standards.',
    questionSourceLabel: 'Question Source:',
    curatedModeOn: 'Curated Pool Mode [ON]',
    aiModeOff: 'AI Random Mode [OFF - Dynamic AI]',
    questionsCountLabel: 'Questions:',
    explanationLabel: 'Classical Reason:',
    btnGradeAssessment: 'Grade My Assessment',
    btnProceedToChart: 'Proceed to Blind Kundali Case →',
    scoreText: 'Score:',
    passText: 'Passed',
    reviewText: 'Needs Review',
    answeredCount: 'Answered',

    caseHeader: 'Blind Kundali Case Study',
    caseSubtitle: 'Analyze the planetary chart scenario below and provide your diagnosis and remedial recommendations in your own words.',
    caseBadgeCustom: 'Custom Bank',
    caseBadgeAi: 'AI Dynamic Case',
    clientQueryLabel: "Client's Question & Dilemma:",
    lagnaLabel: 'Ascendant (Lagna)',
    moonSignLabel: 'Moon Sign (Rashi)',
    dashaLabel: 'Current Mahadasha',
    keyPlacementsLabel: 'Key Placements',
    analysisSectionTitle: 'Your Astrological Diagnosis & Remedial Counseling',
    analysisLabel: '1. Kundali Analysis & Astrological Logic * (Minimum 40 characters)',
    analysisPlaceholder: 'Detail your observations on Lagna lord strength, D9 Navamsha confirmation, planetary conflicts, timing of revival through Dasha-Gochara...',
    remediesLabel: '2. Recommended Sattvic Remedies * (Minimum 25 characters)',
    remediesPlaceholder: 'Recommend ethical, non-fear-based remedies: specific Mantras, Vedic Stotras, Daan (charity), ethical lifestyle alignment, and gemstone cautions...',
    btnProceedToInterview: 'Submit Case Study & Proceed to AI Interview →',
    btnBackToTheory: '← Back to Theory',
    btnRegenerateCase: 'Regenerate AI Case',

    interviewHeader: 'Live AI Technical & Ethics Interview',
    interviewSubtitle: 'A structured 3-question viva assessing client consultation empathy, remedial philosophy, and synthesis of conflicting chart factors.',
    interviewTopicLabel: 'Evaluation Topic:',
    interviewAnswerPlaceholder: 'Type your astrological answer in detail (minimum 20 characters)...',
    btnSendAnswer: 'Submit Answer',
    btnNextQuestion: 'Next Examiner Question →',
    btnFinalSubmit: 'Complete Interview & Finalize Application ✓',
    examinerLabel: 'AstroParihar Senior Board Examiner',
    candidateLabel: 'You (Candidate Astrologer)',
    generatingResponse: 'Evaluating your response with classical Vedic Jyotish principles...',

    submissionTitle: 'Application & Assessment Submitted Successfully!',
    submissionDesc: 'Your profile credentials, theory exam score, blind Kundali analysis, and AI viva interview responses have been securely recorded.',
    appRefLabel: 'Application Reference ID',
    nextStepsNotice: 'Our verification board reviews all verified candidates within 24-48 hours. You will receive an official update via Email & WhatsApp.',
    btnReturnHome: 'Return to Home',

    proctorActive: 'AI Anti-Cheating Live Proctor Active',
    tabViolationsLabel: 'Tab Violations:',
    btnBack: 'Back',
  },

  hi: {
    portalTitle: 'एस्ट्रोपरीहार ऑनबोर्डिंग पोर्टल',
    portalBadge: 'सत्यापित ज्योतिषी नेटवर्क',
    portalSubtitle: 'ज्योतिषी क्रेडेंशियलिंग, वैदिक सैद्धांतिक परीक्षा एवं एआई साक्षात्कार',
    securityEncrypted: 'सुरक्षित प्रविष्टि · जीमेल एसएमटीपी एवं फायरस्टोर सिंक',
    langSelectLabel: 'परीक्षा एवं आवेदन भाषा चुनें',
    langSelectDesc: 'सभी प्रश्न, कुंडली केस स्टडी और एआई साक्षात्कार आपकी चुनी हुई भाषा में आयोजित होंगे।',

    step1Title: '1. प्रोफाइल व केवाईसी',
    step1Desc: 'व्यक्तिगत व साख विवरण',
    step2Title: '2. वैदिक सिद्धांत',
    step2Desc: 'ज्योतिष प्रश्नोत्तरी',
    step3Title: '3. कुंडली केस',
    step3Desc: 'अज्ञात चक्र निदान',
    step4Title: '4. एआई साक्षात्कार',
    step4Desc: 'मौखिक व नैतिक परीक्षा',
    step5Title: '5. पूर्ण हुआ',
    step5Desc: 'आवेदन स्थिति',

    personalInfoSection: '1. व्यक्तिगत एवं संपर्क विवरण',
    credentialsSection: '2. ज्योतिषीय योग्यता एवं उपाधि',
    kycSection: '3. पहचान प्रमाण व केवाईसी सत्यापन (आधार / पैन)',
    practiceSection: '4. ज्योतिष अभ्यास एवं विशेषज्ञता',
    fullNameLabel: 'पूरा नाम (पहचान पत्र अनुसार प्रमाणिक नाम) *',
    fullNamePlaceholder: 'उदा. आचार्य राकेश शर्मा',
    phoneLabel: 'कॉलिंग फोन नंबर *',
    whatsappLabel: 'व्हाट्सएप नंबर *',
    sameAsPhone: 'व्हाट्सएप नंबर कॉलिंग नंबर के समान है',
    emailLabel: 'ईमेल पता *',
    passwordLabel: 'ज्योतिषी पोर्टल पासवर्ड बनाएं *',
    passwordPlaceholder: 'न्यूनतम 6 अक्षर',
    locationLabel: 'शहर एवं राज्य *',
    locationPlaceholder: 'उदा. नई दिल्ली, दिल्ली',
    experienceLabel: 'कुल ज्योतिषीय अनुभव *',
    specialisationLabel: 'मुख्य विशेषज्ञता *',
    specialisationHelp: '(सभी लागू विकल्पों का चयन करें)',
    languagesLabel: 'परामर्श हेतु भाषाएं *',
    languagesHelp: '(सभी लागू विकल्पों का चयन करें)',
    otherLangPlaceholder: 'उदा. ओड़िया, असमिया, पंजाबी...',
    learningBgLabel: 'ज्योतिष परंपरा / गुरुकुल / विश्वविद्यालय वंश',
    learningBgPlaceholder: 'उदा. पारंपरिक गुरुकुल, आईसीएएस, बनारस हिंदू विश्वविद्यालय (बीएचयू)',
    certDetailsLabel: 'प्रमाणपत्र / उपाधि विवरण (वैकल्पिक)',
    certDetailsPlaceholder: 'उदा. ज्योतिष प्रवीण, ज्योतिष विशारद, आचार्य',
    docTypeLabel: 'पहचान पत्र प्रकार चुनें *',
    idNumberLabel: 'कार्ड संख्या',
    uploadDocLabel: 'फोटो / दस्तावेज अपलोड करें',
    uploadDocHelp: 'JPG, PNG, WEBP या PDF प्रारूप (अधिकतम 10MB)',
    bioLabel: 'व्यावसायिक परिचय एवं परामर्श दर्शन',
    bioPlaceholder: 'अपनी परामर्श पद्धति, नैतिक दृष्टिकोण और जातकों को मार्गदर्शन देने की विधि संक्षेप में लिखें...',
    btnStartAssessment: 'वैदिक सिद्धांत परीक्षा प्रारंभ करें →',

    theoryHeader: 'वैदिक ज्योतिष सैद्धांतिक परीक्षा',
    theorySubtitle: 'शास्त्रीय ज्योतिषीय तर्क, वर्ग कुंडलियां, दशा विश्लेषण और नैतिक परामर्श मानकों का मूल्यांकन।',
    questionSourceLabel: 'प्रश्न स्रोत:',
    curatedModeOn: 'चयनित प्रश्न बैंक [सक्रिय]',
    aiModeOff: 'एआई डायनामिक मोड [सक्रिय]',
    questionsCountLabel: 'प्रश्नों की संख्या:',
    explanationLabel: 'शास्त्रीय प्रमाण व व्याख्या:',
    btnGradeAssessment: 'मेरी परीक्षा का मूल्यांकन करें',
    btnProceedToChart: 'अज्ञात कुंडली केस की ओर बढ़ें →',
    scoreText: 'अंक:',
    passText: 'उत्तीर्ण',
    reviewText: 'पुनरावलोकन आवश्यक',
    answeredCount: 'उत्तर दिए गए',

    caseHeader: 'अज्ञात कुंडली केस स्टडी (ब्लाइंड चार्ट)',
    caseSubtitle: 'नीचे दी गई ग्रह स्थिति का शास्त्रीय विश्लेषण करें और जातक की समस्या का निदान व सात्विक उपाय अपने शब्दों में लिखें।',
    caseBadgeCustom: 'कस्टम बैंक',
    caseBadgeAi: 'एआई जनरेटेड केस',
    clientQueryLabel: 'जातक की समस्या एवं प्रश्न:',
    lagnaLabel: 'लग्न (Lagna)',
    moonSignLabel: 'जन्म राशि (Moon)',
    dashaLabel: 'वर्तमान महादशा-अंतर्दशा',
    keyPlacementsLabel: 'प्रमुख ग्रह स्थितियां',
    analysisSectionTitle: 'आपका ज्योतिषीय निदान एवं सात्विक परामर्श',
    analysisLabel: '1. कुंडली विश्लेषण एवं शास्त्रीय तर्क * (न्यूनतम 40 अक्षर)',
    analysisPlaceholder: 'लग्नेश बल, नवमेश, नवांश (D9), दशा-गोचर समन्वय और समस्या निवारण के समय-काल का विस्तृत शास्त्रीय विश्लेषण लिखें...',
    remediesLabel: '2. अनुशंसित सात्विक उपाय एवं मार्गदर्शन * (न्यूनतम 25 अक्षर)',
    remediesPlaceholder: 'भयमुक्त सात्विक उपाय लिखें: वैदिक स्तोत्र, मंत्र जप, दान, सेवा, नैतिक जीवनशैली एवं रत्न परामर्श की शास्त्रीय सीमाएं...',
    btnProceedToInterview: 'केस स्टडी सबमिट करें एवं साक्षात्कार में बढ़ें →',
    btnBackToTheory: '← सैद्धांतिक परीक्षा पर वापस',
    btnRegenerateCase: 'नया एआई केस जनरेट करें',

    interviewHeader: 'लाइव एआई तकनीकी एवं नैतिक साक्षात्कार',
    interviewSubtitle: 'जातक परामर्श सहानुभूति, सात्विक उपाय दर्शन एवं परस्पर विरोधी योगों के समन्वय पर 3-प्रश्नीय मौखिक परीक्षा।',
    interviewTopicLabel: 'मूल्यांकन विषय:',
    interviewAnswerPlaceholder: 'अपना ज्योतिषीय उत्तर विस्तार से लिखें (न्यूनतम 20 अक्षर)...',
    btnSendAnswer: 'उत्तर भेजें',
    btnNextQuestion: 'अगला परीक्षक प्रश्न →',
    btnFinalSubmit: 'साक्षात्कार पूर्ण करें एवं आवेदन सबमिट करें ✓',
    examinerLabel: 'एस्ट्रोपरीहार वरिष्ठ परीक्षा बोर्ड',
    candidateLabel: 'आप (प्रत्याशी ज्योतिषी)',
    generatingResponse: 'शास्त्रीय वैदिक नियमों के अनुसार आपके उत्तर का मूल्यांकन हो रहा है...',

    submissionTitle: 'आवेदन एवं मूल्यांकन सफलतापूर्वक जमा हुआ!',
    submissionDesc: 'आपकी क्रेडेंशियल, सैद्धांतिक अंक, कुंडली केस निदान और एआई साक्षात्कार सुरक्षित रूप से दर्ज कर लिए गए हैं।',
    appRefLabel: 'आवेदन संदर्भ संख्या (Application Ref ID)',
    nextStepsNotice: 'हमारा सत्यापन बोर्ड 24-48 घंटों के भीतर समीक्षा करेगा। आपको ईमेल व व्हाट्सएप पर सूचना प्राप्त होगी।',
    btnReturnHome: 'मुख्य पृष्ठ पर लौटें',

    proctorActive: 'एआई परीक्षा सुरक्षा लाइव सक्रिय',
    tabViolationsLabel: 'टैब उल्लंघन:',
    btnBack: 'वापस',
  },

  te: {
    portalTitle: 'ఆస్ట్రోపరిహార్ ఆన్‌బోర్డింగ్ పోర్టల్',
    portalBadge: 'ధృవీకరించబడిన జ్యోతిష్యుల నెట్‌వర్క్',
    portalSubtitle: 'జ్యోతిష్యుల అర్హతల పరిశీలన, వేద సిద్ధాంత పరీక్ష & AI ముఖాముఖి',
    securityEncrypted: 'సురక్షిత నమోదు · Gmail SMTP & Firestore సమకాలీకరణ',
    langSelectLabel: 'పరీక్ష & దరఖాస్తు భాషను ఎంచుకోండి',
    langSelectDesc: 'అన్ని ప్రశ్నలు, కుండలి కేస్ స్టడీ మరియు AI ఇంటర్వ్యూ మీరు ఎంచుకున్న భాషలో నిర్వహించబడతాయి.',

    step1Title: '1. ప్రొఫైల్ & KYC',
    step1Desc: 'వ్యక్తిగత & అర్హతలు',
    step2Title: '2. వేద సిద్ధాంతం',
    step2Desc: 'జ్యోతిష ప్రశ్నలు',
    step3Title: '3. కుండలి కేస్',
    step3Desc: 'బ్లైండ్ చార్ట్ విశ్లేషణ',
    step4Title: '4. AI ముఖాముఖి',
    step4Desc: 'మౌఖిక & నైతిక పరీక్ష',
    step5Title: '5. పూర్తయింది',
    step5Desc: 'దరఖాస్తు స్థితి',

    personalInfoSection: '1. వ్యక్తిగత & సంప్రదింపు వివరాలు',
    credentialsSection: '2. జ్యోతిష్య విద్యార్హతలు & బిరుదులు',
    kycSection: '3. గుర్తింపు రుజువు & KYC ధృవీకరణ (ఆధార్ / పాన్)',
    practiceSection: '4. జ్యోతిష అనుభవం & ప్రత్యేకతలు',
    fullNameLabel: 'పూర్తి పేరు (గుర్తింపు కార్డు ప్రకారం) *',
    fullNamePlaceholder: 'ఉదా. ఆచార్య రాకేష్ శర్మ',
    phoneLabel: 'ఫోన్ నంబర్ *',
    whatsappLabel: 'వాట్సాప్ నంబర్ *',
    sameAsPhone: 'వాట్సాప్ నంబర్ ఫోన్ నంబర్‌తో సమానం',
    emailLabel: 'ఈమెయిల్ చిరునామా *',
    passwordLabel: 'పోర్టల్ పాస్‌వర్డ్ సృష్టించండి *',
    passwordPlaceholder: 'కనీసం 6 అక్షరాలు',
    locationLabel: 'నగరం & రాష్ట్రం *',
    locationPlaceholder: 'ఉదా. హైదరాబాద్, తెలంగాణ',
    experienceLabel: 'మొత్తం జ్యోతిష అనుభవం *',
    specialisationLabel: 'ప్రధాన ప్రత్యేకత *',
    specialisationHelp: '(వర్తించే అన్నింటినీ ఎంచుకోండి)',
    languagesLabel: 'సంప్రదింపుల భాషలు *',
    languagesHelp: '(వర్తించే అన్నింటినీ ఎంచుకోండి)',
    otherLangPlaceholder: 'ఉదా. ఒడియా, అస్సామీ, పంజాబీ...',
    learningBgLabel: 'జ్యోతిష సంప్రదాయం / గురుకులం / విశ్వవిద్యాలయం',
    learningBgPlaceholder: 'ఉదా. సాంప్రదాయ గురుకులం, ICAS, BHU',
    certDetailsLabel: 'సర్టిఫಿಕేషన్ / బిరుదు వివరాలు (ఐచ్ఛికం)',
    certDetailsPlaceholder: 'ఉదా. జ్యోతిష ప్రవీణ, జ్యోతిష విశారద, ఆచార్య',
    docTypeLabel: 'డాక్యుమెంట్ రకం ఎంచుకోండి *',
    idNumberLabel: 'కార్డు సంఖ్య',
    uploadDocLabel: 'ఫోటో / డాక్యుమెంట్ అప్‌లోడ్ చేయండి',
    uploadDocHelp: 'JPG, PNG, WEBP లేదా PDF (గరిష్టంగా 10MB)',
    bioLabel: 'వృత్తిపరమైన పరిచయం & సంప్రదింపుల విధానం',
    bioPlaceholder: 'మీ జ్యోతిష విశ్లేషణ శైలి, నైతిక విధానం మరియు ప్రజలకు మార్గదర్శకత్వం చేసే విధానాన్ని వివరించండి...',
    btnStartAssessment: 'వేద సిద్ధాంత పరీక్షకు వెళ్ళండి →',

    theoryHeader: 'వేద జ్యోతిష సిద్ధాంత పరీక్ష',
    theorySubtitle: 'శాస్త్రీయ జ్యోతిష సూత్రాలు, వర్గ కుండలులు, దశా విశ్లేషణ మరియు నైతిక ప్రమాణాల మూల్యాంకనం.',
    questionSourceLabel: 'ప్రశ్నల మూలం:',
    curatedModeOn: 'ప్రామాణిక బ్యాంక్ [ఆన్]',
    aiModeOff: 'AI డైనమిక్ మోడ్ [ఆన్]',
    questionsCountLabel: 'ప్రశ్నల సంఖ్య:',
    explanationLabel: 'శాస్త్రీయ వివరణ:',
    btnGradeAssessment: 'నా పరీక్షను మూల్యాంకనం చేయండి',
    btnProceedToChart: 'కుండలి కేస్ స్టడీకి వెళ్ళండి →',
    scoreText: 'మార్కులు:',
    passText: 'ఉత్తీర్ణులయ్యారు',
    reviewText: 'పునఃసమీక్ష అవసరం',
    answeredCount: 'సమాధానమిచ్చారు',

    caseHeader: 'బ్లైండ్ కుండలి కేస్ స్టడీ',
    caseSubtitle: 'క్రింది గ్రహ స్థితిని విశ్లేషించి మీ స్వంత మాటలలో రోగ నిర్ధారణ మరియు సాత్విక పరిహారాలను అందించండి.',
    caseBadgeCustom: 'కస్టమ్ బ్యాంక్',
    caseBadgeAi: 'AI డైనమిక్ కేస్',
    clientQueryLabel: 'క్లయింట్ ప్రశ్న & సమస్య:',
    lagnaLabel: 'లగ్నం (Lagna)',
    moonSignLabel: 'రాశి (Moon Sign)',
    dashaLabel: 'ప్రస్తుత మహాదశ',
    keyPlacementsLabel: 'ముఖ్య గ్రహ స్థానాలు',
    analysisSectionTitle: 'మీ జ్యోతిష విశ్లేషణ & సాత్విక పరిహారాలు',
    analysisLabel: '1. కుండలి విశ్లేషణ & శాస్త్రీయ తర్కం * (కనీసం 40 అక్షరాలు)',
    analysisPlaceholder: 'లగ్నాధిపతి బలం, నవాంశ (D9), దశా-గోచార సమన్వయం మరియు సమస్య పరిష్కార సమయాన్ని వివరించండి...',
    remediesLabel: '2. సూచించిన సాత్విక పరిహారాలు * (కనీసం 25 అక్షరాలు)',
    remediesPlaceholder: 'భయపెట్టని సాత్విక పరిహారాలు: మంత్రాలు, స్తోత్రాలు, దానాలు, ధర్మబద్ధమైన జీవనశైలి మార్పులు సూచించండి...',
    btnProceedToInterview: 'కేస్ స్టడీ సమర్పించి AI ఇంటర్వ్యూకి వెళ్ళండి →',
    btnBackToTheory: '← సిద్ధాంత పరీక్షకు వెనక్కి',
    btnRegenerateCase: 'కొత్త AI కేస్ సృష్టించండి',

    interviewHeader: 'లైవ్ AI సాంకేతిక & నైతిక ముఖాముఖి',
    interviewSubtitle: 'క్లయింట్ సంప్రదింపుల సానుభూతి, పరిహార నైతికత మరియు విరుద్ధ గ్రహ స్థితుల సమన్వయంపై 3 ప్రశ్నల పరీక్ష.',
    interviewTopicLabel: 'పరీక్షాంశం:',
    interviewAnswerPlaceholder: 'మీ జ్యోతిష సమాధానాన్ని వివరంగా టైప్ చేయండి (కనీసం 20 అಕ್ಷరాలు)...',
    btnSendAnswer: 'సమాధానం పంపండి',
    btnNextQuestion: 'తదుపరి ప్రశ్న →',
    btnFinalSubmit: 'ఇంటర్వ్యూ పూర్తి చేసి దరఖాస్తును సమర్పించండి ✓',
    examinerLabel: 'ఆస్ట్రోపరిహార్ సీనియర్ బోర్డు ఎగ్జామినర్',
    candidateLabel: 'మీరు (దరఖాస్తుదారు జ్యోతిషి)',
    generatingResponse: 'శాస్త్రీయ వేద నియమాల ప్రకారం మీ సమాధానం పరిశీలించబడుతోంది...',

    submissionTitle: 'దరఖాస్తు & పరీక్ష విజయవంతంగా సమర్పించబడింది!',
    submissionDesc: 'మీ వివరాలు, సిద్ధాంత పరీక్ష మార్కులు, కుండలి కేస్ విశ్లేషణ మరియు AI ఇంటర్వ్యూ సమాధానాలు సురక్షితంగా నమోదు చేయబడ్డాయి.',
    appRefLabel: 'దరఖాస్తు రిఫరెన్స్ సంఖ్య (Application Ref ID)',
    nextStepsNotice: 'మా పరిశీలనా బోర్డు 24-48 గంటల్లో మీ దరఖాస్తును సమీక్షిస్తుంది. ఈమెయిల్ మరియు వాట్సాప్ ద్వారా మీకు సమాచారం అందుతుంది.',
    btnReturnHome: 'హోమ్ పేజీకి తిరిగి వెళ్ళండి',

    proctorActive: 'AI పరీక్ష భద్రతా పర్యవేక్షణ చురుగ్గా ఉంది',
    tabViolationsLabel: 'ట్యాబ్ ఉల్లంఘనలు:',
    btnBack: 'వెనక్కి',
  },

  ta: {
    portalTitle: 'ஆஸ்ட்ரோபரிஹார் ஆன்போர்டிங் போர்டல்',
    portalBadge: 'சரிபார்க்கப்பட்ட ஜோதிடர்கள் நெட்வொர்க்',
    portalSubtitle: 'ஜோதிடர் தகுதிச் சரிபார்ப்பு, வேத கோட்பாட்டுத் தேர்வு & AI நேர்காணல்',
    securityEncrypted: 'பாதுகாப்பான சமர்ப்பிப்பு · Gmail SMTP & Firestore ஒத்திசைவு',
    langSelectLabel: 'தேர்வு மற்றும் விண்ணப்ப மொழியைத் தேர்ந்தெடுக்கவும்',
    langSelectDesc: 'அனைத்து கேள்விகள், ஜாதக ஆய்வு மற்றும் AI நேர்காணல் நீங்கள் தேர்ந்தெடுக்கும் மொழியில் நடைபெறும்.',

    step1Title: '1. சுயவிவரம் & KYC',
    step1Desc: 'தனிப்பட்ட & தகுதி விவரங்கள்',
    step2Title: '2. வேத கோட்பாடு',
    step2Desc: 'ஜோதிட கேள்விகள்',
    step3Title: '3. ஜாதக ஆய்வு',
    step3Desc: 'பிளைண்ட் சார்ட் ஆய்வு',
    step4Title: '4. AI நேர்காணல்',
    step4Desc: 'வாய்மொழி & நெறிமுறைத் தேர்வு',
    step5Title: '5. நிறைவுற்றது',
    step5Desc: 'விண்ணப்ப நிலை',

    personalInfoSection: '1. தனிப்பட்ட மற்றும் தொடர்பு விவரங்கள்',
    credentialsSection: '2. ஜோதிட கல்வித் தகுதிகள் & பட்டங்கள்',
    kycSection: '3. அடையாளச் சான்று & KYC சரிபார்ப்பு (ஆதார் / பான்)',
    practiceSection: '4. ஜோதிட அனுபவம் & சிறப்பம்சங்கள்',
    fullNameLabel: 'முழு பெயர் (சான்றிதழ் மற்றும் அடையாள அட்டையில் உள்ளபடி) *',
    fullNamePlaceholder: 'எ.கா. ஆச்சார்யா ராகேஷ் சர்மா',
    phoneLabel: 'அழைப்பு தொலைபேசி எண் *',
    whatsappLabel: 'வாட்ஸ்அப் எண் *',
    sameAsPhone: 'வாட்ஸ்அப் எண் அழைப்பு எண்ணைப் போன்றதே',
    emailLabel: 'மின்னஞ்சல் முகவரி *',
    passwordLabel: 'போர்டல் கடவுச்சொல்லை அமைக்கவும் *',
    passwordPlaceholder: 'குறைந்தது 6 எழுத்துகள்',
    locationLabel: 'நகரம் & மாநிலம் *',
    locationPlaceholder: 'எ.கா. சென்னை, தமிழ்நாடு',
    experienceLabel: 'மொத்த ஜோதிட அனுபவம் *',
    specialisationLabel: 'முதன்மை சிறப்புத் துறை *',
    specialisationHelp: '(பொருந்தக்கூடிய அனைத்தையும் தேர்வு செய்க)',
    languagesLabel: 'ஆலோசனைக்கான மொழிகள் *',
    languagesHelp: '(பொருந்தக்கூடிய அனைத்தையும் தேர்வு செய்க)',
    otherLangPlaceholder: 'எ.கா. ஒடியா, அஸ்ஸாமி, பஞ்சாபி...',
    learningBgLabel: 'ஜோதிட பாரம்பரியம் / குருகுலம் / பல்கலைக்கழகம்',
    learningBgPlaceholder: 'எ.கா. பாரம்பரிய குருகுலம், ICAS, BHU',
    certDetailsLabel: 'சான்றிதழ் / பட்ட விவரங்கள் (விருப்பத்தேர்வு)',
    certDetailsPlaceholder: 'எ.கா. ஜோதிட பிரவீணா, ஜோதிட விஷாரதா, ஆச்சார்யா',
    docTypeLabel: 'ஆவண வகையைத் தேர்ந்தெடுக்கவும் *',
    idNumberLabel: 'அட்டை எண்',
    uploadDocLabel: 'புகைப்படம் / ஆவணத்தை பதிவேற்றவும்',
    uploadDocHelp: 'JPG, PNG, WEBP அல்லது PDF (அதிகபட்சம் 10MB)',
    bioLabel: 'தொழில்முறை சுயவிவரம் & ஆலோசனை தத்துவம்',
    bioPlaceholder: 'உங்கள் ஜோதிட முறை, சாத்விக அணுகுமுறை மற்றும் மக்களுக்கு வழிகாட்டும் விதத்தை விவரிக்கவும்...',
    btnStartAssessment: 'வேத கோட்பாட்டுத் தேர்வுக்கு செல்லவும் →',

    theoryHeader: 'வேத ஜோதிட கோட்பாட்டுத் தேர்வு',
    theorySubtitle: 'பாரம்பரிய ஜோதிட விதிகள், வர்க்க சக்கரங்கள், தசா பலன்கள் மற்றும் நெறிமுறை தரங்களை மதிப்பீடு செய்தல்.',
    questionSourceLabel: 'கேள்வி மூலம்:',
    curatedModeOn: 'வங்கி முறை [ஆன்]',
    aiModeOff: 'AI டைனமிக் முறை [ஆன்]',
    questionsCountLabel: 'கேள்விகள் எண்ணிக்கை:',
    explanationLabel: 'சாஸ்திர விளக்கம்:',
    btnGradeAssessment: 'என் தேர்வை மதிப்பீடு செய்',
    btnProceedToChart: 'ஜாதக ஆய்வுக்கு செல்லவும் →',
    scoreText: 'மதிப்பெண்:',
    passText: 'தேர்ச்சி',
    reviewText: 'மறுஆய்வு தேவை',
    answeredCount: 'பதிலளிக்கப்பட்டது',

    caseHeader: 'பிளைண்ட் ஜாதக ஆய்வு (கேஸ் ஸ்டடி)',
    caseSubtitle: 'கீழே கொடுக்கப்பட்டுள்ள கிரக அமைப்பை ஆய்வு செய்து உங்கள் சொந்த வார்த்தைகளில் பலன்களையும் சாத்விக பரிகாரங்களையும் அளிக்கவும்.',
    caseBadgeCustom: 'வங்கி முறை',
    caseBadgeAi: 'AI டைனமிக் கேஸ்',
    clientQueryLabel: 'வாடிக்கையாளரின் கேள்வி & பிரச்சனை:',
    lagnaLabel: 'லக்னம் (Lagna)',
    moonSignLabel: 'ராசி (Moon Sign)',
    dashaLabel: 'தற்போதைய மகா தசா',
    keyPlacementsLabel: 'முக்கிய கிரக நிலைகள்',
    analysisSectionTitle: 'உங்கள் ஜோதிட பகுப்பாய்வு & சாத்விக பரிகாரங்கள்',
    analysisLabel: '1. ஜாதக ஆய்வு & சாஸ்திர விளக்கம் * (குறைந்தது 40 எழுத்துகள்)',
    analysisPlaceholder: 'லக்னாதிபதி பலம், நவாம்சம் (D9), தசா-கோச்சார ஒருங்கிணைப்பு மற்றும் பிரச்சனை தீரும் காலத்தை விளக்கவும்...',
    remediesLabel: '2. பரிந்துரைக்கப்படும் சாத்விக பரிகாரங்கள் * (குறைந்தது 25 எழுத்துகள்)',
    remediesPlaceholder: 'அச்சமூட்டாத சாத்விக பரிகாரங்கள்: குறிப்பிட்ட மந்திரங்கள், ஸ்தோத்திரங்கள், தானங்கள் மற்றும் ரத்தின ஆலோசனைகள்...',
    btnProceedToInterview: 'கேஸ் ஸ்டடியை சமர்ப்பித்து AI நேர்காணலுக்கு செல்லவும் →',
    btnBackToTheory: '← கோட்பாட்டுத் தேர்வுக்கு திரும்புக',
    btnRegenerateCase: 'புதிய AI கேஸ் உருவாக்குக',

    interviewHeader: 'நேரடி AI தொழில்நுட்ப & நெறிமுறை நேர்காணல்',
    interviewSubtitle: 'வாடிக்கையாளர் பரிவு, பரிகார நெறிமுறைகள் மற்றும் முரண்பட்ட கிரக பலன்களின் ஒருங்கிணைப்பு குறித்த 3 கேள்விகள் கொண்ட தேர்வு.',
    interviewTopicLabel: 'மதிப்பீட்டு தலைப்பு:',
    interviewAnswerPlaceholder: 'உங்கள் ஜோதிட பதிலை விரிவாக தட்டச்சு செய்யவும் (குறைந்தது 20 எழுத்துகள்)...',
    btnSendAnswer: 'பதிலை சமர்ப்பிக்கவும்',
    btnNextQuestion: 'அடுத்த கேள்வி →',
    btnFinalSubmit: 'நேர்காணலை முடித்து விண்ணப்பத்தை சமர்ப்பிக்கவும் ✓',
    examinerLabel: 'ஆஸ்ட்ரோபரிஹார் மூத்த தேர்வு வாரியம்',
    candidateLabel: 'நீங்கள் (விண்ணப்பதாரர் ஜோதிடர்)',
    generatingResponse: 'சாஸ்திர விதிகளின்படி உங்கள் பதில் மதிப்பீடு செய்யப்படுகிறது...',

    submissionTitle: 'விண்ணப்பம் மற்றும் தேர்வு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    submissionDesc: 'உங்கள் சுயவிவரம், கோட்பாட்டுத் தேர்வு மதிப்பெண், ஜாதக ஆய்வு மற்றும் AI நேர்காணல் பதில்கள் பாதுகாப்பாக பதிவு செய்யப்பட்டுள்ளன.',
    appRefLabel: 'விண்ணப்ப குறிப்பு எண் (Application Ref ID)',
    nextStepsNotice: 'எங்கள் சரிபார்ப்பு வாரியம் 24-48 மணி நேரத்திற்குள் மதிப்பாய்வு செய்யும். மின்னஞ்சல் மற்றும் வாட்ஸ்அப் வழியாக தகவல் தெரிவிக்கப்படும்.',
    btnReturnHome: 'முகப்பு பக்கத்திற்கு திரும்புக',

    proctorActive: 'AI தேர்வு பாதுகாப்பு நேரடி கண்காணிப்பு செயலில் உள்ளது',
    tabViolationsLabel: 'தாவல் மீறல்கள்:',
    btnBack: 'பின்செல்க',
  },

  kn: {
    portalTitle: 'ಆಸ್ಟ್ರೋಪರಿಹಾರ ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಪೋರ್ಟಲ್',
    portalBadge: 'ದೃಢೀಕೃತ ಜ್ಯೋತಿಷಿಗಳ ಜಾಲ',
    portalSubtitle: 'ಜ್ಯೋತಿಷಿಗಳ ಅರ್ಹತಾ ಪರಿಶೀಲನೆ, ವೈದಿಕ ಸಿದ್ಧಾಂತ ಪರೀಕ್ಷೆ & AI ಸಂದರ್ಶನ',
    securityEncrypted: 'ಸುರಕ್ಷಿತ ಸಲ್ಲಿಕೆ · Gmail SMTP & Firestore ಸಿಂಕ್',
    langSelectLabel: 'ಪರೀಕ್ಷೆ & ಅರ್ಜಿ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    langSelectDesc: 'ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳು, ಕುಂಡಲಿ ಕೇಸ್ ಸ್ಟಡಿ ಮತ್ತು AI ಸಂದರ್ಶನವು ನೀವು ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ನಡೆಯುತ್ತದೆ.',

    step1Title: '1. ಪ್ರೊಫೈಲ್ & KYC',
    step1Desc: 'ವೈಯಕ್ತಿಕ & ವಿದ್ಯಾರ್ಹತೆ',
    step2Title: '2. ವೈದಿಕ ಸಿದ್ಧಾಂತ',
    step2Desc: 'ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಗಳು',
    step3Title: '3. ಕುಂಡಲಿ ಕೇಸ್',
    step3Desc: 'ಬ್ಲೈಂಡ್ ಚಾರ್ಟ್ ರೋಗನಿರ್ಣಯ',
    step4Title: '4. AI ಸಂದರ್ಶನ',
    step4Desc: 'ಮೌಖಿಕ & ನೈತಿಕ ಪರೀಕ್ಷೆ',
    step5Title: '5. ಪೂರ್ಣಗೊಂಡಿದೆ',
    step5Desc: 'ಅರ್ಜಿ ಸ್ಥಿತಿ',

    personalInfoSection: '1. ವೈಯಕ್ತಿಕ & ಸಂಪರ್ಕ ವಿವರಗಳು',
    credentialsSection: '2. ಜ್ಯೋತಿಷ್ಯ ವಿದ್ಯಾರ್ಹತೆಗಳು & ಬಿರುದುಗಳು',
    kycSection: '3. ಗುರುತಿನ ಪುರಾವೆ & KYC ಪರಿಶೀಲನೆ (ಆಧಾರ್ / ಪಾನ್)',
    practiceSection: '4. ಜ್ಯೋತಿಷ್ಯ ಅಭ್ಯಾಸ & ವಿಶೇಷತೆಗಳು',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು (ಗುರುತಿನ ಚೀಟಿಯ ಪ್ರಕಾರ ಅಧಿಕೃತ ಹೆಸರು) *',
    fullNamePlaceholder: 'ಉದಾ. ಆಚಾರ್ಯ ರಾಕೇಶ್ ಶರ್ಮಾ',
    phoneLabel: 'ಕರೆ ಮಾಡುವ ಫೋನ್ ಸಂಖ್ಯೆ *',
    whatsappLabel: 'ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ *',
    sameAsPhone: 'ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆಯು ಕರೆ ಸಂಖ್ಯೆಯಂತೆಯೇ ಇದೆ',
    emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ *',
    passwordLabel: 'ಪೋರ್ಟಲ್ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ *',
    passwordPlaceholder: 'ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು',
    locationLabel: 'ನಗರ & ರಾಜ್ಯ *',
    locationPlaceholder: 'ಉದಾ. ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ',
    experienceLabel: 'ಒಟ್ಟು ಜ್ಯೋತಿಷ್ಯ ಅನುಭವ *',
    specialisationLabel: 'ಪ್ರಮುಖ ವಿಶೇಷತೆ *',
    specialisationHelp: '(ಅನ್ವಯವಾಗುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ)',
    languagesLabel: 'ಸಲಹೆಗಾಗಿ ಭಾಷೆಗಳು *',
    languagesHelp: '(ಅನ್ವಯವಾಗುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ)',
    otherLangPlaceholder: 'ಉದಾ. ಒಡಿಯಾ, ಅಸ್ಸಾಮಿ, ಪಂಜಾಬಿ...',
    learningBgLabel: 'ಜ್ಯೋತಿಷ್ಯ ಸಂಪ್ರದಾಯ / ಗುರುಕುಲ / ವಿಶ್ವವಿದ್ಯಾಲಯ',
    learningBgPlaceholder: 'ಉದಾ. ಸಾಂಪ್ರದಾಯಿಕ ಗುರುಕುಲ, ICAS, BHU',
    certDetailsLabel: 'ಪ್ರಮಾಣಪತ್ರ / ಬಿರುದು ವಿವರಗಳು (ಐಚ್ಛಿಕ)',
    certDetailsPlaceholder: 'ಉದಾ. ಜ್ಯೋತಿಷ ಪ್ರವೀಣ, ಜ್ಯೋತಿಷ ವಿಶಾರದ, ಆಚಾರ್ಯ',
    docTypeLabel: 'ದಾಖಲೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ *',
    idNumberLabel: 'ಕಾರ್ಡ್ ಸಂಖ್ಯೆ',
    uploadDocLabel: 'ಫೋಟೋ / ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadDocHelp: 'JPG, PNG, WEBP ಅಥವಾ PDF (ಗರಿಷ್ಠ 10MB)',
    bioLabel: 'ವೃತ್ತಿಪರ ಪರಿಚಯ & ಸಲಹಾ ತತ್ವಶಾಸ್ತ್ರ',
    bioPlaceholder: 'ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಶೈಲಿ, ನೈತಿಕ ವಿಧಾನ ಮತ್ತು ಜನರಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ ವಿಧಾನವನ್ನು ವಿವರಿಸಿ...',
    btnStartAssessment: 'ವೈದಿಕ ಸಿದ್ಧಾಂತ ಪರೀಕ್ಷೆಗೆ ಮುಂದುವರಿಯಿರಿ →',

    theoryHeader: 'ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಸಿದ್ಧಾಂತ ಪರೀಕ್ಷೆ',
    theorySubtitle: 'ಶಾಸ್ತ್ರೀಯ ಜ್ಯೋತಿಷ್ಯ ತರ್ಕ, ವರ್ಗ ಕುಂಡಲಿಗಳು, ದಶಾ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ನೈತಿಕ ಸಲಹಾ ಮಾನದಂಡಗಳ ಮೌಲ್ಯಮಾಪನ.',
    questionSourceLabel: 'ಪ್ರಶ್ನೆ ಮೂಲ:',
    curatedModeOn: 'ಪ್ರಮಾಣಿತ ಬ್ಯಾಂಕ್ [ಆನ್]',
    aiModeOff: 'AI ಡೈನಾಮಿಕ್ ಮೋಡ್ [ಆನ್]',
    questionsCountLabel: 'ಪ್ರಶ್ನೆಗಳ ಸಂಖ್ಯೆ:',
    explanationLabel: 'ಶಾಸ್ತ್ರೀಯ ವಿವರಣೆ:',
    btnGradeAssessment: 'ನನ್ನ ಪರೀಕ್ಷೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    btnProceedToChart: 'ಕುಂಡಲಿ ಕೇಸ್ ಸ್ಟಡಿಗೆ ಮುಂದುವರಿಯಿರಿ →',
    scoreText: 'ಅಂಕಗಳು:',
    passText: 'ಉತ್ತೀರ್ಣರಾಗಿದ್ದೀರಿ',
    reviewText: 'ಮರುಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    answeredCount: 'ಉತ್ತರಿಸಲಾಗಿದೆ',

    caseHeader: 'ಬ್ಲೈಂಡ್ ಕುಂಡಲಿ ಕೇಸ್ ಸ್ಟಡಿ',
    caseSubtitle: 'ಕೆಳಗಿನ ಗ್ರಹ ಸ್ಥಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ರೋಗನಿರ್ಣಯ ಮತ್ತು ಸಾತ್ವಿಕ ಪರಿಹಾರಗಳನ್ನು ನೀಡಿ.',
    caseBadgeCustom: 'ಕಸ್ಟಮ್ ಬ್ಯಾಂಕ್',
    caseBadgeAi: 'AI ಡೈನಾಮಿಕ್ ಕೇಸ್',
    clientQueryLabel: 'ಕ್ಲೈಂಟ್‌ನ ಪ್ರಶ್ನೆ & ಸಮಸ್ಯೆ:',
    lagnaLabel: 'ಲಗ್ನ (Lagna)',
    moonSignLabel: 'ಜನ್ಮ ರಾಶಿ (Moon Sign)',
    dashaLabel: 'ಪ್ರಸ್ತುತ ಮಹಾದಶಾ',
    keyPlacementsLabel: 'ಪ್ರಮುಖ ಗ್ರಹ ಸ್ಥಾನಗಳು',
    analysisSectionTitle: 'ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ & ಸಾತ್ವಿಕ ಪರಿಹಾರಗಳು',
    analysisLabel: '1. ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ & ಶಾಸ್ತ್ರೀಯ ತರ್ಕ * (ಕನಿಷ್ಠ 40 ಅಕ್ಷರಗಳು)',
    analysisPlaceholder: 'ಲಗ್ನಾಧಿಪತಿ ಬಲ, ನವಾಂಶ (D9), ದಶಾ-ಗೋಚಾರ ಸಮನ್ವಯ ಮತ್ತು ಸಮಸ್ಯೆ ನಿವಾರಣೆಯ ಸಮಯವನ್ನು ವಿವರಿಸಿ...',
    remediesLabel: '2. ಶಿಫಾರಸು ಮಾಡಿದ ಸಾತ್ವಿಕ ಪರಿಹಾರಗಳು * (ಕನಿಷ್ಠ 25 ಅಕ್ಷರಗಳು)',
    remediesPlaceholder: 'ಭಯಪಡಿಸದ ಸಾತ್ವಿಕ ಪರಿಹಾರಗಳು: ಮಂತ್ರಗಳು, ಸ್ತೋತ್ರಗಳು, ದಾನ, ಧರ್ಮಬದ್ಧ ಜೀವನಶೈಲಿ ಮತ್ತು ರತ್ನ ಧರಿಸುವ ಸಲಹೆಗಳು...',
    btnProceedToInterview: 'ಕೇಸ್ ಸ್ಟಡಿ ಸಲ್ಲಿಸಿ AI ಸಂದರ್ಶನಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ →',
    btnBackToTheory: '← ಸಿದ್ಧಾಂತ ಪರೀಕ್ಷೆಗೆ ಹಿಂತಿರುಗಿ',
    btnRegenerateCase: 'ಹೊಸ AI ಕೇಸ್ ರಚಿಸಿ',

    interviewHeader: 'ಲೈವ್ AI ತಾಂತ್ರಿಕ & ನೈತಿಕ ಸಂದರ್ಶನ',
    interviewSubtitle: 'ಕ್ಲೈಂಟ್ ಸಲಹಾ ಸಹಾನುಭೂತಿ, ಪರಿಹಾರ ನೈತಿಕತೆ ಮತ್ತು ವಿರೋಧಾತ್ಮಕ ಗ್ರಹ ಅಂಶಗಳ ಸಮನ್ವಯದ ಕುರಿತು 3 ಪ್ರಶ್ನೆಗಳ ಪರೀಕ್ಷೆ.',
    interviewTopicLabel: 'ಮೌಲ್ಯಮಾಪನ ವಿಷಯ:',
    interviewAnswerPlaceholder: 'ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಉತ್ತರವನ್ನು ವಿವರವಾಗಿ ಟೈಪ್ ಮಾಡಿ (ಕನಿಷ್ಠ 20 ಅಕ್ಷರಗಳು)...',
    btnSendAnswer: 'ಉತ್ತರವನ್ನು ಸಲ್ಲಿಸಿ',
    btnNextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ →',
    btnFinalSubmit: 'ಸಂದರ್ಶನ ಮುಗಿಸಿ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ ✓',
    examinerLabel: 'ಆಸ್ಟ್ರೋಪರಿಹಾರ ಹಿರಿಯ ಮಂಡಳಿ ಪರೀಕ್ಷಕರು',
    candidateLabel: 'ನೀವು (ಅಭ್ಯರ್ಥಿ ಜ್ಯೋತಿಷಿ)',
    generatingResponse: 'ಶಾಸ್ತ್ರೀಯ ವೈದಿಕ ನಿಯಮಗಳ ಪ್ರಕಾರ ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ...',

    submissionTitle: 'ಅರ್ಜಿ ಮತ್ತು ಪರೀಕ್ಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
    submissionDesc: 'ನಿಮ್ಮ ವಿವರಗಳು, ಸಿದ್ಧಾಂತ ಪರೀಕ್ಷೆಯ ಅಂಕಗಳು, ಕುಂಡಲಿ ಕೇಸ್ ರೋಗನಿರ್ಣಯ ಮತ್ತು AI ಸಂದರ್ಶನದ ಉತ್ತರಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.',
    appRefLabel: 'ಅರ್ಜಿ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ (Application Ref ID)',
    nextStepsNotice: 'ನಮ್ಮ ಪರಿಶೀಲನಾ ಮಂಡಳಿಯು 24-48 ಗಂಟೆಗಳ ಒಳಗೆ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ. ಇಮೇಲ್ ಮತ್ತು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಮಾಹಿತಿ ತಿಳಿಸಲಾಗುವುದು.',
    btnReturnHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',

    proctorActive: 'AI ಪರೀಕ್ಷಾ ಸುರಕ್ಷತೆ ಲೈವ್ ಮೇಲ್ವಿಚಾರಣೆ ಸಕ್ರಿಯವಾಗಿದೆ',
    tabViolationsLabel: 'ಟ್ಯಾಬ್ ಉಲ್ಲಂಘನೆಗಳು:',
    btnBack: 'ಹಿಂದೆ',
  }
};
