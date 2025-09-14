import { Router } from "express";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloud/cloudinary.js";
import {
  activeCheck,
  commentPost,
  createPost,
  deleteComment,
  deletePosts,
  getAllComments,
  getAllPosts,
  incrementLikes,
} from "../Controllers/post.controllers.js";
import multer from "multer";

const router = Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Folder where files will be saved
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 1650123123.jpg
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "pro_connect_posts", // ✅ new folder
      format: file.mimetype.split("/")[1], // keep original format
      public_id: Date.now() + "-" + file.originalname.split(".")[0], // unique name
    };
  },
});

// Init upload middleware
const upload = multer({ storage });

router.route("/").get(activeCheck);
router.post(
  "/post",
  upload.single("media"),
  (req, res, next) => {
    next();
  },
  createPost
);

router.route("/get_all_posts").get(getAllPosts);
router.route("/delete_post").delete(deletePosts);

router.route("/comment").post(commentPost);
router.route("/get_post_comments").get(getAllComments);
router.route("/delete_comment").post(deleteComment);
router.route("/like_post").post(incrementLikes);
export default router;
