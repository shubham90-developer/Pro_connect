import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, getAllPosts } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  isLoading: false,
  postsFetched: false,
  profileFetched: false,

  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all posts";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.postsFetched = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments;
      })
      .addCase(getAllComments.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
        state.comments = [];
      });
  },
});
export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;
