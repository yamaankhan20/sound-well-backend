import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendOTPEmail(email: string, otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: `"OTP Service" ${process.env.EMAIL_USER}`,
        to: email,
        subject: 'Your Barcode',
        text: `Your Barcode is: ${otp}`
    });
}

export default sendOTPEmail;
