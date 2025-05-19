const {
 ManagerInvitation,
 User,
 Property,
 UserProperty,
} = require('../models');
const crypto = require('crypto');
const sendInvitationMail = require('../helpers/sendInvitationMail');

const sendManagerInvitation = async (req, res) => {
 const { invitedEmail } = req.body;

 if (!req.user) {
  return res.status(401).json({ error: 'Authentication required' });
 }

 const clientId = req.user.id;

 try {
  // Check if the client exists and has appropriate role
  const client = await User.findByPk(clientId);
  if (!client) {
   return res
    .status(403)
    .json({ error: 'Unauthorized to send manager invitations' });
  }

  // Check if there's already a pending invitation
  const existingInvitation = await ManagerInvitation.findOne({
   where: {
    clientId,
    invitedEmail,
    status: 'pending',
   },
  });

  if (existingInvitation) {
   return res
    .status(400)
    .json({ error: 'An invitation is already pending for this email' });
  }

  // Generate token and create invitation
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  const invitation = await ManagerInvitation.create({
   clientId,
   invitedEmail,
   token,
   expiresAt,
  });

  console.log(invitation);

  // Generate invitation link
  const invitationLink = `${process.env.FRONTEND_URL}/manager/verify/${token}`;
  // Create client name from found client
  const clientFullName = `${client.firstname} ${client.lastname}`;

  // Send invitation email using new template
  await sendInvitationMail(invitedEmail, invitationLink, clientFullName);

  res.status(200).json({
   message: 'Invitation sent successfully',
   invitation,
  });
 } catch (error) {
  console.error('Error sending manager invitation:', error);
  res
   .status(500)
   .json({ error: 'Failed to send invitation', details: error.message });
 }
};

const sendManagerInvitationDirect = async (req, res) => {
 const { invitedEmail, clientId, email } = req.body;

 if (!invitedEmail || !clientId || !email) {
  return res.status(400).json({ error: 'Missing required fields' });
 }

 try {
  // Verify the client exists and matches the provided email
  const client = await User.findOne({
   where: {
    id: clientId,
    email: email,
   },
  });

  if (!client) {
   return res
    .status(403)
    .json({ error: 'Unauthorized to send manager invitations' });
  }

  // Check if there's already a pending invitation
  const existingInvitation = await ManagerInvitation.findOne({
   where: {
    clientId,
    invitedEmail,
    status: 'pending',
   },
  });

  if (existingInvitation) {
   return res
    .status(400)
    .json({ error: 'An invitation is already pending for this email' });
  }

  // Generate token and create invitation
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  const invitation = await ManagerInvitation.create({
   clientId,
   invitedEmail,
   token,
   expiresAt,
  });

  // Generate invitation link
  const invitationLink = `${process.env.FRONTEND_URL}/manager/verify/${token}`;
  // Create client name from found client
  const clientFullName = `${client.firstname} ${client.lastname}`;

  // Send invitation email using template
  await sendInvitationMail(invitedEmail, invitationLink, clientFullName);

  res.status(200).json({
   message: 'Invitation sent successfully',
   invitation,
  });
 } catch (error) {
  console.error('Error sending manager invitation:', error);
  res.status(500).json({
   error: 'Failed to send invitation',
   details: error.message,
  });
 }
};

const verifyManagerInvitation = async (req, res) => {
 const { token } = req.params;

 try {
  const invitation = await ManagerInvitation.findOne({
   where: {
    token,
    status: 'pending',
   },
   include: [
    {
     model: User,
     as: 'client',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
  });

  if (!invitation) {
   return res.status(404).json({ error: 'Invalid or expired invitation' });
  }

  if (new Date() > invitation.expiresAt) {
   await invitation.destroy();
   return res.status(400).json({ error: 'Invitation has expired' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
   where: { email: invitation.invitedEmail },
  });

  // If valid, return the invitation details
  res.json({
   invitation: {
    email: invitation.invitedEmail,
    clientName: `${invitation.client.firstname} ${invitation.client.lastname}`,
    expiresAt: invitation.expiresAt,
    userExists: !!existingUser,
   },
  });
 } catch (error) {
  console.error('Error verifying manager invitation:', error);
  res.status(500).json({ error: 'Failed to verify invitation' });
 }
};

const acceptManagerInvitation = async (req, res) => {
 const { token } = req.params;
 const userData = req.body;

 try {
  const invitation = await ManagerInvitation.findOne({
   where: {
    token,
   },
   include: [
    {
     model: User,
     as: 'client',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
  });

  if (!invitation) {
   return res.status(400).json({ error: 'Invalid invitation' });
  }

  if (new Date() > invitation.expiresAt) {
   return res.status(400).json({ error: 'Invitation has expired' });
  }

  // Check if invitation was already accepted
  if (invitation.status === 'accepted') {
   return res.status(200).json({
    message: 'Invitation already accepted',
    status: 'accepted',
    manager: {
     email: invitation.invitedEmail,
    },
   });
  }

  // Check if user exists
  const existingUser = await User.findOne({
   where: { email: invitation.invitedEmail },
  });

  if (existingUser) {
   // Update invitation status
   await invitation.update({ status: 'accepted' });

   return res.status(200).json({
    message: 'Concierge role assigned successfully',
    manager: {
     id: existingUser.id,
     email: existingUser.email,
     role: existingUser.role,
    },
   });
  } else {
   if (!userData || Object.keys(userData).length === 0) {
    return res.status(200).json({
     message: 'Please complete signup process first',
     requiresSignup: true,
     invitationEmail: invitation.invitedEmail,
    });
   }

   // Create new user
   try {
    const newUser = await User.ValidateCreate(
     userData.email,
     userData.password,
     userData.firstname,
     userData.lastname,
     userData.phone,
     '/avatars/default.png', // default avatar
     'client', // default role
     true // isVerified initially false
    );

    // Update invitation status
    await invitation.update({ status: 'accepted' });

    return res.status(201).json({
     message: 'New manager account created successfully',
     status: 'accepted',
     manager: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
     },
    });
   } catch (error) {
    if (error.message.includes('email is already registered')) {
     return res.status(400).json({ error: 'Email already exists' });
    }
    throw error;
   }
  }
 } catch (error) {
  console.error('Error accepting manager invitation:', error);
  res.status(500).json({
   error: 'Failed to process invitation',
   details: error.message,
  });
 }
};

// New endpoint to mark invitation as accepted after signup
const completeInvitationAfterSignup = async (req, res) => {
 const { token } = req.params;
 const { userId } = req.body;

 try {
  const invitation = await ManagerInvitation.findOne({
   where: {
    token,
    status: 'pending',
   },
  });

  if (!invitation) {
   return res.status(404).json({ error: 'Invalid or expired invitation' });
  }

  const user = await User.findByPk(userId);
  if (!user) {
   return res.status(404).json({ error: 'User not found' });
  }

  // Update user role and invitation status
  await user.update({
   role: 'concierge',
  });
  await invitation.update({ status: 'accepted' });

  res.status(200).json({
   message: 'Manager role assigned successfully',
   manager: {
    id: user.id,
    email: user.email,
    role: user.role,
   },
  });
 } catch (error) {
  console.error('Error completing invitation after signup:', error);
  res.status(500).json({ error: 'Failed to complete invitation process' });
 }
};

// Get pending invitations for a client
const getPendingInvitations = async (req, res) => {
 const { clientId } = req.params;

 try {
  const pendingInvitations = await ManagerInvitation.findAll({
   where: {
    clientId,
    status: 'pending',
   },
   order: [['createdAt', 'DESC']],
  });

  res.status(200).json(pendingInvitations);
 } catch (error) {
  console.error('Error fetching pending invitations:', error);
  res.status(500).json({
   error: 'Failed to fetch pending invitations',
   details: error.message,
  });
 }
};

// Resend invitation
const resendInvitation = async (req, res) => {
 const { invitationId } = req.params;

 try {
  const invitation = await ManagerInvitation.findByPk(invitationId, {
   include: [
    {
     model: User,
     as: 'client',
     attributes: ['id', 'firstname', 'lastname', 'email'],
    },
   ],
  });

  if (!invitation) {
   return res.status(404).json({ error: 'Invitation not found' });
  }

  if (invitation.status !== 'pending') {
   return res
    .status(400)
    .json({ error: 'Only pending invitations can be resent' });
  }

  // Update expiration date
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  await invitation.update({ expiresAt });

  // Generate invitation link
  const invitationLink = `${process.env.FRONTEND_URL}/manager/verify/${invitation.token}`;

  // Create client name from found client
  const clientFullName = `${invitation.client.firstname} ${invitation.client.lastname}`;

  // Send invitation email again
  await sendInvitationMail(
   invitation.invitedEmail,
   invitationLink,
   clientFullName
  );

  res.status(200).json({
   message: 'Invitation resent successfully',
   invitation,
  });
 } catch (error) {
  console.error('Error resending invitation:', error);
  res.status(500).json({
   error: 'Failed to resend invitation',
   details: error.message,
  });
 }
};

module.exports = {
 sendManagerInvitation,
 sendManagerInvitationDirect,
 verifyManagerInvitation,
 acceptManagerInvitation,
 completeInvitationAfterSignup,
 getPendingInvitations,
 resendInvitation,
};
