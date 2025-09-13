import { Router } from "express";
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

// ✅ Cloudinary support
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloud/cloudinary.js"; // Adjust the path if needed

const router = Router();

// ✅ Cloudinary storage config for profile pictures
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "pro_connect_profiles", // Cloudinary folder
      format: file.mimetype.split("/")[1], // Preserve original file format
      public_id: Date.now() + "-" + file.originalname.split(".")[0], // Unique filename
    };
  },
});

// ✅ Multer instance using Cloudinary
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
