/**
 * Registration Routes
 * Endpoints for registration opportunities:
 * GET /api/registrations
 * GET /api/registrations/:id
 * POST /api/registrations
 * PUT /api/registrations/:id
 * DELETE /api/registrations/:id
 */
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.get('/', registrationController.getAllRegistrations);
router.get('/:id', registrationController.getRegistrationById);
router.post('/', registrationController.createRegistration);
router.put('/:id', registrationController.updateRegistration);
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;
