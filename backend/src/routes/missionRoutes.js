/**
 * Mission Routes
 * Endpoints for lunar missions:
 * GET /api/missions
 * GET /api/missions/:id
 * POST /api/missions
 * PUT /api/missions/:id
 * DELETE /api/missions/:id
 * GET /api/missions/:id/registrations
 */
const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const registrationController = require('../controllers/registrationController');

router.get('/', missionController.getAllMissions);
router.get('/:id', missionController.getMissionById);
router.post('/', missionController.createMission);
router.put('/:id', missionController.updateMission);
router.delete('/:id', missionController.deleteMission);

// Sub-resource: registrations belonging to mission
router.get('/:id/registrations', registrationController.getRegistrationsByMissionId);

module.exports = router;
