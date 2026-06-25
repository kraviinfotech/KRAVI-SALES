const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTestEmail = async (to) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "KRAVI SALES Test Email",
        html: `
            <h2>Email Working Successfully ✅</h2>
            <p>This email was sent from KRAVI SALES.</p>
        `,
    });
};

module.exports = {
    sendTestEmail,
};