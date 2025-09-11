import { getUserAndProfile } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/dashboardLayout';
import Layout from '@/layout/userlayout/userlayout';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from "./view_profile.module.css";
import { BASE_URL, clientServer } from '@/config';
import { getAllPosts } from '@/config/redux/action/postAction';

export default function ViewProfile() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [inputData, setInputData] = useState({ company: '', position: '', years: '' });
  const [educationData, setEducationData] = useState({ school: '', degree: '', fieldOfStudy: '' });

  useEffect(() => {
    dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, []);

  useEffect(() => {
    if (authState.user) {
      setUserProfile(authState.user);

      const posts = postState.posts.filter(
        (post) => post.userId.username === authState.user.userId.username
      );
      setUserPosts(posts);
    }
  }, [authState.user, postState.posts]);

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post("/upload_profile_picture", formData, {
      headers: {
        "Content-type": "multipart/form-data",
      }
    });
    if (response.data) {
      await dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
    }
  };

  const updateProfile = async () => {
    await clientServer.post("/update_user_profile", {
      token: localStorage.getItem("token"),
      username: userProfile.userId.username,
      name: userProfile.userId.name
    });

    await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education
    });

    await dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
  };

  const handleUserInputData = (e, type) => {
    const { name, value } = e.target;
    if (type === "work") {
      setInputData({ ...inputData, [name]: value });
    } else if (type === "education") {
      setEducationData({ ...educationData, [name]: value });
    }
  };

  return (
    <Layout>
      <DashboardLayout>
        {authState.user && userProfile.userId && postState.posts && (
          <div className={styles.profilePage}>
            {/* Profile Header */}
            <div className={styles.profileHeader}>
              <div className={styles.profilePicWrapper}>
                <label htmlFor="profileUpload" className={styles.profileEditOverlay}>
                  <span>Edit</span>
                </label>
                <img
                  className={styles.profilePic}
                  src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                  alt="Profile Picture"
                />
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    uploadProfilePicture(file);
                  }}
                />
              </div>

              <div className={styles.userDetails}>
                <input
                  onChange={(e) => {
                    setUserProfile({
                      ...userProfile,
                      userId: { ...userProfile.userId, name: e.target.value }
                    });
                  }}
                  type="text"
                  value={userProfile.userId.name}
                />
                <input
                  onChange={(e) => {
                    setUserProfile({
                      ...userProfile,
                      userId: { ...userProfile.userId, username: e.target.value }
                    });
                  }}
                  type="text"
                  value={userProfile.userId.username}
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className={styles.bioSection}>
              <h2 className={styles.sectionTitle}>About Me</h2>
              <input
                type="text"
                onChange={(e) => {
                  setUserProfile({ ...userProfile, bio: e.target.value });
                }}
                value={userProfile.bio}
              />
            </div>

            {/* Recent Activity Section */}
            <div className={styles.recentActivity}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              {userPosts.length > 0 ? (
                userPosts.map((post, index) => (
                  <div key={index} className={styles.post}>
                    {post.media ? (
                      <div className={styles.postMedia}>
                        <img src={`${BASE_URL}/${post.media}`} alt="Post media" />
                      </div>
                    ) : (
                      <div className={styles.emptyMedia}></div>
                    )}
                    <p className={styles.postBody}>{post.body}</p>
                  </div>
                ))
              ) : (
                <p className={styles.noPosts}>No recent posts available.</p>
              )}
            </div>

            {/* Work History Section */}
            <div className={styles.workHistory}>
              <h2 className={styles.sectionTitle}>Work History</h2>
              {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
                userProfile.pastWork.map((work, index) => (
                  <div key={index} className={styles.workCard}>
                    <div className={styles.workInfo}>
                      <p className={styles.workCompany}>{work.company}</p>
                      <p className={styles.workPosition}>{work.position}</p>
                      <p className={styles.workYears}>Working since last {work.years} years</p>
                    </div>
                    
                  </div>
                ))
              ) : (
                <p className={styles.noWork}>No work history available.</p>
              )}
            </div>

            {/* Education Section */}
            <div className={styles.workHistory}>
              <h2 className={styles.sectionTitle}>Education</h2>
              {userProfile.education && userProfile.education.length > 0 ? (
                userProfile.education.map((edu, index) => (
                  <div key={index} className={styles.workCard}>
                    <div className={styles.workInfo}>
                      <p className={styles.workCompany}>{edu.school}</p>
                      <p className={styles.workPosition}>
                        {edu.degree} - {edu.fieldOfStudy}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noWork}>No education details available.</p>
              )}
            </div>

            {/* Buttons Section */}
            <div className={styles.buttonRow}>
              <button onClick={() => setWorkModalOpen(true)} className={styles.button}>
                Add Work
              </button>
              <button onClick={() => setEducationModalOpen(true)} className={styles.button}>
                Add Education
              </button>
            </div>

            {/* Work Modal */}
            {workModalOpen && (
              <div
                className={styles.modalOverlay}
                onClick={() => setWorkModalOpen(false)}
              >
                <div
                  className={styles.modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    onChange={(e) => handleUserInputData(e, "work")}
                    type="text"
                    placeholder="Enter company"
                    name="company"
                    className={styles.input}
                  />
                  <input
                    onChange={(e) => handleUserInputData(e, "work")}
                    type="text"
                    placeholder="Enter position"
                    name="position"
                    className={styles.input}
                  />
                  <input
                    onChange={(e) => handleUserInputData(e, "work")}
                    type="number"
                    placeholder="Enter years"
                    name="years"
                    className={styles.input}
                  />
                  <button
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        pastWork: [...(userProfile.pastWork || []), inputData]
                      });
                      setWorkModalOpen(false);
                    }}
                    className={styles.button}
                  >
                    Add work
                  </button>
                </div>
              </div>
            )}

            {/* Education Modal */}
            {educationModalOpen && (
              <div
                className={styles.modalOverlay}
                onClick={() => setEducationModalOpen(false)}
              >
                <div
                  className={styles.modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    onChange={(e) => handleUserInputData(e, "education")}
                    type="text"
                    placeholder="Enter your school name"
                    name="school"
                    className={styles.input}
                  />
                  <input
                    onChange={(e) => handleUserInputData(e, "education")}
                    type="text"
                    placeholder="Enter your degree"
                    name="degree"
                    className={styles.input}
                  />
                  <input
                    onChange={(e) => handleUserInputData(e, "education")}
                    type="text"
                    placeholder="Enter your field of study"
                    name="fieldOfStudy"
                    className={styles.input}
                  />
                  <button
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        education: [...(userProfile.education || []), educationData]
                      });
                      setEducationModalOpen(false);
                    }}
                    className={styles.button}
                  >
                    Add education
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        {userProfile !== authState.user && (
          <div>
            <button onClick={updateProfile} className={styles.button}>
              Update profile
            </button>
          </div>
        )}
      </DashboardLayout>
    </Layout>
  );
}

