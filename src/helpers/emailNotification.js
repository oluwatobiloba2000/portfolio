import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jsonFormatter from './jsonFormat';
dotenv.config();

function SendNotificationEmail(res, reciever,reciever2, subject, text){
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: process.env.MY_EMAIL_ADDRESS,
         pass: process.env.MY_EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.MY_EMAIL_ADDRESS,
      to:`${reciever}, ${reciever2}`,
      subject: subject,
      text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
       return res.status(400).json(error);
      } else {
       return jsonFormatter.success(res, `Email sent: ${info.response}` );
      }
    });
}
export default SendNotificationEmail;