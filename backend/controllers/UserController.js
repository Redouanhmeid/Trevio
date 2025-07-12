require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, UserVerification, PasswordReset } = require('../models');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendMail = require('../helpers/sendMail');

const { v4: uuidv4 } = require('uuid');

// path for static verified page
const path = require('path');

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

// testing success
transporter.verify((error, success) => {
 if (error) {
  console.log('Not Ready fo messages');
  console.log(error);
 } else {
  console.log('Ready fo messages');
  console.log(success);
 }
});

const createToken = (_id) => {
 return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};
// Get single user
const getUser = async (req, res) => {
 User.findOne({ where: { id: req.params.iduser } }).then((user) => {
  res.json(user);
 });
};
const getUserByEmail = async (req, res) => {
 try {
  const user = await User.findOne({ where: { email: req.params.email } });

  if (!user) {
   // Return 404 status instead of returning null
   return res.status(404).json({ message: 'User not found' });
  }

  // Ensure the user object has all required fields
  const userData = user.toJSON ? user.toJSON() : user;

  // Ensure role exists
  if (!userData.role) {
   userData.role = 'client';
  }

  res.json(userData);
 } catch (error) {
  console.error('Error in getUserByEmail:', error);
  res.status(500).json({ error: 'Internal server error' });
 }
};
// Get all users
const getUsers = async (req, res) => {
 User.findAll().then((users) => {
  res.json(users);
 });
};

// post a User
const postUser = async (req, res) => {
 const { email, password, firstname, lastname, phone, avatar, isVerified } =
  req.body;

 try {
  // Check if the user already exists
  let user = await User.findOne({ where: { email } });

  if (user) {
   // If the user exists and isVerified is true, update user details
   if (isVerified) {
    user.firstname = firstname;
    user.lastname = lastname;
    user.phone = phone || user.phone; // Retain existing phone if new phone is empty
    user.avatar = avatar || user.avatar;
    user.isVerified = true;
    await user.save();

    // Directly return success response
    console.log('User updated:', JSON.stringify(user, null, 2));
    return res.status(200).json(user);
   } else {
    return res
     .status(400)
     .json({ error: "L'utilisateur existe déjà et n'est pas vérifié" });
   }
  } else {
   // Create a new user
   const createdAt = Date.now();
   const expiresAt = Date.now() + 21600000;

   user = await User.ValidateCreate(
    email,
    password,
    firstname,
    lastname,
    phone || 'N/A', // Set default phone if empty
    avatar || '/avatars/default.png', // Set default avatar if not provided
    'client',
    isVerified || false // Set default isVerified to false if not provided
   );

   // Ensure user is properly created
   if (!user) {
    return res.status(500).json({ error: 'User creation failed.' });
   }

   if (!isVerified) {
    // Handle email verification if the user is not verified
    const token = createToken(user._id);
    const uniqueString = uuidv4() + token;

    sendMail(email, uniqueString, res)
     .then(() => {
      const newVerification = UserVerification.Create(
       email,
       uniqueString,
       createdAt,
       expiresAt
      );
     })
     .catch((error) => {
      res.json({
       status: 'ÉCHOUÉ',
       message: 'la vérification a échoué!',
      });
     });
   } else {
    // Log and return success response if verified via Google Sign-In
    console.log(
     'User created via Google Sign-In:',
     JSON.stringify(user, null, 2)
    );
    return res.status(201).json({
     email: user.email,
     password: user.password,
     firstname: user.firstname,
     lastname: user.lastname,
     phone: user.phone,
     isVerified: user.isVerified,
     avatar: user.avatar,
    });
   }
  }
 } catch (error) {
  console.error('Error in postUser:', error);
  return res.status(400).json({ error: error.message });
 }
};

const verifyUser = async (req, res) => {
 const { id } = req.params;

 try {
  const user = await User.findByPk(id);

  if (!user) {
   return res.status(404).json({ message: 'User non trouvé' });
  }

  // Update the isVerified status to true
  await user.update({ isVerified: true });

  return res.status(200).json({ message: 'User vérifié avec succès' });
 } catch (error) {
  console.error('Erreur lors de la vérification du user:', error);
  return res.status(500).json({ message: 'Erreur interne du serveur' });
 }
};

// Delete a user
const deleteUser = async (req, res) => {
 const { id } = req.params;

 try {
  const user = await User.findByPk(id);

  if (!user) {
   return res.status(404).json({ message: 'User non trouvé' });
  }

  await user.destroy();
  return res.status(200).json({ message: 'User supprimé avec succès' });
 } catch (error) {
  console.error('Erreur lors de la suppression du User:', error);
  return res.status(500).json({ message: 'Internal server error' });
 }
};

// User Login
const loginUser = async (req, res) => {
 let email = req.body.email;
 let password = req.body.password;
 try {
  const user = await User.Login(email, password);
  console.log('Logged in user:', {
   id: user.id,
   email: user.email,
   role: user.role,
  });

  // create a token
  const token = jwt.sign({ id: user.id }, process.env.SECRET, {
   expiresIn: '3d',
  });
  console.log('Created token with secret:', process.env.SECRET); // Be careful with this in production!

  res.status(200).json({
   id: user.id,
   email: user.email,
   firstname: user.firstname,
   lastname: user.lastname,
   role: user.role,
   token, // Include the token in response
  });
 } catch (error) {
  res.status(400).json({ error: error.message });
 }
};

//verify email
const verifyEmail = async (req, res) => {
 try {
  let uniqueString = req.params.uniqueString;

  const PMV = await UserVerification.findOne({
   where: { uniqueString: uniqueString },
  });

  if (!PMV) {
   return res.status(400).send({
    msg: 'Votre lien de vérification a peut-être expiré. Veuillez cliquer sur renvoyer pour vérifier votre e-mail.',
   });

   //if token exist, find the user with that token
  } else {
   let email = PMV.email;
   const PM = await User.findOne({ where: { email: email } });
   if (!PM) {
    return res.status(401).send({
     msg: "Nous n'avons pas pu trouver d'utilisateur pour cette vérification. Inscrivez vous s'il vous plait!",
    });

    //if user is already verified, tell the user to login
   } else if (PM.isVerified) {
    return res
     .status(200)
     .send("L'utilisateur a déjà été vérifié. Veuillez vous connecter");

    //if user is not verified, change the verified to true by updating the field
   } else {
    const updated = User.update(
     { isVerified: 1 },
     {
      where: { email: email },
     }
    );
    //if not updated send error message
    if (!updated) {
     return res.status(500).send({ msg: err.message });
     //else send status of 200
    } else {
     const PMV = await UserVerification.destroy({
      where: { email: email },
     });
     return res
      .sendFile(path.join(__dirname, '../views/verified.html'))
      .status(200)
      .send('Votre compte a été vérifié avec succès');
    }
   }
  }
 } catch (error) {
  console.error(error);
 }
};

// Update user's firstname, lastname, and phone
const updateUserDetails = async (req, res) => {
 const { id } = req.params; // Assuming the id of the user is passed in the URL
 const { firstname, lastname, phone } = req.body;

 try {
  const user = await User.findByPk(id);
  if (!user) {
   return res.status(404).json({ message: 'User not found' });
  }

  // Update the User's details
  await user.update({
   firstname,
   lastname,
   phone,
  });

  return res.status(200).json({ message: 'Détails mis à jour avec succès' });
 } catch (error) {
  console.error('Erreur lors de la mise à jour des détails:', error);
  return res.status(500).json({ message: 'Internal server error' });
 }
};

// Update User's avatar
const updateUserAvatar = async (req, res) => {
 const { id } = req.params;
 const { avatar } = req.body;

 try {
  const user = await User.findByPk(id);
  if (!user) {
   return res.status(404).json({ message: 'User not found' });
  }

  // Update the User's avatar
  await user.update({
   avatar,
  });

  return res.status(200).json({ message: 'User avatar updated successfully' });
 } catch (error) {
  console.error('Error updating User avatar:', error);
  return res.status(500).json({ message: 'Internal server error' });
 }
};

// Controller function to update the password
const updatePassword = async (req, res) => {
 const { id } = req.params;
 const { currentPassword, newPassword } = req.body;

 try {
  // Check if the user exists
  const user = await User.findByPk(id);
  if (!user) {
   return res.status(404).json({ message: 'User introuvable' });
  }

  // Check if the current password matches the user's password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
   return res.status(400).json({ message: 'Mot de passe actuel invalide' });
  }
  // Encrypt the new password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  // Update the password
  user.password = hash;
  await user.save();

  res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
 } catch (error) {
  console.error('Erreur lors de la mise à jour du mot de passe:', error);
  res.status(500).json({ message: 'Erreur interne du serveur' });
 }
};

// Function to generate a random code
const generateCode = () => {
 return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
};

// Request password reset
const resetPasswordRequest = async (req, res) => {
 const { email } = req.body;

 try {
  const user = await User.findOne({ where: { email } });
  if (!user) {
   return res.status(404).json({ message: 'Email not found' });
  }

  const resetCode = generateCode();
  const expiresAt = Date.now() + 3600000; // 1 hour expiry

  await PasswordReset.create({ email, code: resetCode, expiresAt });

  const transporter = nodemailer.createTransport({
   host: process.env.HOST,
   port: parseInt(process.env.MAIL_PORT),
   secure: false,
   auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
   },
  });

  const mailOptions = {
   from: process.env.AUTH_EMAIL,
   to: email,
   subject: 'Password Reset Code',
   html: `<p>Your password reset code is: <b>${resetCode}</b></p>`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'Password reset code sent' });
 } catch (error) {
  console.error('Error requesting password reset:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Verify reset code
const verifyResetCode = async (req, res) => {
 const { email, code } = req.body;

 try {
  const resetRecord = await PasswordReset.findOne({ where: { email, code } });
  if (!resetRecord) {
   return res.status(400).json({ message: 'Invalid code' });
  }

  if (resetRecord.expiresAt < Date.now()) {
   return res.status(400).json({ message: 'Code has expired' });
  }

  res.status(200).json({ message: 'Code verified' });
 } catch (error) {
  console.error('Error verifying reset code:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Reset password
const resetPassword = async (req, res) => {
 const { email, code, newPassword } = req.body;

 try {
  const resetRecord = await PasswordReset.findOne({ where: { email, code } });
  if (!resetRecord) {
   return res.status(400).json({ message: 'Invalid code' });
  }

  if (resetRecord.expiresAt < Date.now()) {
   return res.status(400).json({ message: 'Code has expired' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
   return res.status(404).json({ message: 'User not found' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  user.password = hash;
  await user.save();

  await PasswordReset.destroy({ where: { email, code } });

  res.status(200).json({ message: 'Password reset successful' });
 } catch (error) {
  console.error('Error resetting password:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

// Verify password for an existing user
const verifyPassword = async (req, res) => {
 const { email, password } = req.body;

 try {
  // Check if the user exists
  const user = await User.findOne({ where: { email } });
  if (!user) {
   return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Check if the password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
   return res.status(400).json({ verified: false });
  }

  // Password is correct
  return res.status(200).json({ verified: true });
 } catch (error) {
  console.error('Erreur lors de la vérification du mot de passe:', error);
  return res.status(500).json({ verified: false });
 }
};

module.exports = {
 getUser,
 getUserByEmail,
 getUsers,
 postUser,
 verifyUser,
 loginUser,
 verifyEmail,
 updateUserDetails,
 updateUserAvatar,
 updatePassword,
 deleteUser,
 resetPasswordRequest,
 verifyResetCode,
 resetPassword,
 verifyPassword,
};
