// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // you can switch to SMTP if needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail app password recommended
      },
    });

    const info = await transporter.sendMail({
      from: `"MY INVENTORY BD" <${process.env.EMAIL_USER}>`,
      to, // recipient email
      subject, // email subject
      html, // email HTML content
    });

    console.log("✅ Email sent to:", to, "| Response:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
