const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // gmail app password, not your real password
  },
});

const sendVerificationEmail = async (email, name, code) => {
  await transporter.sendMail({
    from:    `"Lumielle" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Verify your Lumielle account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1a1714">Hi ${name},</h2>
        <p>Thanks for joining Lumielle. Use this code to verify your email:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;
                    text-align:center;padding:24px;background:#f8f5f0;
                    border-radius:8px;margin:24px 0;color:#1a1714">
          ${code}
        </div>
        <p style="color:#888">This code expires in 10 minutes.</p>
        <p style="color:#888">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };