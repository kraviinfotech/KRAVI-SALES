export const PRIMARY_SUPPORT_TOPIC_LIMIT = 8;

export const supportFaqTopics = [
  {
    id: 'account-login',
    title: 'Account & Login',
    questions: [
      {
        question: 'How do I log in to my account?',
        answer:
          'Login ke liye app open karein, apna role select karein, registered mobile/email aur password enter karein, phir Login par tap karein. Agar Seller hain to Seller login tab use karein, Manager hain to Manager login tab use karein.',
      },
      {
        question: 'I forgot my password. How can I reset it?',
        answer:
          'Login screen par Forgot Password tap karein, registered email/mobile enter karein, OTP verify karein, phir naya password set karein. OTP expire ho jaye to Resend OTP use karein.',
      },
      {
        question: 'Why am I not able to log in?',
        answer:
          'Sabse pehle internet, role tab, mobile/email aur password check karein. Agar account locked, inactive ya password galat hai to Forgot Password try karein. Issue repeat ho to Manager/Admin se account status verify karwaein.',
      },
      {
        question: 'How do I change my registered phone number or email?',
        answer:
          'Profile/Settings me registered phone ya email update option check karein. Agar option available nahi hai, apne Manager/Admin ko request bhejein. Security ke liye OTP verification zaroori ho sakta hai.',
      },
    ],
  },
  {
    id: 'payments-transfers',
    title: 'Payments & Transfers',
    questions: [
      {
        question: 'How do I send money?',
        answer:
          'Payments/Transfer section open karein, receiver ka bank/UPI/mobile detail select karein, amount enter karein, details verify karein aur PIN/OTP se confirm karein. Sales payment ke liye Cash ya Online method select karke record save karein.',
      },
      {
        question: 'Why did my payment fail?',
        answer:
          'Payment fail hone ke common reasons hain low balance, wrong PIN, bank server issue, weak internet, daily limit cross hona, ya app ka old version. Status Pending/Failed me dikhe to receipt safe rakhein aur thodi der baad retry karein.',
      },
      {
        question: 'How can I check the status of my transaction?',
        answer:
          'Transaction History/Payment History open karein, transaction select karein aur status dekhein. Success, Pending ya Failed status ke saath transaction ID/UTR bhi milega.',
      },
      {
        question: 'Can I cancel a payment?',
        answer:
          'Successful payment generally cancel nahi hota. Agar payment pending hai to final status ka wait karein. Galat receiver ko payment ho gaya hai to receiver se refund request karein ya support ticket raise karein.',
      },
      {
        question: 'How do I add a new bank account or UPI ID?',
        answer:
          'Payment Methods/Bank & UPI section me Add Bank Account ya Add UPI ID tap karein, bank select karein, mobile/SMS verification complete karein aur UPI PIN set/verify karein.',
      },
    ],
  },
  {
    id: 'wallet-balance',
    title: 'Wallet & Balance',
    questions: [
      {
        question: 'How do I check my wallet balance?',
        answer:
          'Wallet section open karein. Available balance top par dikhega. Agar balance hide hai to refresh karein ya app restart karke dubara check karein.',
      },
      {
        question: 'Why is my wallet balance not updating?',
        answer:
          'Balance update me bank/app sync ki wajah se thoda time lag sakta hai. App refresh karein, internet check karein, transaction status verify karein. Amount debit hua aur balance update nahi hua to transaction ID ke saath support ticket raise karein.',
      },
      {
        question: 'How can I add money to my wallet?',
        answer:
          'Wallet > Add Money open karein, amount enter karein, payment method select karein aur PIN/OTP se confirm karein. Payment success ke baad amount wallet me reflect hoga.',
      },
      {
        question: 'Can I withdraw money from my wallet to my bank?',
        answer:
          'Wallet > Withdraw/Transfer to Bank option available ho to bank account select karein, amount enter karein aur confirm karein. Withdrawal limit, fees aur settlement time app me confirm screen par dikhega.',
      },
    ],
  },
  {
    id: 'offers-cashback',
    title: 'Offers & Cashback',
    questions: [
      {
        question: 'What offers are available right now?',
        answer:
          'Offers/Cashback section open karein. Wahan active offers, coupon code, minimum amount, eligible payment method aur expiry date dikhegi.',
      },
      {
        question: 'How can I check my cashback status?',
        answer:
          'Rewards/Cashback History me jaakar cashback status check karein. Status Pending, Earned, Credited ya Expired ke roop me dikhega.',
      },
      {
        question: "Why didn't I receive cashback?",
        answer:
          'Cashback na milne ke reasons: offer terms match nahi hue, coupon apply nahi hua, minimum amount kam tha, payment method eligible nahi tha, ya offer expire ho gaya. Transaction aur offer terms dobara check karein.',
      },
      {
        question: 'When will my offer or cashback expire?',
        answer:
          'Har offer ke details page par validity/expiry date di hoti hai. Cashback expiry Rewards/Cashback History me check karein.',
      },
    ],
  },
  {
    id: 'bills-recharge',
    title: 'Bills & Recharge',
    questions: [
      {
        question: 'How do I pay a bill?',
        answer:
          'Bills section open karein, biller category select karein, consumer/customer number enter karein, bill fetch karein, details verify karein aur Pay tap karein.',
      },
      {
        question: 'Can I recharge my mobile or DTH?',
        answer:
          'Recharge section me Mobile ya DTH select karein, number/customer ID enter karein, plan choose karein aur payment complete karein.',
      },
      {
        question: 'How do I view my bill payment history?',
        answer:
          'Bills/Recharge History open karein. Wahan paid bills, recharges, status, date aur transaction ID dikhega.',
      },
      {
        question: 'What should I do if a bill payment is not reflected?',
        answer:
          'Payment receipt aur transaction status check karein. Biller update me kabhi-kabhi time lagta hai. Agar expected time ke baad bhi bill reflect nahi hota, transaction ID ke saath complaint raise karein.',
      },
    ],
  },
  {
    id: 'security-fraud',
    title: 'Security & Fraud',
    questions: [
      {
        question: 'How can I secure my account?',
        answer:
          'Strong password/PIN use karein, OTP/UPI PIN kisi ke saath share na karein, app lock enable karein, unknown links par tap na karein aur suspicious activity dikhe to password turant change karein.',
      },
      {
        question: 'What should I do if I suspect fraud?',
        answer:
          'Turant account/password/PIN change karein, bank/app support ko report karein, account/card block request karein aur India me financial fraud ke liye 1930 cyber helpline par complaint karein.',
      },
      {
        question: 'How do I update my UPI PIN?',
        answer:
          'UPI/Bank Account settings me bank select karein, Change UPI PIN ya Reset UPI PIN tap karein, debit card/bank verification complete karein aur naya PIN set karein.',
      },
      {
        question: 'How can I block my account or card?',
        answer:
          'Security/Help section me Block Account/Card option use karein. Agar option available nahi hai, support ya bank helpline se turant contact karein aur suspicious transactions report karein.',
      },
    ],
  },
  {
    id: 'app-issues',
    title: 'App Issues',
    questions: [
      {
        question: 'Why is the app crashing or freezing?',
        answer:
          'App update karein, phone restart karein, cache clear karein, storage space check karein aur stable internet use karein. Issue repeat ho to screenshot/error details ke saath support ko report karein.',
      },
      {
        question: 'Why am I not receiving OTPs?',
        answer:
          'Network signal, SMS inbox space, DND/spam block, correct mobile number aur SIM active status check karein. 1-2 minute wait karke Resend OTP try karein.',
      },
      {
        question: 'How do I update the app?',
        answer:
          'Android par Play Store aur iPhone par App Store open karein, app search karein aur Update tap karein. Update ke baad app restart karein.',
      },
      {
        question: 'How do I clear app cache?',
        answer:
          'Android: Settings > Apps > App Name > Storage > Clear Cache. Browser version use kar rahe hain to browser settings me cache clear karein, phir app reload karein.',
      },
    ],
  },
  {
    id: 'support-feedback',
    title: 'Support & Feedback',
    questions: [
      {
        question: 'How can I contact customer support?',
        answer:
          'Help & Support section open karein. Wahan chat, complaint, email ya call support options milenge. Issue explain karte waqt transaction ID, screenshot aur registered mobile/email add karein.',
      },
      {
        question: 'How do I raise a complaint?',
        answer:
          'Help & Support > Raise Complaint open karein, issue category select karein, details likhein, screenshot/receipt attach karein aur Submit karein.',
      },
      {
        question: 'How can I check the status of my complaint?',
        answer:
          'Help & Support > My Complaints/Tickets open karein. Ticket ID select karke status, latest update aur expected resolution time check karein.',
      },
      {
        question: 'How do I provide feedback about the service?',
        answer:
          'Settings/Help section me Feedback option open karein, rating choose karein, suggestion likhein aur Submit karein. Aap support chat me bhi feedback share kar sakte hain.',
      },
    ],
  },
  {
    id: 'refunds-disputes',
    title: 'Refunds & Disputes',
    questions: [
      {
        question: 'How do I request a refund?',
        answer:
          'Transaction History me failed/incorrect transaction open karein, Report Issue ya Request Refund select karein, reason choose karein aur receipt/screenshot attach karke submit karein.',
      },
      {
        question: 'Why is my refund pending?',
        answer:
          'Refund bank, biller ya payment gateway approval me pending ho sakta hai. Status page par expected timeline check karein. Timeline cross ho jaye to transaction ID ke saath support ticket raise karein.',
      },
      {
        question: 'How long will it take to get my refund?',
        answer:
          'Failed payments ka refund usually 3-7 working days me source account me aata hai. Exact timeline bank/biller/payment method par depend karta hai.',
      },
      {
        question: 'What should I do if I received a duplicate charge?',
        answer:
          'Dono debit entries ke transaction IDs note karein, bank statement/receipt screenshot attach karein aur Duplicate Charge complaint raise karein. Extra debit verified hone par refund process hota hai.',
      },
    ],
  },
  {
    id: 'kyc-verification',
    title: 'KYC & Verification',
    questions: [
      {
        question: 'How do I complete my KYC verification?',
        answer:
          'Profile > KYC/Verification open karein, required details fill karein, document upload karein, selfie/live verification complete karein aur Submit karein.',
      },
      {
        question: 'What documents do I need to upload?',
        answer:
          'Usually PAN, Aadhaar, voter ID, passport ya driving licence jaise valid government documents required hote hain. App me jo document list dikhe, wahi upload karein.',
      },
      {
        question: 'Why was my KYC rejected?',
        answer:
          'KYC blurry document, name/date mismatch, expired document, cropped image, wrong document type ya failed selfie verification ki wajah se reject ho sakta hai.',
      },
      {
        question: 'How can I update my KYC details?',
        answer:
          'Profile > KYC Details me update option check karein. Agar edit locked hai to support ticket raise karein aur correct document/details submit karein.',
      },
    ],
  },
  {
    id: 'limits-policies',
    title: 'Transaction Limits & Policies',
    questions: [
      {
        question: 'What is my daily transaction limit?',
        answer:
          'Limits section ya Payment Settings me daily limit check karein. Limit account type, KYC status, bank rules aur payment method ke hisaab se alag ho sakti hai.',
      },
      {
        question: 'How can I increase my limit?',
        answer:
          'Full KYC complete karein, account verification maintain karein aur Limits section me Increase Limit request submit karein. Kuch limits bank ya policy ke hisaab se fixed hoti hain.',
      },
      {
        question: 'Why was my transaction blocked?',
        answer:
          'Transaction limit cross, risk check, wrong PIN attempts, suspicious activity, bank server issue ya compliance policy ki wajah se block ho sakta hai.',
      },
      {
        question: 'What are the fees for transactions?',
        answer:
          'Fees payment type aur transaction amount par depend karti hai. Confirm screen par fee/charges dikhegi. Payment confirm karne se pehle total amount zaroor check karein.',
      },
    ],
  },
  {
    id: 'bank-upi-setup',
    title: 'Bank & UPI Setup',
    questions: [
      {
        question: 'How do I link a bank account?',
        answer:
          'Payment Methods > Add Bank Account open karein, bank select karein, SIM/SMS verification complete karein aur UPI PIN set karein.',
      },
      {
        question: 'How do I add or remove a UPI ID?',
        answer:
          'UPI Settings me Add UPI ID tap karke preferred handle create karein. Remove ke liye UPI ID select karein aur Remove/Delete option use karein.',
      },
      {
        question: 'Why is my bank account not verifying?',
        answer:
          'Registered mobile SIM phone me active honi chahiye, SMS permission on honi chahiye, bank server available hona chahiye aur mobile balance/SMS pack active hona chahiye.',
      },
      {
        question: 'How do I set a default payment method?',
        answer:
          'Payment Methods me preferred bank/UPI/wallet select karein aur Set as Default tap karein. Agli payment me wahi method auto-selected dikhega.',
      },
    ],
  },
  {
    id: 'merchant-biller',
    title: 'Merchant & Biller Support',
    questions: [
      {
        question: 'How do I pay a merchant bill?',
        answer:
          'Merchant QR scan karein ya merchant/biller search karein, amount enter karein, details verify karein aur payment confirm karein.',
      },
      {
        question: 'How do I add a new biller?',
        answer:
          'Bills section me Add Biller tap karein, category select karein, consumer/customer number enter karein aur biller save karein.',
      },
      {
        question: 'Why is the biller not available?',
        answer:
          'Biller temporarily down, not supported, maintenance me, ya region/account ke liye unavailable ho sakta hai. Thodi der baad retry karein ya support ko report karein.',
      },
      {
        question: 'How can I view my biller history?',
        answer:
          'Bills > Biller History/Payment History open karein. Wahan saved billers, paid bills, due dates aur transaction status dikhega.',
      },
    ],
  },
  {
    id: 'notifications-alerts',
    title: 'Notifications & Alerts',
    questions: [
      {
        question: 'How do I manage notification settings?',
        answer:
          'Settings > Notifications open karein aur transaction alerts, offers, reminders, SMS/email/push options on/off karein.',
      },
      {
        question: 'Why am I not receiving transaction alerts?',
        answer:
          'App notification permission, phone DND, battery saver, internet, registered email/mobile aur SMS inbox check karein. Bank/app alerts me delay bhi ho sakta hai.',
      },
      {
        question: 'How can I turn off promotional messages?',
        answer:
          'Settings > Notifications/Communication Preferences me Promotional Messages off karein. Kuch mandatory service alerts off nahi kiye ja sakte.',
      },
      {
        question: 'How do I get SMS or email alerts?',
        answer:
          'Notification settings me SMS Alerts aur Email Alerts enable karein. Registered mobile/email correct hona chahiye.',
      },
    ],
  },
  {
    id: 'profile-settings',
    title: 'Profile & Settings',
    questions: [
      {
        question: 'How do I update my profile details?',
        answer:
          'Profile/Settings open karein, editable fields update karein aur Save tap karein. Sensitive changes ke liye OTP/KYC verification required ho sakta hai.',
      },
      {
        question: 'How can I change my password or PIN?',
        answer:
          'Settings > Security me Change Password/Change PIN select karein, old password/PIN verify karein aur naya password/PIN set karein.',
      },
      {
        question: 'How do I change my language or app preferences?',
        answer:
          'Settings > Language/App Preferences open karein, preferred language/theme/other preferences select karein aur Save karein.',
      },
      {
        question: 'How do I update my notification settings?',
        answer:
          'Settings > Notifications me jaakar push, SMS, email, offers aur transaction alert preferences update karein.',
      },
    ],
  },
  {
    id: 'technical-troubleshooting',
    title: 'Technical Troubleshooting',
    questions: [
      {
        question: 'Why is my payment stuck?',
        answer:
          'Payment stuck hone par app close na karein, transaction status check karein aur duplicate payment avoid karein. Pending status final hone me thoda time lag sakta hai. Timeline cross ho to support ticket raise karein.',
      },
      {
        question: 'What do I do if a page is not loading?',
        answer:
          'Internet check karein, page refresh karein, app/browser cache clear karein, app update karein aur dubara login karein. Issue repeat ho to screenshot ke saath support ko report karein.',
      },
      {
        question: 'Why is my UPI showing an error?',
        answer:
          'UPI error bank server, wrong PIN, device/SIM mismatch, limit cross, inactive account ya weak internet ki wajah se aa sakta hai. Bank account re-verify karein aur thodi der baad retry karein.',
      },
      {
        question: 'How do I fix OTP or authentication issues?',
        answer:
          'Correct mobile/email check karein, network stable rakhein, SMS permission allow karein, expired OTP use na karein aur Resend OTP try karein. Multiple failed attempts ke baad account temporary lock ho sakta hai.',
      },
    ],
  },
  {
    id: 'account-recovery',
    title: 'Account Recovery',
    questions: [
      {
        question: 'How do I recover my account?',
        answer:
          'Login screen par Forgot Password/Recover Account use karein, registered mobile/email verify karein, OTP complete karein aur password reset karein.',
      },
      {
        question: 'What if I lost access to my phone number?',
        answer:
          'Support ko contact karein aur identity verification/KYC documents provide karein. Registered number update hone ke baad hi account access restore hoga.',
      },
      {
        question: 'How do I change my registered email?',
        answer:
          'Profile/Settings me email update option use karein. Agar account access nahi hai to support ticket raise karein aur identity verification complete karein.',
      },
      {
        question: 'How can I restore a blocked account?',
        answer:
          'Blocked account restore karne ke liye support/Admin ko contact karein, reason verify karwaein aur required security/KYC checks complete karein. Fraud/suspicious activity me review time lag sakta hai.',
      },
    ],
  },
];
