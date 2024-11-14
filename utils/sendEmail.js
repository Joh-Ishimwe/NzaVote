
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jishimwe24@gmail.com',
                pass: 'nykm uhfk cnve hbch' 
            }
        });

        const mailOptions = {
            from: 'NzaVote',
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};

export default sendEmail;