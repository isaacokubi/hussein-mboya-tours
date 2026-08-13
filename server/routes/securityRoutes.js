const router = require("express").Router();
const controller = require("../controllers/securityController");

router.get("/status", controller.getSecurityStatus);
router.get("/events", controller.getSecurityEvents);

module.exports = router;
