const express = require('express');
const router = express.Router();
const {
 verifyEmail,
 getUser,
 getUserByEmail,
 getUsers,
 postUser,
 verifyUser,
 loginUser,
 updateUserDetails,
 updateUserAvatar,
 updatePassword,
 deleteUser,
 resetPasswordRequest,
 verifyResetCode,
 resetPassword,
 verifyPassword,
} = require('../controllers/UserController');

router.get('/:iduser', getUser);
router.get('/email/:email', getUserByEmail);
router.get('/', getUsers);
router.post('/', postUser);
router.post('/login', loginUser);
router.get('/verify/:uniqueString', verifyEmail);
router.put('/:id', updateUserDetails);
router.put('/avatar/:id', updateUserAvatar);
router.put('/password/:id', updatePassword);
router.delete('/:id', deleteUser);
router.patch('/:id/verify', verifyUser);

// New routes for password reset functionality
router.post('/reset-password-request', resetPasswordRequest);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/verify-password', verifyPassword);

module.exports = router;
