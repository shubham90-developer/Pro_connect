import { Router } from "express";
import path from "path";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadUserResume,
  sendConnectionRequest,
  myConnections,
  acceptConnectionRequest,
  getConnectionRequests,
  getProfileByUsername,
} from "../Controllers/user.controller.js";
import multer from "multer";
import { getActiveResourcesInfo } from "process";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 1650123123.jpg
  },
});

// Init upload middleware
const upload = multer({ storage });

router
  .route("/upload_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update_user_profile").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_profiles").get(getAllUserProfile);
router.route("/user/get_profile_by_username").get(getProfileByUsername);
router.route("/user/download_resume").get(downloadUserResume);
router.route("/user/send_request").post(sendConnectionRequest);
router.route("/user/my_connections").get(myConnections);
router.route("/user/connection_requests").get(getConnectionRequests);
router.route("/user/send_request_accept").post(acceptConnectionRequest);

export default router;
