 import nodemailer from "nodemailer";
 import CONFIG from "../config/config.js";

const transporter = nodemailer.createTransport({
	host:CONFIG. SMTP_HOST,
	port: CONFIG.SMTP_PORT,
	secure: false,
	auth: {
		user: CONFIG.SMTP_USER,
		pass:CONFIG. SMTP_PASS,
	},
});

const sendEmail =async (mailOptions) => {
	return transporter.sendMail({
        from:CONFIG. SMTP_USER,
        to:mailOptions.email,
        subject: 'Message',
        text: `this is your otp ${mailOptions.otp}`
    }, (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
    });
};

export default sendEmail ;