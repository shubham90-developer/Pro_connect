import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "posts/get_all_posts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_all_posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/create_post",
  async ({ file, body }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("token", localStorage.getItem("token"));
      formData.append("body", body);
      formData.append("media", file); // must be a File object
      console.log("File received:", file);

      // ✅ let axios handle headers automatically
      const response = await clientServer.post("/post", formData);

      if (response.status === 201) {
        return thunkAPI.fulfillWithValue(response.data.post);
      } else {
        return thunkAPI.rejectWithValue("Post not created");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/delete_post",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          postId: post_id,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const incrementLikes = createAsyncThunk(
  "/posts/like",
  async ({ post_id, user_id }, thunkAPI) => {
    try {
      const response = await clientServer.post("/like_post", {
        post_id: post_id,
        user_id: user_id,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.data);
    }
  }
);

export const postComment = createAsyncThunk(
  "posts/comment",
  async ({ postId, commentBody }, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        postId: postId,
        commentBody: commentBody,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.fulfillWithValue(err.data);
    }
  }
);

export const getAllComments = createAsyncThunk(
  "posts/get_all_comments",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_post_comments", {
        params: { post_id: post_id },
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data.comments,
        post_id: post_id,
      });
    } catch (err) {
      thunkAPI.rejectWithValue(err.data);
    }
  }
);
