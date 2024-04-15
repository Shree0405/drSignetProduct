 import nodemailer from "nodemailer";
import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
} from "../config/config.js";

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: false,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
});

const sendEmail = (mailOptions) => {
	return transporter.sendMail(mailOptions);
};

export default sendEmail ;