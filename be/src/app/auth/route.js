import express from "express";
const router = express.Router();
import authController from "./controller.js";
import middleware from "../../middleware/index.js";

router.post("/login", authController.loginLocal);
router.post("/register", authController.signupLocal);
router.get("/me", middleware.isAuthenticated, authController.getMe);
router.post("/refresh", authController.refreshToken);
// router.get("/verify/:token", authController.verify);
// router.use("/google/callback", authController.googleCallBack);
// router.use("/google", authController.googleSignup);
// router.use("/github/callback", authController.githubCallBack);
// router.use("/github", authController.githubSignup);
// router.use("/sendreset", authController.sendResetPassword);
// router.use("/reset/:token", authController.resetPassword);
// router.use("/updatepassword", authController.updatePassword);

export default router;
