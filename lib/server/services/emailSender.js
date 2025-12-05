"use server"
import nodemailer from 'nodemailer';
import { errorLogger } from '../errorLoggers/errorLogger';

export async function sendEmail(to, subject, text) {
    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Replace with your SMTP server
        port: 465, // Replace with your SMTP port
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.GMAIL_APP_USER, // Your email user
            pass: process.env.GMAIL_APP_PASSWORD, // Your email password
        },
    });

    try {
        await transporter.sendMail({
            from: `"ETH Notifications" <${process.env.GMAIL_APP_USER}>`, // Sender address with name
            to: to, // List of recipients
            subject: subject, // Subject line
            text: text, // Plain text body
        });
    } catch (error) {
        errorLogger("emailSender", error, "emailSender")
    }
}