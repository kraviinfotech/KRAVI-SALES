const express = require('express');

const router = express.Router();

const SUPPORTED_LANGUAGES = new Set(['hi', 'en', 'mr']);
const VALID_ROLES = new Set(['user', 'assistant']);

const LANGUAGE_NAMES = {
  hi: 'Hindi/Hinglish',
  en: 'English',
  mr: 'Marathi',
};

const SUPPORT_EMAIL = 'contact@kraviinfotech.com';
const SUPPORT_PHONE = '7657013534';

const LOCAL_REPLIES = [
  {
    keywords: ['hindi', 'english', 'marathi', 'language', 'bhasha', 'jawab', 'jwab', 'reply', 'chatbot', 'bot'],
    hi: 'Haan, KRAVI Bot user ki language ke hisaab se reply dega:\n1. Hindi/Hinglish me puchhenge to Hindi/Hinglish reply milega.\n2. English me puchhenge to English reply milega.\n3. Marathi me puchhenge to Marathi reply milega.\nAap KRAVI app se related question poochhiye, main usi language me help karunga.',
    en: 'Yes, KRAVI Bot replies based on the user language:\n1. Hindi/Hinglish questions get Hindi/Hinglish replies.\n2. English questions get English replies.\n3. Marathi questions get Marathi replies.\nAsk any KRAVI app related question and I will reply in the same language.',
    mr: 'Ho, KRAVI Bot user chya language nusar reply deto:\n1. Hindi/Hinglish madhe vicharle tar Hindi/Hinglish reply milel.\n2. English madhe vicharle tar English reply milel.\n3. Marathi madhe vicharle tar Marathi reply milel.\nKRAVI app related prashna vichara, mi tyach language madhe madad karen.',
  },
  {
    keywords: ['seller login', 'seller ka login', 'seller login kaise', 'seller account', 'seller signin', 'seller sign in'],
    hi: 'Seller login ke liye:\n1. Login page par Seller tab select karein.\n2. Manager ne jo Email/Mobile aur password diya hai, woh enter karein.\n3. Login par click karein.\nAgar password bhool gaye hain to "Forgot Password" se OTP ke through reset karein.',
    en: 'For seller login:\n1. Select the Seller tab on the login page.\n2. Enter the Email/Mobile and password shared by your Manager.\n3. Click Login.\nIf you forgot the password, use Forgot Password and reset it with OTP.',
    mr: 'Seller login sathi:\n1. Login page var Seller tab select kara.\n2. Manager ne dilela Email/Mobile ani password taka.\n3. Login var click kara.\nPassword visarla asel tar Forgot Password vaprun OTP ne reset kara.',
  },
  {
    keywords: ['login', 'sign in', 'signin', 'password', 'otp', 'forgot password', 'reset password', 'login nahi', 'login nhi'],
    hi: 'Login ke liye Email/Mobile aur password enter karein. Seller ho to Seller tab, Manager ho to Manager tab select karein. Login nahi ho raha hai to Forgot Password se OTP lekar password reset karein.',
    en: 'To log in, enter your Email/Mobile and password. Sellers should use the Seller tab, and Managers should use the Manager tab. If login fails, use Forgot Password to reset with OTP.',
    mr: 'Login sathi Email/Mobile ani password taka. Seller asel tar Seller tab, Manager asel tar Manager tab vapra. Login hot nasel tar Forgot Password madhun OTP gheun password reset kara.',
  },
  {
    keywords: ['admin login', 'admin panel', 'admin dashboard', 'admin account', 'admin manager'],
    hi: 'Admin ke liye:\n1. Admin Login page open karein.\n2. Admin credentials se login karein.\n3. Dashboard se Managers, Plans, Payments aur Settings manage kar sakte hain.\nManager account banana ho to Admin > Managers section use karein.',
    en: 'For Admin:\n1. Open the Admin Login page.\n2. Log in with admin credentials.\n3. Use the dashboard to manage Managers, Plans, Payments, and Settings.\nTo create a Manager account, use Admin > Managers.',
    mr: 'Admin sathi:\n1. Admin Login page open kara.\n2. Admin credentials ne login kara.\n3. Dashboard madhun Managers, Plans, Payments ani Settings manage karta yetat.\nManager account banvaycha asel tar Admin > Managers vapra.',
  },
  {
    keywords: ['manager login', 'manager dashboard', 'manager account'],
    hi: 'Manager login ke liye Manager tab/page use karein. Manager dashboard me sellers add kar sakte hain, sales reports dekh sakte hain, records manage kar sakte hain, products dekh sakte hain aur Profile se default scanner/QR upload kar sakte hain.',
    en: 'For Manager login, use the Manager tab/page. The Manager dashboard lets you add sellers, view sales reports, manage records, review products, and upload the default scanner/QR from Profile.',
    mr: 'Manager login sathi Manager tab/page vapra. Manager dashboard madhun sellers add karu shakta, sales reports pahu shakta, records manage karu shakta, products pahu shakta ani Profile madhun default scanner/QR upload karu shakta.',
  },
  {
    keywords: ['invoice', 'bill', 'email', 'mail', 'receipt', 'invoice nahi', 'invoice nhi', 'email nahi', 'mail nahi'],
    hi: 'Invoice nahi aa raha hai to:\n1. Spam/Junk folder check karein.\n2. Registered email sahi hai ya nahi Manager/Admin se confirm karein.\n3. Gmail me All Mail bhi check karein.\n4. Phir bhi na mile to Manager/Admin se invoice resend karne ko bolein.',
    en: 'If the invoice has not arrived:\n1. Check Spam/Junk.\n2. Confirm the registered email with your Manager/Admin.\n3. In Gmail, also check All Mail.\n4. If it is still missing, ask Manager/Admin to resend the invoice.',
    mr: 'Invoice milat nasel tar:\n1. Spam/Junk folder check kara.\n2. Registered email barobar aahe ka te Manager/Admin kadun confirm kara.\n3. Gmail madhe All Mail pan check kara.\n4. Tari milala nahi tar Manager/Admin la invoice resend karayla sanga.',
  },
  {
    keywords: ['scanner', 'qr', 'online payment', 'payment proof', 'upi', 'receipt upload', 'scanner nahi', 'qr nahi'],
    hi: 'Online payment ke liye Online method select karein. Scanner modal automatic open hoga. Manager ka scanner use karein ya apna proof capture/upload karein, phir Confirm karke record save karein.',
    en: 'For online payment, select Online as the payment method. The scanner modal opens automatically. Use the Manager scanner or capture/upload your own proof, then confirm and save the record.',
    mr: 'Online payment sathi Online method select kara. Scanner modal automatic open hoil. Manager scanner vapra kiwa swatahcha proof capture/upload kara, mag Confirm karun record save kara.',
  },
  {
    keywords: ['gps', 'location', 'map', 'location nahi', 'gps nahi', 'permission'],
    hi: 'GPS issue ke liye browser me Location permission Allow karein. Chrome me lock icon > Location > Allow. HTTPS par app open karein, page reload karein, phir record save karein.',
    en: 'For GPS issues, allow Location permission in the browser. In Chrome, use lock icon > Location > Allow. Open the app on HTTPS, reload the page, then save the record.',
    mr: 'GPS issue sathi browser madhe Location permission Allow kara. Chrome madhe lock icon > Location > Allow. App HTTPS var open kara, page reload kara, ani record save kara.',
  },
  {
    keywords: ['camera', 'photo', 'image', 'upload', 'camera nahi', 'photo nahi', 'gallery'],
    hi: 'Camera issue ke liye browser me Camera permission Allow karein. Mobile settings me bhi browser camera permission on karein. HTTPS required hai. Camera na chale to gallery upload use karein.',
    en: 'For camera issues, allow Camera permission in the browser and in mobile app settings. HTTPS is required. If the camera still fails, use gallery upload.',
    mr: 'Camera issue sathi browser ani mobile settings madhe Camera permission Allow kara. HTTPS required aahe. Camera chalat nasel tar gallery upload vapra.',
  },
  {
    keywords: ['register', 'registration', 'new account', 'create account', 'account banao', 'signup', 'sign up', 'account kaise banaye'],
    hi: 'KRAVI me self-registration disabled hai. Seller account Manager banata hai, aur Manager account Admin banata hai. Naya account chahiye to apne Manager/Admin se contact karein.',
    en: 'Self-registration is disabled in KRAVI. Managers create Seller accounts, and Admins create Manager accounts. Contact your Manager/Admin for a new account.',
    mr: 'KRAVI madhe self-registration disabled aahe. Seller account Manager banavto, ani Manager account Admin banavto. Nave account sathi Manager/Admin shi contact kara.',
  },
  {
    keywords: ['baki', 'bakaya', 'pending', 'outstanding', 'due', 'pending amount', 'paid amount', 'payment pending'],
    hi: 'Baki/Pending amount dekhne ke liye Sales History me Pending records check karein. Har record me Pending Amount hota hai. Manager dashboard par overall pending summary bhi dikhti hai.',
    en: 'To check pending/outstanding amount, open Sales History and check Pending records. Each record shows Pending Amount. The Manager dashboard also shows an overall pending summary.',
    mr: 'Baki/Pending amount pahanyasathi Sales History madhil Pending records check kara. Pratyek record madhe Pending Amount disto. Manager dashboard var overall pending summary pan aste.',
  },
  {
    keywords: ['subscription', 'plan', 'gst', 'renewal', 'expiry', 'premium', 'free plan', '3 month', '1 year'],
    hi: 'KRAVI plans: Free, 3 Month, aur 1 Year. GST 18% extra hota hai. Subscription Manager account ke liye hota hai. Payment ke baad invoice, plan details, expiry, guide aur terms email me milte hain.',
    en: 'KRAVI plans are Free, 3 Month, and 1 Year. GST is 18% extra. Subscription applies to Manager accounts. After payment, invoice, plan details, expiry, guide, and terms are sent by email.',
    mr: 'KRAVI plans: Free, 3 Month, ani 1 Year. GST 18% extra aahe. Subscription Manager account sathi aste. Payment nantar invoice, plan details, expiry, guide ani terms email ne yetat.',
  },
  {
    keywords: ['sales record', 'sale record', 'record add', 'add record', 'save record', 'record save', 'start selling', 'shop visit', 'visit save', 'product add'],
    hi: 'Sales record add karne ke liye:\n1. Start Selling par click karein.\n2. Shop details fill karein.\n3. Products add karein aur total check karein.\n4. Payment method select karein.\n5. Online ho to proof upload/capture karein.\n6. Review & Save par record save karein. GPS auto-capture hota hai.',
    en: 'To add a sales record:\n1. Click Start Selling.\n2. Fill shop details.\n3. Add products and check totals.\n4. Select payment method.\n5. For Online payment, upload/capture proof.\n6. Save from Review & Save. GPS is captured automatically.',
    mr: 'Sales record add karanyasathi:\n1. Start Selling var click kara.\n2. Shop details bhara.\n3. Products add kara ani total check kara.\n4. Payment method select kara.\n5. Online asel tar proof upload/capture kara.\n6. Review & Save madhun record save kara. GPS automatic capture hoto.',
  },
  {
    keywords: ['cash payment', 'cash', 'online', 'payment method', 'payment type', 'collection', 'collect payment'],
    hi: 'Payment me Cash ya Online select kar sakte hain. Cash me direct amount enter karke save karein. Online me scanner/proof required hota hai. Paid amount kam ho to baki/pending amount record me show hoga.',
    en: 'You can select Cash or Online payment. For Cash, enter the amount and save. For Online, scanner/proof is required. If the paid amount is lower, the pending amount is shown in the record.',
    mr: 'Payment madhye Cash kiwa Online select karu shakta. Cash sathi amount taka ani save kara. Online sathi scanner/proof required aahe. Paid amount kami asel tar pending amount record madhye disel.',
  },
  {
    keywords: ['report', 'reports', 'sales report', 'seller report', 'manager report', 'download report', 'export report'],
    hi: 'Reports dekhne ke liye Reports page open karein. Seller apne records/reports dekh sakta hai. Manager sellers ke records, collections aur overall reports dekh sakta hai. Date filter use karke required period ka data check karein.',
    en: 'To view reports, open the Reports page. Sellers can view their own records/reports. Managers can view seller records, collections, and overall reports. Use date filters for the required period.',
    mr: 'Reports pahanyasathi Reports page open kara. Seller swatahche records/reports pahu shakto. Manager seller records, collections ani overall reports pahu shakto. Required period sathi date filter vapra.',
  },
  {
    keywords: ['seller add', 'add seller', 'new seller', 'seller create', 'seller manage'],
    hi: 'Seller add karne ke liye Manager Dashboard > Sellers section > Add Seller par click karein. Name, Email, Mobile aur password fill karke Save karein. Login details seller ko share karein.',
    en: 'To add a seller, go to Manager Dashboard > Sellers > Add Seller. Fill name, email, mobile, and password, then save. Share the login details with the seller.',
    mr: 'Seller add karanyasathi Manager Dashboard > Sellers > Add Seller var click kara. Name, Email, Mobile ani password bhara, Save kara. Login details seller sobat share kara.',
  },
  {
    keywords: ['manager add', 'add manager', 'new manager', 'manager create', 'manager manage'],
    hi: 'Manager account Admin banata hai. Admin Login karein, Managers section open karein, Add Manager par details fill karke save karein. Manager ke login credentials phir manager ko share karein.',
    en: 'Manager accounts are created by Admin. Log in as Admin, open Managers, click Add Manager, fill details, and save. Then share the login credentials with the manager.',
    mr: 'Manager account Admin banavto. Admin login kara, Managers section open kara, Add Manager madhye details bharun save kara. Login credentials manager sobat share kara.',
  },
  {
    keywords: ['profile', 'scanner upload', 'default scanner', 'qr upload', 'receipt proof upload'],
    hi: 'Profile page par Manager apna default scanner/QR upload kar sakta hai. Ye scanner sellers ke Online payment modal me dikhega. Upload ke baad sellers app reload karke scanner use kar sakte hain.',
    en: 'On the Profile page, a Manager can upload the default scanner/QR. This scanner appears in the sellers’ Online payment modal. After upload, sellers can reload the app and use it.',
    mr: 'Profile page var Manager default scanner/QR upload karu shakto. Ha scanner sellers chya Online payment modal madhye disel. Upload nantar sellers app reload karun scanner vapru shaktat.',
  },
  {
    keywords: ['product', 'products', 'item', 'items', 'product overview', 'add product'],
    hi: 'Products sales record ke time add kiye jaate hain. Seller Start Selling flow me products add karta hai. Manager Products Overview me product-wise sales/pending summary dekh sakta hai.',
    en: 'Products are added during the sales record flow. Sellers add products in Start Selling. Managers can use Products Overview to see product-wise sales/pending summary.',
    mr: 'Products sales record flow madhye add hotat. Seller Start Selling madhye products add karto. Manager Products Overview madhye product-wise sales/pending summary pahu shakto.',
  },
  {
    keywords: ['dashboard', 'home page', 'main page', 'summary', 'analytics'],
    hi: 'Dashboard par role ke hisaab se summary dikhti hai. Seller ko apne visits/records ka overview milta hai. Manager ko seller activity, collection, pending aur reports summary milti hai. Admin ko managers, plans aur payments ka overview milta hai.',
    en: 'The dashboard shows role-based summaries. Sellers see their visits/records overview. Managers see seller activity, collections, pending amount, and reports summary. Admins see managers, plans, and payments overview.',
    mr: 'Dashboard var role pramane summary diste. Seller la visits/records overview disto. Manager la seller activity, collections, pending ani reports summary diste. Admin la managers, plans ani payments overview disto.',
  },
  {
    keywords: ['slow', 'not loading', 'loading', 'blank', 'app nahi chal', 'app nhi chal', 'error', 'problem', 'issue'],
    hi: 'App slow ya load nahi ho raha hai to:\n1. Internet connection check karein.\n2. Page refresh karein.\n3. Browser cache clear karein.\n4. Chrome me try karein.\n5. Mobile par browser permissions check karein.\nIssue repeat ho to screenshot ke saath Manager/Admin ko bhejein.',
    en: 'If the app is slow or not loading:\n1. Check internet connection.\n2. Refresh the page.\n3. Clear browser cache.\n4. Try Chrome.\n5. Check browser permissions on mobile.\nIf it repeats, send a screenshot to Manager/Admin.',
    mr: 'App slow kiwa load hot nasel tar:\n1. Internet check kara.\n2. Page refresh kara.\n3. Browser cache clear kara.\n4. Chrome madhye try kara.\n5. Mobile browser permissions check kara.\nIssue repeat zala tar screenshot Manager/Admin la pathva.',
  },
];

const APP_RELATED_KEYWORDS = [
  'kravi',
  'app',
  'application',
  'login',
  'seller',
  'manager',
  'admin',
  'dashboard',
  'sales',
  'record',
  'shop',
  'visit',
  'product',
  'payment',
  'cash',
  'online',
  'scanner',
  'qr',
  'gps',
  'location',
  'camera',
  'invoice',
  'bill',
  'email',
  'subscription',
  'plan',
  'gst',
  'report',
  'collection',
  'pending',
  'baki',
  'bakaya',
  'profile',
  'password',
  'otp',
  'registration',
  'account',
  'start selling',
  'my records',
  'forgot',
  'permission',
];

const SYSTEM_PROMPT = `You are KRAVI Bot, the official support assistant for KRAVI Sales App.

LANGUAGE RULES:
- Detect the language of the user's message automatically.
- If user writes in Hindi or Hinglish, reply only in Hindi/Hinglish.
- If user writes in English, reply only in English.
- If user writes in Marathi, reply only in Marathi.
- Never mix languages unless the user does so first.
- Default language if unclear: Hindi.

SCOPE:
- Only answer questions related to KRAVI Sales App.
- If question is unrelated, say in the detected language:
  HI: "Contact ke liye contact@kraviinfotech.com par mail karein ya 7657013534 par message bhejein."
  EN: "For help, email contact@kraviinfotech.com or message 7657013534."
  MR: "Contact sathi contact@kraviinfotech.com var mail kara kiwa 7657013534 var message pathva."

APP CONTEXT:
- KRAVI is a Field Sales Tracking app for Indian field teams.
- Roles: Admin > Manager > Seller.
- Seller records shop visits, adds products, and collects payments with GPS proof.
- Manager manages sellers, views reports, and uploads payment QR/scanner proof.
- Admin manages managers and handles subscriptions.

KEY FEATURES:
- Sales Record: shop visit, products, GPS location, and payment proof image.
- Payment types: Cash or Online. Online requires QR/scanner proof image.
- Baki/Bakaya means outstanding or pending payment amount.
- Scanner Modal opens automatically when Online payment is selected.
- GPS is auto-captured when a record is saved.
- App UI supports English, Hindi, and Marathi.

SUBSCRIPTION:
- Plans: Free, 3 Month, 1 Year. GST is 18% extra.
- After payment, email contains invoice with GST, expiry, acceptance letter, app guide, and terms.

REGISTRATION:
- Self-registration is disabled.
- Admin creates Manager accounts.
- Manager creates Seller accounts.

TECH:
- Camera and GPS require HTTPS and browser permissions.
- OTP is used for password reset.

DETAILED KNOWLEDGE BASE:

LOGIN AND ACCOUNT
- Login not working: Check Email/Mobile and password. Sellers must use the Seller login tab, not Manager tab. Forgot password -> use "Forgot Password" to get OTP. No account -> ask Manager because self-registration is disabled.
- Reset password: Click "Forgot Password" on login page -> enter registered Email/Mobile -> receive OTP -> enter OTP -> set new password. If OTP expires, request a new one.
- Create new account: Seller accounts are created by Manager. Manager accounts are created by Admin. Self-registration is disabled, so ask your superior.

PAYMENT AND SCANNER
- Online payment: Select "Online" in payment method -> scanner modal opens automatically -> choose "Use Manager's Receipt" or "Capture Your Own Proof" -> select image -> Confirm -> Save record. If modal does not open, verify "Online" is selected, not "Cash".
- Manager scanner not visible: Manager may not have uploaded one yet. Manager should go to Profile > Default Scanner Proof > Upload Scanner. If unavailable, seller can use "Capture Your Own Proof".

GPS AND LOCATION
- GPS not working: Grant Location permission to browser. Chrome: Address bar > Lock icon > Location > Allow. Mobile: Settings > Apps > Browser > Permissions > Location > On. HTTPS is required; GPS does not work on HTTP. Reload after granting permission. GPS auto-captures when record is saved.

SALES RECORD
- Add sales record: Click "Start Selling" -> fill shop details -> add products -> verify totals on "Review & Save" -> choose payment method -> if Online, get proof through scanner modal -> click "Save Record". GPS is auto-saved.
- Check pending/baki amount: Check Pending status records in Sales History. Each record has a Pending Amount field. Manager dashboard shows overall pending summary. To clear pending, update paid amount in a new record.

CAMERA AND IMAGE
- Camera not working: Grant Camera permission. Chrome: Address bar > Lock icon > Camera > Allow. iOS Safari: Settings > Safari > Camera > Allow. HTTPS is required. Reload after granting permission. Gallery upload can be used instead of camera.

SUBSCRIPTION AND PLANS
- Plans: Free for basic features, 3 Month for premium features for 3 months, 1 Year for premium features for 1 year. GST 18% is added on top of plan price. Subscription modal appears automatically for Managers after login. Subscription is only for Manager accounts.
- Email after subscription: Invoice with GST breakdown, payment proof/receipt, plan details and expiry date, acceptance letter, app usage guide, and terms. If not received, check Spam/Junk folder.

EMAIL AND REGISTRATION
- No email after registration: Check Spam/Junk first. Confirm email address is correct with Manager. Gmail users should also check All Mail. If still not received, ask Manager/Admin to resend.

MANAGER FEATURES
- Add new seller: Manager Dashboard > Sellers section > Add Seller button > fill name, email, mobile, password > Save > share login credentials with Seller. Sellers cannot self-register.
- Upload scanner/QR: Manager Profile page > Default Scanner Proof > Upload Scanner > select receipt/QR image. This image appears in scanner modal for all sellers.

TECHNICAL ISSUES
- App slow/not loading: Check internet connection. Clear browser cache. Try Chrome. Restart device. If still an issue, report to Manager/Admin with a screenshot.

Always be concise, friendly, and solution-focused. Use numbered steps for instructions. Keep replies short enough for a mobile chat window.`;

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  const sanitizedMessages = [];

  for (const message of messages) {
    if (!message || !VALID_ROLES.has(message.role)) {
      continue;
    }

    const content = String(message.content || '').trim().slice(0, 2000);
    if (!content) {
      continue;
    }

    sanitizedMessages.push({
      role: message.role,
      content,
    });
  }

  return sanitizedMessages.slice(-20);
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLanguage(text) {
  const normalizedText = normalizeText(text);
  const hasDevanagari = /[\u0900-\u097f]/.test(text);
  const marathiWords = new Set([
    'aahe',
    'ahe',
    'kuthe',
    'kasa',
    'kashi',
    'tumhala',
    'mala',
    'madhe',
    'majha',
    'majhi',
    'pahu',
    'sanga',
    'deto',
    'dete',
    'milel',
    'milte',
    'vichara',
    'vicharle',
    'tyach',
    'zala',
    'zali',
    'hot',
    'hote',
    'karaycha',
    'karaychi',
  ]);
  const hindiWords = new Set([
    'kaise',
    'kese',
    'kare',
    'karu',
    'karna',
    'kya',
    'kyu',
    'kyun',
    'nhi',
    'nahi',
    'hai',
    'hain',
    'hu',
    'hoon',
    'h',
    'mera',
    'meri',
    'mujhe',
    'mujko',
    'batao',
    'btao',
    'dikha',
    'puchh',
    'puch',
    'rha',
    'rhi',
    'raha',
    'rahi',
    'jwab',
    'jawab',
  ]);
  const englishWords = new Set([
    'how',
    'what',
    'why',
    'where',
    'when',
    'which',
    'can',
    'could',
    'please',
    'show',
    'tell',
    'help',
    'issue',
    'problem',
    'not',
    'working',
    'open',
    'create',
    'add',
    'view',
    'check',
    'download',
    'upload',
    'save',
    'reset',
  ]);

  if (hasDevanagari && /\u0906\u0939\u0947|\u0928\u093e\u0939\u0940|\u0915\u0938\u0947|\u0915\u0936\u0940|\u0915\u0941\u0920\u0947|\u0933/.test(text)) {
    return 'mr';
  }

  const words = normalizedText.split(' ').filter(Boolean);
  const hasWord = (set) => words.some((word) => set.has(word));

  if (hasWord(marathiWords)) {
    return 'mr';
  }

  if (hasWord(hindiWords) || hasDevanagari) {
    return 'hi';
  }

  if (hasWord(englishWords)) {
    return 'en';
  }

  return 'hi';
}

function sanitizeLanguage(language) {
  return SUPPORTED_LANGUAGES.has(language) ? language : null;
}

function buildSystemPrompt(language) {
  const selectedLanguage = sanitizeLanguage(language);

  if (!selectedLanguage) {
    return SYSTEM_PROMPT;
  }

  return `${SYSTEM_PROMPT}

SELECTED UI LANGUAGE:
- The user selected ${LANGUAGE_NAMES[selectedLanguage]} in the chatbot dropdown.
- Reply only in ${LANGUAGE_NAMES[selectedLanguage]} unless the user explicitly asks for another language.`;
}

function isAppRelated(normalizedText) {
  return APP_RELATED_KEYWORDS.some((keyword) => normalizedText.includes(keyword));
}

function getGeneralAppReply(language) {
  if (language === 'mr') {
    return 'KRAVI Sales App madhe mi ya goshtinmadhe madad karu shakto:\n1. Seller/Manager/Admin login\n2. Sales record ani shop visit save karne\n3. Cash/Online payment, scanner/QR, payment proof\n4. GPS, camera ani permission issue\n5. Reports, pending/baki amount ani collections\n6. Invoice, subscription, plans ani GST\nTumcha exact issue sanga, mi step-by-step madad karto.';
  }

  if (language === 'en') {
    return 'I can help with KRAVI Sales App topics like:\n1. Seller/Manager/Admin login\n2. Sales records and shop visits\n3. Cash/Online payments, scanner/QR, and proof upload\n4. GPS, camera, and permission issues\n5. Reports, pending amount, and collections\n6. Invoice, subscription, plans, and GST\nTell me the exact issue and I will guide you step by step.';
  }

  return 'KRAVI Sales App me main in topics par help kar sakta hoon:\n1. Seller/Manager/Admin login\n2. Sales record aur shop visit save karna\n3. Cash/Online payment, scanner/QR, payment proof\n4. GPS, camera aur permission issue\n5. Reports, pending/baki amount aur collections\n6. Invoice, subscription, plans aur GST\nAap exact issue batayein, main step-by-step guide karunga.';
}

function getUnsupportedReply(language) {
  if (language === 'mr') {
    return `Help sathi contact@kraviinfotech.com var mail kara kiwa 7657013534 var message pathva.`;
  }

  if (language === 'en') {
    return `For help, email contact@kraviinfotech.com or message 7657013534.`;
  }

  return `Help ke liye contact@kraviinfotech.com par mail karein ya 7657013534 par message bhejein.`;
}

function findLocalReply(messages, languageOverride = null) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const userText = latestUserMessage?.content || '';
  const normalizedText = normalizeText(userText);
  const language = sanitizeLanguage(languageOverride) || detectLanguage(userText);
  const matchedReply = LOCAL_REPLIES.find((reply) =>
    reply.keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)))
  );

  if (matchedReply) {
    return {
      isKnownAppQuestion: true,
      reply: matchedReply[language] || matchedReply.hi,
    };
  }

  if (isAppRelated(normalizedText)) {
    return {
      isKnownAppQuestion: true,
      reply: getGeneralAppReply(language),
    };
  }

  return {
    isKnownAppQuestion: false,
    reply: getUnsupportedReply(language),
  };
}

router.post('/', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const messages = sanitizeMessages(req.body.messages);
  const selectedLanguage = sanitizeLanguage(req.body.language);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ message: 'A user message is required.' });
  }

  const localAnswer = findLocalReply(messages, selectedLanguage);
  if (localAnswer.isKnownAppQuestion || !apiKey) {
    return res.json({ reply: localAnswer.reply });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: Number(process.env.KRAVI_CHAT_MAX_TOKENS) || 600,
        system: buildSystemPrompt(selectedLanguage),
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('KRAVI chat Anthropic error:', data);
      return res.json({ reply: localAnswer.reply });
    }

    const reply = data.content?.find((block) => block.type === 'text')?.text;
    if (!reply) {
      return res.json({ reply: localAnswer.reply });
    }

    return res.json({ reply });
  } catch (err) {
    console.error('KRAVI chat route error:', err);
    return res.json({ reply: localAnswer.reply });
  }
});

module.exports = router;
