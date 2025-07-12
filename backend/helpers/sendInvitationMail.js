require('dotenv').config();
const nodemailer = require('nodemailer');

const sendInvitationMail = async (email, invitationLink, clientName) => {
 // Ensure invitationLink has a valid base URL
 const baseUrl =
  process.env.FRONTEND_URL || process.env.URI || 'https://app.trevio.ma';
 const fullInvitationLink = invitationLink.startsWith('http')
  ? invitationLink
  : `${baseUrl}${invitationLink}`;

 try {
  const transporter = nodemailer.createTransport({
   host: process.env.HOST,
   port: parseInt(process.env.MAIL_PORT),
   secure: false,
   auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
   },
   tls: {
    rejectUnauthorized: false,
   },
  });

  const mailOptions = {
   from: '"Trevio" <noreply@trevio.ma>',
   to: email,
   subject: 'Invitation à devenir gestionnaire de propriété',
   headers: {
    'X-Priority': '1', // Set priority
    Precedence: 'bulk', // Optional: indicates bulk mail
   },
   html: `
        <div style="font-family: "Inter", sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Invitation à rejoindre Trevio</h2>
          <p>Vous avez été invité(e) à devenir gestionnaire de propriété sur notre plateforme.</p>
          <p>Cette invitation vous a été envoyée par: <b>${clientName}</b></p>
          <div style="margin: 30px 0;">
            <a href="${fullInvitationLink}" 
               style="background-color: #6d5ffa; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Accepter l'invitation
            </a>
          </div>
          <p style="color: #666;">Lien direct si le bouton ne fonctionne pas: ${fullInvitationLink}</p>
          <p>Ce lien expirera dans 72 heures.</p>
          <p>Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.</p>
        </div>
      `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(
   'Email sent successfully. Full invitation link:',
   fullInvitationLink
  );
  return result;
 } catch (error) {
  console.error('Error sending invitation email:', error);
  throw error;
 }
};

module.exports = sendInvitationMail;
