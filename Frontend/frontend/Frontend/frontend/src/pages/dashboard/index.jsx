import {
  deletePost,
  getAllComments,
  getAllPosts,
  incrementLikes,
  createPost,
  postComment,
} from "@/config/redux/action/postAction";
import {
  getAllUsers,
  getUserAndProfile,
} from "@/config/redux/action/authAction";
import Layout from "@/layout/userlayout/userlayout";
import DashboardLayout from "@/layout/dashboardLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./dashboard.module.css";
import { resetPostId } from "@/config/redux/reducer/postReducer";
import { BASE_URL } from "@/config";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [postContent, setPostContent] = useState("");
  const [filecontent, setFilecontent] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleUpload = async () => {
    await dispatch(createPost({ file: filecontent, body: postContent }));
    setFilecontent(null);
    setPostContent("");
    dispatch(getAllPosts());
  };

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
    }
  }, [authState.isTokenThere]);

  useEffect(() => {
    if (!authState.allProfileFetched) {
      dispatch(getAllUsers());
    }
  }, [authState.allProfileFetched]);

  if (!authState.user) {
    return (
      <Layout>
        <DashboardLayout>...Loading</DashboardLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardLayout>
        {/* ===== Create Post Box ===== */}
        <div className={styles.postInputContainer}>
          <div className={styles.profilePictureWrapper}>
            <img
              className={styles.profilePicture}
              src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
              alt="Profile"
            />
          </div>

          <div className={styles.inputSection}>
            <textarea
              onChange={(e) => setPostContent(e.target.value)}
              value={postContent}
              className={styles.textarea}
              placeholder="What's on your mind?"
            ></textarea>

            <div className={styles.inputActions}>
              <label htmlFor="file_input" className={styles.fileLabel}>
                <i className="fa-solid fa-image"></i> Add Media
              </label>
              <input
                onChange={(e) => setFilecontent(e.target.files[0])}
                type="file"
                hidden
                id="file_input"
              />

              {postContent.length > 0 && (
                <button onClick={handleUpload} className={styles.postButton}>
                  Post
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== All Posts ===== */}
        <div className={styles.postsWrapper}>
          {postState.posts.map((post) => (
            <div className={styles.postContainer} key={post._id}>
              {/* Post Header */}
              <div className={styles.postHeader}>
                <img
                  className={styles.postProfilePic}
                  src={`${BASE_URL}/${post.userId.profilePicture}`}
                  alt="Post"
                />
                <div className={styles.userInfo}>
                  <p className={styles.name}>{post.userId.name}</p>
                  <p className={styles.username}>@{post.userId.username}</p>
                </div>
                {post.userId._id === authState.user.userId._id && (
                  <i
                    onClick={async () => {
                      await dispatch(deletePost(post._id));
                      await dispatch(getAllPosts());
                    }}
                    className={`fa-solid fa-trash ${styles.trashIcon}`}
                  ></i>
                )}
              </div>

              {/* Post Body */}
              <p className={styles.postContent}>{post.body}</p>

              {/* Post Media */}
              {post.media && (
                <div className={styles.postMediaWrapper}>
                  <img
                    className={styles.postMedia}
                    src={`${BASE_URL}/${post.media}`}
                    alt="Post media"
                  />
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <div
                  onClick={async () => {
                    await dispatch(
                      incrementLikes({
                        post_id: post._id,
                        user_id: authState.user._id,
                      })
                    );
                    await dispatch(getAllPosts());
                  }}
                  className={styles.actionItem}
                >
                  <i className="fa-regular fa-thumbs-up"></i>
                  <span>{post.likes}</span>
                </div>

                <div
                  onClick={async () => {
                    await dispatch(getAllComments(post._id));
                  }}
                  className={styles.actionItem}
                >
                  <i className="fa-regular fa-comment"></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Comment Modal ===== */}
        {postState.postId !== "" && (
          <div
            className={styles.modalOverlay}
            onClick={() => dispatch(resetPostId())}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Comments</h2>

              {postState.comments.length === 0 && <p>No comments</p>}

              {postState.comments.length > 0 && (
                <div className={styles.commentsList}>
                  {postState.comments.map((postComment, index) => (
                    <div key={index} className={styles.commentItem}>
                      <img
                        className={styles.commentProfilePic}
                        src={`${BASE_URL}/${postComment.userId.profilePicture}`}
                        alt="User"
                      />
                      <div>
                        <p className={styles.commentName}>
                          {postComment.userId.name}
                        </p>
                        <p className={styles.commentUsername}>
                          @{postComment.userId.username}
                        </p>
                        <p className={styles.commentBody}>{postComment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className={styles.commentInputBox}>
                <input
                  value={commentText}
                  type="text"
                  placeholder="Write a comment..."
                  className={styles.commentInput}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={async () => {
                    await dispatch(
                      postComment({
                        postId: postState.postId,
                        commentBody: commentText,
                      })
                    );
                    await dispatch(getAllComments(postState.postId));
                    setCommentText("");
                  }}
                  className={styles.commentSubmit}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </Layout>
  );
}
