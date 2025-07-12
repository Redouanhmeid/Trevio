require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = async (email, uniqueString, res) => {
 const baseUrl =
  process.env.FRONTEND_URL || process.env.URI || 'https://app.trevio.ma';
 try {
  // Nodemailer stuff
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
  const verificationUrl = `${baseUrl}/api/v1/users/verify/${uniqueString}`;
  const mailOptions = {
   from: '"Trevio" <noreply@trevio.ma>',
   to: email,
   subject: 'Vérifiez votre adresse email - Trevio',
   headers: {
    'X-Priority': '1', // Set priority
    Precedence: 'bulk', // Optional: indicates bulk mail
   },
   html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e8e8; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #6d5ffa; margin-bottom: 5px;">Trevio</h1>
      <p style="color: #666; margin-top: 0;">Votre plateforme de gestion immobilière</p>
    </div>
    <h2 style="color: #6d5ffa;">Vérifiez votre adresse email</h2>
    <p>Bonjour,</p>
    <p>Merci de vous être inscrit sur Trevio. Pour terminer votre inscription et accéder à votre compte, veuillez confirmer votre adresse email.</p>
    <p>Ce lien <b>expire dans 6 heures</b>.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" 
         style="background-color: #6d5ffa; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
        Vérifier mon email
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur:</p>
    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 14px;">
      ${verificationUrl}
    </p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8; font-size: 12px; color: #888;">
      <p>Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>
      <p>© ${new Date().getFullYear()} Trevio. Tous droits réservés.</p>
    </div>
  </div>
  `,
   text: `Vérifiez votre adresse email pour terminer l'inscription et connectez-vous à votre compte. Ce lien expire dans 6 heures. Lien de vérification: ${verificationUrl}`,
  };

  transporter
   .sendMail(mailOptions)
   .then(() => {
    // email sent and verification record saved
    res.json({
     status: 'EN ATTENTE',
     message: 'Un email de vérification a été envoyé!',
    });
   })
   .catch((error) => {
    console.log(error);
    res.json({
     status: 'ÉCHOUÉ',
     message: "L'email de vérification a échoué!",
    });
   });
 } catch (error) {
  console.log(error.message);
  res.json({
   status: 'ÉCHOUÉ',
   message: "Impossible d'enregistrer l'email de vérification!",
  });
 }
};

module.exports = sendMail;
