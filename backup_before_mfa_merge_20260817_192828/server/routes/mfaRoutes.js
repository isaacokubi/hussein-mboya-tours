import express from "express";
import {
  sendCustomerLoginPin,
  verifyCustomerLoginPin,
} from "../controllers/mfaController.js";

const router = express.Router();

router.post(
  "/customer/send-pin",
  sendCustomerLoginPin
);

router.post(
  "/customer/verify-pin",
  verifyCustomerLoginPin
);

export default router;
