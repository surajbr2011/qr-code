const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorizeRoles('admin'), getExpenses)
    .post(protect, authorizeRoles('admin'), addExpense);

router.route('/:id')
    .delete(protect, authorizeRoles('admin'), deleteExpense);

module.exports = router;
