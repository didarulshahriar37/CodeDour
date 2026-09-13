const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateProblem,
    deleteProblem,
    refreshViews,
    deleteContest,
    getAllContestsAdmin
} = require('../controllers/admin.controller');

router.use(verifyAdmin);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);

router.get('/contests', getAllContestsAdmin);
router.delete('/contests/:id', deleteContest);
router.post('/refresh-views', refreshViews);

module.exports = router;
