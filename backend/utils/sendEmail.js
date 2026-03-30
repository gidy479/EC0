const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // Ensure graceful degradation: if no real SMTP details are provided in .env, natively create an Ethereal test inbox!
        let transporter;
        const isGmail = process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail');

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transportConfig = isGmail ? {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            } : {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true' || (process.env.EMAIL_PORT == 465),
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            };

            transporter = nodemailer.createTransport(transportConfig);
        } else {
            console.log("No SMTP details found in .env, generating Ethereal test account...");
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const mailOptions = {
            from: `"EcoMarket Plus" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully [ID: %s] [Accepted: %s]", info.messageId, info.accepted.join(','));
        
        // Ethereal provides a dynamic URL to view the sent email in your browser!
        if (!process.env.EMAIL_USER) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("❌ Email Sending Error:", error);
    }
};

module.exports = sendEmail;
