import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPaymentConfirmationEmail = async (toEmail, booking) => {
  try {
    const mailOptions = {
      from: `"Salon Management & Booking App " <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Payment and Booking Confirmed",
      html: `
        <h2>Payment Successful </h2>
        <p>Hello ${booking.User.name},</p>
        <p>Your payment of <b>₹${booking.Service.price}</b> for your booking has been successfully received.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><b>Salon:</b> ${booking.Salon.name}</li>
          <li><b>Service:</b> ${booking.Service.service_name}</li>
          <li><b>Service Provider:</b> ${booking.Staff.name}</li>
          <li><b>Date:</b> ${booking.booking_date}</li>
          <li><b>Time:</b> ${booking.booking_time}</li>
           <li><b>Location:</b> ${booking.Salon.location}</li>
        </ul>

        <p>Thank you for booking with us!</p>
        
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Payment confirmation email sent!");
    // console.log("Email sent:", info.messageId);
    // return info;
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
};

export async function sendReminderMail(to, message) {
  await transporter.sendMail({
    from: `"Salon Management & Booking App " <${process.env.SMTP_USER}>`,
    to,
    subject: "Booking Reminder",
    text: message
  });
}

