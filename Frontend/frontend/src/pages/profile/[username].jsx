import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/dashboardLayout';
import Layout from '@/layout/userlayout/userlayout';
import React, { useEffect, useState } from 'react';
import styles from './username.module.css';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { sendConnectionRequest, getConnectionRequests, getMyConnections } from '@/config/redux/action/authAction';

// Profile Header Component
const ProfileHeader = ({ userProfile }) => (
  <div className={styles.profileHeader}>
    <img
      className={styles.profilePic}
      src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
      alt="Profile Picture"
    />
    <div className={styles.userDetails}>
      <p className={styles.name}>{userProfile.userId.name}</p>
      <p className={styles.username}>@{userProfile.userId.username}</p>
    </div>
  </div>
);

// Connection Button Component
const ConnectionButton = ({ isCurrentUserInConnection, isConnectionNull, onConnect }) => (
  <div className={styles.connectionSection}>
    {isCurrentUserInConnection ? (
      <button className={styles.connectedButton}>
        {isConnectionNull ? "Pending" : "Connected"}
      </button>
    ) : (
      <button className={styles.connectButton} onClick={onConnect}>
        Connect
      </button>
    )}
  </div>
);

// Bio Section Component
const BioSection = ({ bio }) => (
  <div className={styles.bio}>{bio}</div>
);

// Post Item Component
const PostItem = ({ post }) => (
  <div className={styles.post}>
    {post.media !== '' ? (
      <div className={styles.postMedia}>
        <img src={`${BASE_URL}/${post.media}`} alt="Post media" />
      </div>
    ) : (
      <div className={styles.emptyMedia}></div>
    )}
    <p className={styles.postBody}>{post.body}</p>
  </div>
);

// Recent Activity Component
const RecentActivity = ({ userPosts }) => (
  <div className={styles.recentActivity}>
    <h2 className={styles.sectionTitle}>Recent Activity</h2>
    <div className={styles.postsContainer}>
      {userPosts.map((post, index) => (
        <PostItem key={index} post={post} />
      ))}
    </div>
  </div>
);

// Work History Item Component
const WorkHistoryItem = ({ work }) => (
  <div className={styles.workItem}>
    <p className={styles.workPosition}>{work.company} - {work.position}</p>
    <p className={styles.workYears}>{work.years}</p>
  </div>
);

// Work History Component
const WorkHistory = ({ pastWork, userId }) => {
  const handleDownloadResume = async () => {
    try {
      const response = await clientServer.get(`/user/download_resume?id=${userId}`);
      window.open(`${BASE_URL}/${response.data.message}`, "_blank");
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };

  return (
    <div className={styles.workHistory}>
      <h2 className={styles.sectionTitle}>Work History</h2>
      <div className={styles.workHistoryContainer}>
        {pastWork.map((work, index) => (
          <WorkHistoryItem key={index} work={work} />
        ))}
      </div>
      <div className={styles.downloadResume} onClick={handleDownloadResume}>
        <i className="fa-solid fa-download"></i>
        <span className={styles.downloadText}>Download Resume</span>
      </div>
    </div>
  );
};

// Main Component
export default function UserProfilePage({ userProfile }) {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPosts = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequests(localStorage.getItem('token')));
    await dispatch(getMyConnections(localStorage.getItem("token")));
  };

  const handleConnect = () => {
    dispatch(sendConnectionRequest(userProfile.userId._id));
  };

  useEffect(() => {
    const post = postState.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postState.posts]);

  useEffect(() => {
    console.log("connectionId", authState.connections.map(user => user.connectionId));
    console.log("user profile", userProfile.userId._id);
    
    if (authState.connections.some((user) => user.connectionId === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);
      if (authState.connections.find(user => String(user.connectionId) === String(userProfile.userId._id)).status_accepted === true) {
        setIsConnectionNull(false);
      }
    }
    
    if (authState.connectionRequest.some((user) => user.userId === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);
      if (authState.connectionRequest.find(user => String(user.userId) === String(userProfile.userId._id)).status_accepted === true) {
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections, authState.connectionRequest]);

  useEffect(() => {
    getUserPosts();
  }, []);

  console.log("connections", authState.connections);
  console.log("isconnection", isConnectionNull);

  return (
    <Layout>
      <DashboardLayout>
        <div className={styles.profileContainer}>
          {/* Banner */}
          <div className={styles.banner}></div>

          {/* Profile Header */}
          <ProfileHeader userProfile={userProfile} />

          {/* Connection Button */}
          <ConnectionButton
            isCurrentUserInConnection={isCurrentUserInConnection}
            isConnectionNull={isConnectionNull}
            onConnect={handleConnect}
          />

          {/* Bio Section */}
          <BioSection bio={userProfile.bio} />

          {/* Recent Activity */}
          <RecentActivity userPosts={userPosts} />

          {/* Work History */}
          <WorkHistory
            pastWork={userProfile.pastWork}
            userId={userProfile.userId._id}
          />
        </div>
      </DashboardLayout>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get('/user/get_profile_by_username', {
    params: {
      username: context.query.username,
    },
  });

  const response = request.data.profile;
  return { props: { userProfile: response } };
}