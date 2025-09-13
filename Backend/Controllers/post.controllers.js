import Post from "../Models/post.model.js";
import User from "../Models/user.schema.js";
import Comment from "../Models/comment.model.js";

export const activeCheck = (req, res) => {
  res.status(200).json({ message: "Running" });
};

export const createPost = async (req, res) => {
  console.log("create post conyroller called");
  try {
    const { token, body } = req.body;

    // 1. Find user
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Create new post
    const post = new Post({
      userId: user._id,
      body,
      media: req.file ? req.file.path : "", // ✅ Cloudinary URL
      filetype: req.file ? req.file.mimetype.split("/")[1] : "",
    });

    // 3. Save
    await post.save();

    // 4. Respond with saved post
    return res.status(201).json({
      message: "Post created",
      post,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture "
    );
    return res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePosts = async (req, res) => {
  try {
    const { token, postId } = req.body;
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() != user._id.toString()) {
      return res.status(404).json({ message: "Unauthorised user" });
    }
    await Post.deleteOne({ _id: postId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { token, postId, commentBody } = req.body;

    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      res.status(404).json({ message: "Post not found" });
    }
    const comment = new Comment({
      userId: user._id,
      postId: postId,
      body: commentBody,
    });
    await comment.save();
    res.status(200).json({ message: "comment added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { post_id } = req.query;
    const post = await Post.findOne({ _id: post_id });
    const comment = await Comment.find({ postId: post_id }).populate(
      "userId",
      "name username profilePicture"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.json({ comments: comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { token, comment_id } = req.query;
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      res.status(404).json({ message: "comment not found" });
    }
    if (comment.userId.toString() != user._id.toString()) {
      res.status(400).json({ message: "Unauthorized user" });
    }
    await Comment.deleteOne({ _id: comment_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const incrementLikes = async (req, res) => {
  try {
    const { post_id, user_id } = req.body;
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.likedBy.includes(user_id)) {
      return res.status(400).json({ message: "User already liked this post" });
    }
    post.likes = post.likes + 1;
    post.likedBy.push(user_id);
    await post.save();
    res.status(200).json({ message: "Likes incremented" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
