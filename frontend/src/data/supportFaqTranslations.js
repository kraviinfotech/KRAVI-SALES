export const LANGUAGE_OPTIONS = [
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'mr', label: 'Marathi' },
];

export const CHATBOT_COPY = {
  hi: {
    welcome: [
      'Namaste. KRAVI Support me aapka swagat hai.',
      'Batayein, main aapki kaise help kar sakta hoon?',
    ],
    placeholder: 'Apna question type karein...',
    supportStatus: '24/7 Support Chatbot',
    chooseQuestion: 'Apna question choose karein.',
    other: 'Other',
    otherSupportTopics: 'Dusre support topics',
    error:
      'Kuch gadbad ho gayi. Extra help ke liye contact@kraviinfotech.com par mail karein ya 7657013534 par contact karein.',
  },
  en: {
    welcome: [
      'Hello. Welcome to KRAVI Support.',
      'Please let me know how I can help you.',
    ],
    placeholder: 'Type your question...',
    supportStatus: '24/7 Support Chatbot',
    chooseQuestion: 'Please choose your question.',
    other: 'Other',
    otherSupportTopics: 'Other support topics',
    error:
      'Something went wrong. For extra help, email contact@kraviinfotech.com or contact 7657013534.',
  },
  mr: {
    welcome: [
      'Namaskar. KRAVI Support madhye tumcha swagat aahe.',
      'Sanga, mi tumchi kashi madad karu shakto?',
    ],
    placeholder: 'Tumcha prashna type kara...',
    supportStatus: '24/7 Support Chatbot',
    chooseQuestion: 'Tumcha prashna choose kara.',
    other: 'Other',
    otherSupportTopics: 'Itar support topics',
    error:
      'Kahi tari problem zala. Extra madat sathi contact@kraviinfotech.com var mail kara kiwa 7657013534 var contact kara.',
  },
};

export const TOPIC_LABELS = {
  'account-login': {
    hi: 'Account aur Login',
    en: 'Account & Login',
    mr: 'Account ani Login',
  },
  'payments-transfers': {
    hi: 'Payments aur Transfers',
    en: 'Payments & Transfers',
    mr: 'Payments ani Transfers',
  },
  'wallet-balance': {
    hi: 'Wallet aur Balance',
    en: 'Wallet & Balance',
    mr: 'Wallet ani Balance',
  },
  'offers-cashback': {
    hi: 'Offers aur Cashback',
    en: 'Offers & Cashback',
    mr: 'Offers ani Cashback',
  },
  'bills-recharge': {
    hi: 'Bills aur Recharge',
    en: 'Bills & Recharge',
    mr: 'Bills ani Recharge',
  },
  'security-fraud': {
    hi: 'Security aur Fraud',
    en: 'Security & Fraud',
    mr: 'Security ani Fraud',
  },
  'app-issues': {
    hi: 'App Issues',
    en: 'App Issues',
    mr: 'App Issues',
  },
  'support-feedback': {
    hi: 'Support aur Feedback',
    en: 'Support & Feedback',
    mr: 'Support ani Feedback',
  },
  'refunds-disputes': {
    hi: 'Refunds aur Disputes',
    en: 'Refunds & Disputes',
    mr: 'Refunds ani Disputes',
  },
  'kyc-verification': {
    hi: 'KYC aur Verification',
    en: 'KYC & Verification',
    mr: 'KYC ani Verification',
  },
  'limits-policies': {
    hi: 'Transaction Limits aur Policies',
    en: 'Transaction Limits & Policies',
    mr: 'Transaction Limits ani Policies',
  },
  'bank-upi-setup': {
    hi: 'Bank aur UPI Setup',
    en: 'Bank & UPI Setup',
    mr: 'Bank ani UPI Setup',
  },
  'merchant-biller': {
    hi: 'Merchant aur Biller Support',
    en: 'Merchant & Biller Support',
    mr: 'Merchant ani Biller Support',
  },
  'notifications-alerts': {
    hi: 'Notifications aur Alerts',
    en: 'Notifications & Alerts',
    mr: 'Notifications ani Alerts',
  },
  'profile-settings': {
    hi: 'Profile aur Settings',
    en: 'Profile & Settings',
    mr: 'Profile ani Settings',
  },
  'technical-troubleshooting': {
    hi: 'Technical Troubleshooting',
    en: 'Technical Troubleshooting',
    mr: 'Technical Troubleshooting',
  },
  'account-recovery': {
    hi: 'Account Recovery',
    en: 'Account Recovery',
    mr: 'Account Recovery',
  },
};

export const FAQ_TRANSLATIONS = {
  'How do I log in to my account?': {
    hi: { question: 'Apne account me login kaise karu?' },
    en: {
      answer:
        'Open the app, select your role, enter your registered mobile/email and password, then tap Login. Sellers should use the Seller login tab and Managers should use the Manager login tab.',
    },
    mr: {
      question: 'Majhya account madhye login kasa karu?',
      answer:
        'App open kara, tumcha role select kara, registered mobile/email ani password taka, mag Login var tap kara. Seller asel tar Seller login tab vapra, Manager asel tar Manager login tab vapra.',
    },
  },
  'I forgot my password. How can I reset it?': {
    hi: { question: 'Password bhool gaya hoon, reset kaise karu?' },
    en: {
      answer:
        'Tap Forgot Password on the login screen, enter your registered email/mobile, verify the OTP, and set a new password. If the OTP expires, use Resend OTP.',
    },
    mr: {
      question: 'Password visarlo, reset kasa karu?',
      answer:
        'Login screen var Forgot Password tap kara, registered email/mobile taka, OTP verify kara, ani navin password set kara. OTP expire zala tar Resend OTP vapra.',
    },
  },
  'Why am I not able to log in?': {
    hi: { question: 'Login kyu nahi ho raha hai?' },
    en: {
      answer:
        'First check your internet, selected role tab, mobile/email, and password. If the account is locked, inactive, or the password is wrong, try Forgot Password. If the issue repeats, ask your Manager/Admin to verify account status.',
    },
    mr: {
      question: 'Login ka hot nahi aahe?',
      answer:
        'Pahile internet, role tab, mobile/email ani password check kara. Account locked, inactive kiwa password chukicha asel tar Forgot Password try kara. Issue repeat zala tar Manager/Admin kadun account status verify karun ghya.',
    },
  },
  'How do I change my registered phone number or email?': {
    hi: { question: 'Registered phone number ya email kaise change karu?' },
    en: {
      answer:
        'Check the Profile/Settings area for the registered phone or email update option. If it is not available, send a request to your Manager/Admin. OTP verification may be required for security.',
    },
    mr: {
      question: 'Registered phone number kiwa email kasa change karu?',
      answer:
        'Profile/Settings madhye registered phone kiwa email update option check kara. Option available nasel tar Manager/Admin la request pathva. Security sathi OTP verification required asu shakto.',
    },
  },
  'How do I send money?': {
    hi: { question: 'Money send kaise karu?' },
    en: {
      answer:
        'Open Payments/Transfer, select the receiver bank/UPI/mobile details, enter the amount, verify the details, and confirm with PIN/OTP. For sales payments, select Cash or Online and save the record.',
    },
    mr: {
      question: 'Paise kase send karu?',
      answer:
        'Payments/Transfer section open kara, receiver che bank/UPI/mobile details select kara, amount taka, details verify kara, ani PIN/OTP ne confirm kara. Sales payment sathi Cash kiwa Online method select karun record save kara.',
    },
  },
  'Why did my payment fail?': {
    hi: { question: 'Payment fail kyu hua?' },
    en: {
      answer:
        'Common reasons are low balance, wrong PIN, bank server issue, weak internet, daily limit crossed, or an old app version. If the status is Pending/Failed, keep the receipt safe and retry after some time.',
    },
    mr: {
      question: 'Payment fail ka zala?',
      answer:
        'Common reasons: low balance, wrong PIN, bank server issue, weak internet, daily limit cross hone, kiwa app old version. Status Pending/Failed disat asel tar receipt safe theva ani thodya velane retry kara.',
    },
  },
  'How can I check the status of my transaction?': {
    hi: { question: 'Transaction status kaise check karu?' },
    en: {
      answer:
        'Open Transaction History/Payment History, select the transaction, and check the status. You will see Success, Pending, or Failed along with the transaction ID/UTR.',
    },
    mr: {
      question: 'Transaction status kasa check karu?',
      answer:
        'Transaction History/Payment History open kara, transaction select kara, ani status paha. Success, Pending kiwa Failed status sobat transaction ID/UTR pan disel.',
    },
  },
  'Can I cancel a payment?': {
    hi: { question: 'Payment cancel kar sakta hoon?' },
    en: {
      answer:
        'A successful payment usually cannot be cancelled. If the payment is pending, wait for the final status. If money went to the wrong receiver, request a refund from the receiver or raise a support ticket.',
    },
    mr: {
      question: 'Payment cancel karu shakto ka?',
      answer:
        'Successful payment usually cancel hot nahi. Payment pending asel tar final status cha wait kara. Chukichya receiver la payment zala asel tar receiver kadun refund request kara kiwa support ticket raise kara.',
    },
  },
  'How do I add a new bank account or UPI ID?': {
    hi: { question: 'Naya bank account ya UPI ID kaise add karu?' },
    en: {
      answer:
        'Go to Payment Methods/Bank & UPI, tap Add Bank Account or Add UPI ID, select the bank, complete mobile/SMS verification, and set or verify the UPI PIN.',
    },
    mr: {
      question: 'Nave bank account kiwa UPI ID kase add karu?',
      answer:
        'Payment Methods/Bank & UPI madhye Add Bank Account kiwa Add UPI ID tap kara, bank select kara, mobile/SMS verification complete kara, ani UPI PIN set/verify kara.',
    },
  },
  'How do I check my wallet balance?': {
    hi: { question: 'Wallet balance kaise check karu?' },
    en: {
      answer:
        'Open the Wallet section. The available balance appears at the top. If the balance is hidden or stale, refresh the page or restart the app and check again.',
    },
    mr: {
      question: 'Wallet balance kasa check karu?',
      answer:
        'Wallet section open kara. Available balance top var disel. Balance hide kiwa update nasel tar refresh kara kiwa app restart karun punha check kara.',
    },
  },
  'Why is my wallet balance not updating?': {
    hi: { question: 'Wallet balance update kyu nahi ho raha?' },
    en: {
      answer:
        'Balance updates can take some time because of bank/app sync. Refresh the app, check internet, and verify transaction status. If the amount was debited but balance did not update, raise a support ticket with the transaction ID.',
    },
    mr: {
      question: 'Wallet balance update ka hot nahi?',
      answer:
        'Bank/app sync mule balance update la thoda vel lagu shakto. App refresh kara, internet check kara, transaction status verify kara. Amount debit zala pan balance update nahi zala tar transaction ID sobat support ticket raise kara.',
    },
  },
  'How can I add money to my wallet?': {
    hi: { question: 'Wallet me money kaise add karu?' },
    en: {
      answer:
        'Open Wallet > Add Money, enter the amount, select a payment method, and confirm with PIN/OTP. After successful payment, the amount will reflect in the wallet.',
    },
    mr: {
      question: 'Wallet madhye paise kase add karu?',
      answer:
        'Wallet > Add Money open kara, amount taka, payment method select kara, ani PIN/OTP ne confirm kara. Payment success nantar amount wallet madhye reflect hoil.',
    },
  },
  'Can I withdraw money from my wallet to my bank?': {
    hi: { question: 'Wallet se bank me money withdraw kar sakta hoon?' },
    en: {
      answer:
        'If Wallet > Withdraw/Transfer to Bank is available, select the bank account, enter the amount, and confirm. Withdrawal limits, fees, and settlement time appear on the confirmation screen.',
    },
    mr: {
      question: 'Wallet madhun bank madhye paise withdraw karu shakto ka?',
      answer:
        'Wallet > Withdraw/Transfer to Bank option available asel tar bank account select kara, amount taka, ani confirm kara. Withdrawal limit, fees ani settlement time confirmation screen var disel.',
    },
  },
  'What offers are available right now?': {
    hi: { question: 'Abhi kaunse offers available hain?' },
    en: {
      answer:
        'Open the Offers/Cashback section. You will see active offers, coupon codes, minimum amount, eligible payment methods, and expiry dates there.',
    },
    mr: {
      question: 'Ata konte offers available aahet?',
      answer:
        'Offers/Cashback section open kara. Tithe active offers, coupon code, minimum amount, eligible payment method ani expiry date disel.',
    },
  },
  'How can I check my cashback status?': {
    hi: { question: 'Cashback status kaise check karu?' },
    en: {
      answer:
        'Go to Rewards/Cashback History and check the cashback status. It may appear as Pending, Earned, Credited, or Expired.',
    },
    mr: {
      question: 'Cashback status kasa check karu?',
      answer:
        'Rewards/Cashback History madhye jaun cashback status check kara. Status Pending, Earned, Credited kiwa Expired asa disel.',
    },
  },
  "Why didn't I receive cashback?": {
    hi: { question: 'Mujhe cashback kyu nahi mila?' },
    en: {
      answer:
        'Cashback may not arrive if offer terms were not met, coupon was not applied, minimum amount was too low, payment method was not eligible, or the offer expired. Check the transaction and offer terms again.',
    },
    mr: {
      question: 'Mala cashback ka milala nahi?',
      answer:
        'Cashback na milnyache reasons: offer terms match zale nahi, coupon apply zala nahi, minimum amount kami hota, payment method eligible navhta, kiwa offer expire zala. Transaction ani offer terms punha check kara.',
    },
  },
  'When will my offer or cashback expire?': {
    hi: { question: 'Offer ya cashback kab expire hoga?' },
    en: {
      answer:
        'Every offer details page shows the validity/expiry date. Cashback expiry can be checked in Rewards/Cashback History.',
    },
    mr: {
      question: 'Offer kiwa cashback kadhi expire hoil?',
      answer:
        'Pratyek offer details page var validity/expiry date dileli aste. Cashback expiry Rewards/Cashback History madhye check kara.',
    },
  },
  'How do I pay a bill?': {
    hi: { question: 'Bill payment kaise karu?' },
    en: {
      answer:
        'Open Bills, select the biller category, enter the consumer/customer number, fetch the bill, verify the details, and tap Pay.',
    },
    mr: {
      question: 'Bill payment kasa karu?',
      answer:
        'Bills section open kara, biller category select kara, consumer/customer number taka, bill fetch kara, details verify kara, ani Pay tap kara.',
    },
  },
  'Can I recharge my mobile or DTH?': {
    hi: { question: 'Mobile ya DTH recharge kar sakta hoon?' },
    en: {
      answer:
        'Yes. In the Recharge section, select Mobile or DTH, enter the number/customer ID, choose a plan, and complete the payment.',
    },
    mr: {
      question: 'Mobile kiwa DTH recharge karu shakto ka?',
      answer:
        'Ho. Recharge section madhye Mobile kiwa DTH select kara, number/customer ID taka, plan choose kara, ani payment complete kara.',
    },
  },
  'How do I view my bill payment history?': {
    hi: { question: 'Bill payment history kaise dekhu?' },
    en: {
      answer:
        'Open Bills/Recharge History. You will see paid bills, recharges, status, date, and transaction ID there.',
    },
    mr: {
      question: 'Bill payment history kashi pahu?',
      answer:
        'Bills/Recharge History open kara. Tithe paid bills, recharges, status, date ani transaction ID disel.',
    },
  },
  'What should I do if a bill payment is not reflected?': {
    hi: { question: 'Bill payment reflect nahi ho raha to kya karu?' },
    en: {
      answer:
        'Check the payment receipt and transaction status. Biller updates can take some time. If it still does not reflect after the expected time, raise a complaint with the transaction ID.',
    },
    mr: {
      question: 'Bill payment reflect hot nasel tar kay karu?',
      answer:
        'Payment receipt ani transaction status check kara. Biller update la kabhi-kabhi vel lagto. Expected time nantar pan reflect nahi zala tar transaction ID sobat complaint raise kara.',
    },
  },
  'How can I secure my account?': {
    hi: { question: 'Apna account secure kaise rakhu?' },
    en: {
      answer:
        'Use a strong password/PIN, never share OTP/UPI PIN, enable app lock, avoid unknown links, and change your password immediately if you notice suspicious activity.',
    },
    mr: {
      question: 'Majha account secure kasa thevu?',
      answer:
        'Strong password/PIN vapra, OTP/UPI PIN konashi share karu naka, app lock enable kara, unknown links var tap karu naka, ani suspicious activity disli tar password turant change kara.',
    },
  },
  'What should I do if I suspect fraud?': {
    hi: { question: 'Fraud ka doubt ho to kya karu?' },
    en: {
      answer:
        'Immediately change your account/password/PIN, report it to bank/app support, request account/card blocking, and in India complain on the 1930 cyber helpline for financial fraud.',
    },
    mr: {
      question: 'Fraud cha doubt asel tar kay karu?',
      answer:
        'Turant account/password/PIN change kara, bank/app support la report kara, account/card block request kara, ani India madhye financial fraud sathi 1930 cyber helpline var complaint kara.',
    },
  },
  'How do I update my UPI PIN?': {
    hi: { question: 'UPI PIN update kaise karu?' },
    en: {
      answer:
        'In UPI/Bank Account settings, select the bank, tap Change UPI PIN or Reset UPI PIN, complete debit card/bank verification, and set the new PIN.',
    },
    mr: {
      question: 'UPI PIN update kasa karu?',
      answer:
        'UPI/Bank Account settings madhye bank select kara, Change UPI PIN kiwa Reset UPI PIN tap kara, debit card/bank verification complete kara, ani navin PIN set kara.',
    },
  },
  'How can I block my account or card?': {
    hi: { question: 'Account ya card block kaise karu?' },
    en: {
      answer:
        'Use the Block Account/Card option in Security/Help. If it is not available, contact support or your bank helpline immediately and report suspicious transactions.',
    },
    mr: {
      question: 'Account kiwa card block kasa karu?',
      answer:
        'Security/Help section madhye Block Account/Card option vapra. Option available nasel tar support kiwa bank helpline la turant contact kara ani suspicious transactions report kara.',
    },
  },
  'Why is the app crashing or freezing?': {
    hi: { question: 'App crash ya freeze kyu ho raha hai?' },
    en: {
      answer:
        'Update the app, restart the phone, clear cache, check storage space, and use stable internet. If it repeats, report it to support with screenshot/error details.',
    },
    mr: {
      question: 'App crash kiwa freeze ka hot aahe?',
      answer:
        'App update kara, phone restart kara, cache clear kara, storage space check kara, ani stable internet vapra. Issue repeat zala tar screenshot/error details sobat support la report kara.',
    },
  },
  'Why am I not receiving OTPs?': {
    hi: { question: 'OTP kyu nahi aa raha hai?' },
    en: {
      answer:
        'Check network signal, SMS inbox space, DND/spam blocking, correct mobile number, and active SIM status. Wait 1-2 minutes and try Resend OTP.',
    },
    mr: {
      question: 'OTP ka yet nahi aahe?',
      answer:
        'Network signal, SMS inbox space, DND/spam block, correct mobile number ani SIM active status check kara. 1-2 minute wait karun Resend OTP try kara.',
    },
  },
  'How do I update the app?': {
    hi: { question: 'App update kaise karu?' },
    en: {
      answer:
        'On Android, open Play Store. On iPhone, open App Store. Search for the app and tap Update. Restart the app after updating.',
    },
    mr: {
      question: 'App update kasa karu?',
      answer:
        'Android var Play Store ani iPhone var App Store open kara, app search kara, ani Update tap kara. Update nantar app restart kara.',
    },
  },
  'How do I clear app cache?': {
    hi: { question: 'App cache kaise clear karu?' },
    en: {
      answer:
        'Android: Settings > Apps > App Name > Storage > Clear Cache. If you use the browser version, clear cache in browser settings and reload the app.',
    },
    mr: {
      question: 'App cache kasa clear karu?',
      answer:
        'Android: Settings > Apps > App Name > Storage > Clear Cache. Browser version vaprat asel tar browser settings madhye cache clear kara, mag app reload kara.',
    },
  },
  'How can I contact customer support?': {
    hi: { question: 'Customer support se contact kaise karu?' },
    en: {
      answer:
        'Open Help & Support. You will find chat, complaint, email, or call support options. While explaining the issue, add transaction ID, screenshot, and registered mobile/email.',
    },
    mr: {
      question: 'Customer support la contact kasa karu?',
      answer:
        'Help & Support section open kara. Tithe chat, complaint, email kiwa call support options miltil. Issue explain kartana transaction ID, screenshot ani registered mobile/email add kara.',
    },
  },
  'How do I raise a complaint?': {
    hi: { question: 'Complaint kaise raise karu?' },
    en: {
      answer:
        'Open Help & Support > Raise Complaint, select the issue category, write details, attach screenshot/receipt, and submit.',
    },
    mr: {
      question: 'Complaint kashi raise karu?',
      answer:
        'Help & Support > Raise Complaint open kara, issue category select kara, details liha, screenshot/receipt attach kara, ani Submit kara.',
    },
  },
  'How can I check the status of my complaint?': {
    hi: { question: 'Complaint status kaise check karu?' },
    en: {
      answer:
        'Open Help & Support > My Complaints/Tickets. Select the ticket ID to check status, latest update, and expected resolution time.',
    },
    mr: {
      question: 'Complaint status kasa check karu?',
      answer:
        'Help & Support > My Complaints/Tickets open kara. Ticket ID select karun status, latest update ani expected resolution time check kara.',
    },
  },
  'How do I provide feedback about the service?': {
    hi: { question: 'Service feedback kaise du?' },
    en: {
      answer:
        'Open Feedback in Settings/Help, choose a rating, write your suggestion, and submit. You can also share feedback in support chat.',
    },
    mr: {
      question: 'Service feedback kasa deu?',
      answer:
        'Settings/Help madhye Feedback option open kara, rating choose kara, suggestion liha, ani Submit kara. Support chat madhye pan feedback share karu shakta.',
    },
  },
  'How do I request a refund?': {
    hi: { question: 'Refund request kaise karu?' },
    en: {
      answer:
        'Open the failed/incorrect transaction in Transaction History, select Report Issue or Request Refund, choose a reason, attach receipt/screenshot, and submit.',
    },
    mr: {
      question: 'Refund request kashi karu?',
      answer:
        'Transaction History madhye failed/incorrect transaction open kara, Report Issue kiwa Request Refund select kara, reason choose kara, receipt/screenshot attach karun submit kara.',
    },
  },
  'Why is my refund pending?': {
    hi: { question: 'Refund pending kyu hai?' },
    en: {
      answer:
        'The refund may be pending with the bank, biller, or payment gateway approval. Check the expected timeline on the status page. If the timeline is crossed, raise a support ticket with the transaction ID.',
    },
    mr: {
      question: 'Refund pending ka aahe?',
      answer:
        'Refund bank, biller kiwa payment gateway approval madhye pending asu shakto. Status page var expected timeline check kara. Timeline cross zali tar transaction ID sobat support ticket raise kara.',
    },
  },
  'How long will it take to get my refund?': {
    hi: { question: 'Refund milne me kitna time lagega?' },
    en: {
      answer:
        'Failed payment refunds usually reach the source account in 3-7 working days. The exact timeline depends on the bank, biller, and payment method.',
    },
    mr: {
      question: 'Refund milnyasathi kiti time lagel?',
      answer:
        'Failed payments cha refund usually 3-7 working days madhye source account madhye yeto. Exact timeline bank, biller ani payment method var depend karte.',
    },
  },
  'What should I do if I received a duplicate charge?': {
    hi: { question: 'Duplicate charge aa gaya to kya karu?' },
    en: {
      answer:
        'Note both debit transaction IDs, attach bank statement/receipt screenshots, and raise a Duplicate Charge complaint. After verification, the extra debit is processed for refund.',
    },
    mr: {
      question: 'Duplicate charge zala tar kay karu?',
      answer:
        'Donhi debit entries che transaction IDs note kara, bank statement/receipt screenshot attach kara, ani Duplicate Charge complaint raise kara. Extra debit verify zalyanantar refund process hoto.',
    },
  },
  'How do I complete my KYC verification?': {
    hi: { question: 'KYC verification complete kaise karu?' },
    en: {
      answer:
        'Open Profile > KYC/Verification, fill the required details, upload documents, complete selfie/live verification, and submit.',
    },
    mr: {
      question: 'KYC verification complete kasa karu?',
      answer:
        'Profile > KYC/Verification open kara, required details bhara, document upload kara, selfie/live verification complete kara, ani Submit kara.',
    },
  },
  'What documents do I need to upload?': {
    hi: { question: 'Kaunse documents upload karne honge?' },
    en: {
      answer:
        'Usually valid government documents like PAN, Aadhaar, voter ID, passport, or driving licence are required. Upload the documents listed inside the app.',
    },
    mr: {
      question: 'Konte documents upload karayche?',
      answer:
        'Usually PAN, Aadhaar, voter ID, passport kiwa driving licence sarkhe valid government documents required astat. App madhye ji document list disel, tech upload kara.',
    },
  },
  'Why was my KYC rejected?': {
    hi: { question: 'Mera KYC reject kyu hua?' },
    en: {
      answer:
        'KYC can be rejected because of blurry document, name/date mismatch, expired document, cropped image, wrong document type, or failed selfie verification.',
    },
    mr: {
      question: 'Majha KYC reject ka zala?',
      answer:
        'KYC blurry document, name/date mismatch, expired document, cropped image, wrong document type kiwa failed selfie verification mule reject hou shakto.',
    },
  },
  'How can I update my KYC details?': {
    hi: { question: 'KYC details kaise update karu?' },
    en: {
      answer:
        'Check the update option in Profile > KYC Details. If editing is locked, raise a support ticket and submit the correct document/details.',
    },
    mr: {
      question: 'KYC details kase update karu?',
      answer:
        'Profile > KYC Details madhye update option check kara. Edit locked asel tar support ticket raise kara ani correct document/details submit kara.',
    },
  },
  'What is my daily transaction limit?': {
    hi: { question: 'Meri daily transaction limit kya hai?' },
    en: {
      answer:
        'Check your daily limit in the Limits section or Payment Settings. The limit can vary by account type, KYC status, bank rules, and payment method.',
    },
    mr: {
      question: 'Mazi daily transaction limit kay aahe?',
      answer:
        'Limits section kiwa Payment Settings madhye daily limit check kara. Limit account type, KYC status, bank rules ani payment method nusar alag asu shakto.',
    },
  },
  'How can I increase my limit?': {
    hi: { question: 'Limit increase kaise karu?' },
    en: {
      answer:
        'Complete full KYC, keep account verification updated, and submit an Increase Limit request in the Limits section. Some limits are fixed by bank or policy rules.',
    },
    mr: {
      question: 'Limit increase kashi karu?',
      answer:
        'Full KYC complete kara, account verification maintain kara, ani Limits section madhye Increase Limit request submit kara. Kahi limits bank kiwa policy nusar fixed astat.',
    },
  },
  'Why was my transaction blocked?': {
    hi: { question: 'Transaction block kyu hua?' },
    en: {
      answer:
        'A transaction can be blocked because the limit was crossed, risk check failed, wrong PIN was entered multiple times, suspicious activity was detected, bank server issue occurred, or compliance policy applied.',
    },
    mr: {
      question: 'Transaction block ka zala?',
      answer:
        'Transaction limit cross, risk check, wrong PIN attempts, suspicious activity, bank server issue kiwa compliance policy mule block hou shakto.',
    },
  },
  'What are the fees for transactions?': {
    hi: { question: 'Transactions ki fees kya hai?' },
    en: {
      answer:
        'Fees depend on payment type and transaction amount. The confirmation screen shows fees/charges, so check the total before confirming payment.',
    },
    mr: {
      question: 'Transactions sathi fees kay aahe?',
      answer:
        'Fees payment type ani transaction amount var depend kartat. Confirm screen var fee/charges disel. Payment confirm karnyapurvi total amount nakki check kara.',
    },
  },
  'How do I link a bank account?': {
    hi: { question: 'Bank account link kaise karu?' },
    en: {
      answer:
        'Open Payment Methods > Add Bank Account, select the bank, complete SIM/SMS verification, and set the UPI PIN.',
    },
    mr: {
      question: 'Bank account link kasa karu?',
      answer:
        'Payment Methods > Add Bank Account open kara, bank select kara, SIM/SMS verification complete kara, ani UPI PIN set kara.',
    },
  },
  'How do I add or remove a UPI ID?': {
    hi: { question: 'UPI ID add ya remove kaise karu?' },
    en: {
      answer:
        'In UPI Settings, tap Add UPI ID and create the preferred handle. To remove one, select the UPI ID and use Remove/Delete.',
    },
    mr: {
      question: 'UPI ID add kiwa remove kasa karu?',
      answer:
        'UPI Settings madhye Add UPI ID tap karun preferred handle create kara. Remove sathi UPI ID select kara ani Remove/Delete option vapra.',
    },
  },
  'Why is my bank account not verifying?': {
    hi: { question: 'Bank account verify kyu nahi ho raha?' },
    en: {
      answer:
        'Your registered mobile SIM should be active in the phone, SMS permission should be on, the bank server should be available, and mobile balance/SMS pack should be active.',
    },
    mr: {
      question: 'Bank account verify ka hot nahi?',
      answer:
        'Registered mobile SIM phone madhye active asavi, SMS permission on asavi, bank server available asava, ani mobile balance/SMS pack active asava.',
    },
  },
  'How do I set a default payment method?': {
    hi: { question: 'Default payment method kaise set karu?' },
    en: {
      answer:
        'In Payment Methods, select the preferred bank/UPI/wallet and tap Set as Default. The same method will be auto-selected for the next payment.',
    },
    mr: {
      question: 'Default payment method kasa set karu?',
      answer:
        'Payment Methods madhye preferred bank/UPI/wallet select kara ani Set as Default tap kara. Pudhchya payment madhe toch method auto-selected disel.',
    },
  },
  'How do I pay a merchant bill?': {
    hi: { question: 'Merchant bill kaise pay karu?' },
    en: {
      answer:
        'Scan the merchant QR or search the merchant/biller, enter the amount, verify the details, and confirm payment.',
    },
    mr: {
      question: 'Merchant bill kasa pay karu?',
      answer:
        'Merchant QR scan kara kiwa merchant/biller search kara, amount taka, details verify kara, ani payment confirm kara.',
    },
  },
  'How do I add a new biller?': {
    hi: { question: 'Naya biller kaise add karu?' },
    en: {
      answer:
        'In Bills, tap Add Biller, select the category, enter the consumer/customer number, and save the biller.',
    },
    mr: {
      question: 'Nava biller kasa add karu?',
      answer:
        'Bills section madhye Add Biller tap kara, category select kara, consumer/customer number taka, ani biller save kara.',
    },
  },
  'Why is the biller not available?': {
    hi: { question: 'Biller available kyu nahi hai?' },
    en: {
      answer:
        'The biller may be temporarily down, unsupported, under maintenance, or unavailable for your region/account. Retry after some time or report it to support.',
    },
    mr: {
      question: 'Biller available ka nahi?',
      answer:
        'Biller temporarily down, supported nasne, maintenance madhye asne, kiwa tumchya region/account sathi unavailable asu shakto. Thodya velane retry kara kiwa support la report kara.',
    },
  },
  'How can I view my biller history?': {
    hi: { question: 'Biller history kaise dekhu?' },
    en: {
      answer:
        'Open Bills > Biller History/Payment History. You will see saved billers, paid bills, due dates, and transaction status.',
    },
    mr: {
      question: 'Biller history kashi pahu?',
      answer:
        'Bills > Biller History/Payment History open kara. Tithe saved billers, paid bills, due dates ani transaction status disel.',
    },
  },
  'How do I manage notification settings?': {
    hi: { question: 'Notification settings kaise manage karu?' },
    en: {
      answer:
        'Open Settings > Notifications and turn transaction alerts, offers, reminders, SMS/email/push options on or off.',
    },
    mr: {
      question: 'Notification settings kase manage karu?',
      answer:
        'Settings > Notifications open kara ani transaction alerts, offers, reminders, SMS/email/push options on/off kara.',
    },
  },
  'Why am I not receiving transaction alerts?': {
    hi: { question: 'Transaction alerts kyu nahi aa rahe?' },
    en: {
      answer:
        'Check app notification permission, phone DND, battery saver, internet, registered email/mobile, and SMS inbox. Bank/app alerts can also be delayed.',
    },
    mr: {
      question: 'Transaction alerts ka yet nahi aahet?',
      answer:
        'App notification permission, phone DND, battery saver, internet, registered email/mobile ani SMS inbox check kara. Bank/app alerts madhye delay pan hou shakto.',
    },
  },
  'How can I turn off promotional messages?': {
    hi: { question: 'Promotional messages off kaise karu?' },
    en: {
      answer:
        'Turn off Promotional Messages in Settings > Notifications/Communication Preferences. Some mandatory service alerts cannot be turned off.',
    },
    mr: {
      question: 'Promotional messages off kase karu?',
      answer:
        'Settings > Notifications/Communication Preferences madhye Promotional Messages off kara. Kahi mandatory service alerts off karta yet nahi.',
    },
  },
  'How do I get SMS or email alerts?': {
    hi: { question: 'SMS ya email alerts kaise milenge?' },
    en: {
      answer:
        'Enable SMS Alerts and Email Alerts in notification settings. Your registered mobile/email should be correct.',
    },
    mr: {
      question: 'SMS kiwa email alerts kase miltil?',
      answer:
        'Notification settings madhye SMS Alerts ani Email Alerts enable kara. Registered mobile/email correct asne garjeche aahe.',
    },
  },
  'How do I update my profile details?': {
    hi: { question: 'Profile details kaise update karu?' },
    en: {
      answer:
        'Open Profile/Settings, update the editable fields, and tap Save. Sensitive changes may require OTP/KYC verification.',
    },
    mr: {
      question: 'Profile details kase update karu?',
      answer:
        'Profile/Settings open kara, editable fields update kara, ani Save tap kara. Sensitive changes sathi OTP/KYC verification required asu shakto.',
    },
  },
  'How can I change my password or PIN?': {
    hi: { question: 'Password ya PIN kaise change karu?' },
    en: {
      answer:
        'In Settings > Security, select Change Password/Change PIN, verify the old password/PIN, and set the new one.',
    },
    mr: {
      question: 'Password kiwa PIN kasa change karu?',
      answer:
        'Settings > Security madhye Change Password/Change PIN select kara, old password/PIN verify kara, ani navin password/PIN set kara.',
    },
  },
  'How do I change my language or app preferences?': {
    hi: { question: 'Language ya app preferences kaise change karu?' },
    en: {
      answer:
        'Open Settings > Language/App Preferences, select your preferred language/theme/other preferences, and save.',
    },
    mr: {
      question: 'Language kiwa app preferences kase change karu?',
      answer:
        'Settings > Language/App Preferences open kara, preferred language/theme/other preferences select kara, ani Save kara.',
    },
  },
  'How do I update my notification settings?': {
    hi: { question: 'Notification settings kaise update karu?' },
    en: {
      answer:
        'Go to Settings > Notifications and update push, SMS, email, offers, and transaction alert preferences.',
    },
    mr: {
      question: 'Notification settings kase update karu?',
      answer:
        'Settings > Notifications madhye jaun push, SMS, email, offers ani transaction alert preferences update kara.',
    },
  },
  'Why is my payment stuck?': {
    hi: { question: 'Payment stuck kyu hai?' },
    en: {
      answer:
        'If payment is stuck, do not close the app, check transaction status, and avoid duplicate payment. Pending status can take some time to finalize. If the timeline is crossed, raise a support ticket.',
    },
    mr: {
      question: 'Payment stuck ka aahe?',
      answer:
        'Payment stuck asel tar app close karu naka, transaction status check kara, ani duplicate payment avoid kara. Pending status final honyasathi thoda vel lagu shakto. Timeline cross zali tar support ticket raise kara.',
    },
  },
  'What do I do if a page is not loading?': {
    hi: { question: 'Page load nahi ho raha to kya karu?' },
    en: {
      answer:
        'Check internet, refresh the page, clear app/browser cache, update the app, and log in again. If it repeats, report it to support with a screenshot.',
    },
    mr: {
      question: 'Page load hot nasel tar kay karu?',
      answer:
        'Internet check kara, page refresh kara, app/browser cache clear kara, app update kara, ani punha login kara. Issue repeat zala tar screenshot sobat support la report kara.',
    },
  },
  'Why is my UPI showing an error?': {
    hi: { question: 'UPI error kyu dikha raha hai?' },
    en: {
      answer:
        'UPI errors can happen because of bank server issues, wrong PIN, device/SIM mismatch, limit crossed, inactive account, or weak internet. Re-verify the bank account and retry after some time.',
    },
    mr: {
      question: 'UPI error ka disat aahe?',
      answer:
        'UPI error bank server, wrong PIN, device/SIM mismatch, limit cross, inactive account kiwa weak internet mule yeu shakto. Bank account re-verify kara ani thodya velane retry kara.',
    },
  },
  'How do I fix OTP or authentication issues?': {
    hi: { question: 'OTP ya authentication issue kaise fix karu?' },
    en: {
      answer:
        'Check the correct mobile/email, keep network stable, allow SMS permission, do not use expired OTP, and try Resend OTP. Multiple failed attempts can temporarily lock the account.',
    },
    mr: {
      question: 'OTP kiwa authentication issue kasa fix karu?',
      answer:
        'Correct mobile/email check kara, network stable theva, SMS permission allow kara, expired OTP use karu naka, ani Resend OTP try kara. Multiple failed attempts nantar account temporary lock hou shakto.',
    },
  },
  'How do I recover my account?': {
    hi: { question: 'Account recover kaise karu?' },
    en: {
      answer:
        'Use Forgot Password/Recover Account on the login screen, verify registered mobile/email, complete OTP verification, and reset the password.',
    },
    mr: {
      question: 'Account recover kasa karu?',
      answer:
        'Login screen var Forgot Password/Recover Account vapra, registered mobile/email verify kara, OTP complete kara, ani password reset kara.',
    },
  },
  'What if I lost access to my phone number?': {
    hi: { question: 'Phone number ka access kho gaya to kya karu?' },
    en: {
      answer:
        'Contact support and provide identity verification/KYC documents. Account access can be restored only after the registered number is updated.',
    },
    mr: {
      question: 'Phone number cha access gela tar kay karu?',
      answer:
        'Support la contact kara ani identity verification/KYC documents provide kara. Registered number update zalyanantarach account access restore hoil.',
    },
  },
  'How do I change my registered email?': {
    hi: { question: 'Registered email kaise change karu?' },
    en: {
      answer:
        'Use the email update option in Profile/Settings. If you cannot access the account, raise a support ticket and complete identity verification.',
    },
    mr: {
      question: 'Registered email kasa change karu?',
      answer:
        'Profile/Settings madhye email update option vapra. Account access nasel tar support ticket raise kara ani identity verification complete kara.',
    },
  },
  'How can I restore a blocked account?': {
    hi: { question: 'Blocked account restore kaise karu?' },
    en: {
      answer:
        'Contact support/Admin, verify the reason, and complete the required security/KYC checks. Fraud or suspicious activity reviews can take time.',
    },
    mr: {
      question: 'Blocked account restore kasa karu?',
      answer:
        'Support/Admin la contact kara, reason verify karun ghya, ani required security/KYC checks complete kara. Fraud/suspicious activity review la time lagu shakto.',
    },
  },
};

export function getSupportedLanguage(language) {
  return LANGUAGE_OPTIONS.some((option) => option.value === language) ? language : 'hi';
}

export function getChatbotCopy(language) {
  return CHATBOT_COPY[getSupportedLanguage(language)] || CHATBOT_COPY.hi;
}

export function getLocalizedTopicTitle(topic, language) {
  const selectedLanguage = getSupportedLanguage(language);
  return TOPIC_LABELS[topic.id]?.[selectedLanguage] || topic.title;
}

export function getLocalizedQuestion(item, language) {
  const selectedLanguage = getSupportedLanguage(language);
  return FAQ_TRANSLATIONS[item.question]?.[selectedLanguage]?.question || item.question;
}

export function getLocalizedAnswer(item, language) {
  const selectedLanguage = getSupportedLanguage(language);
  return FAQ_TRANSLATIONS[item.question]?.[selectedLanguage]?.answer || item.answer;
}
