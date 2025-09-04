import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/dashboardLayout';
import Layout from '@/layout/userlayout/userlayout';
import React, { useEffect, useState } from 'react';
import styles from './username.module.css';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { sendConnectionRequest ,getConnectionRequests, getMyConnections } from '@/config/redux/action/authAction';
import { connection } from 'next/server';

export default function UserProfilePage({ userProfile }) {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionNull ,setIsConnectionNull] = useState(true);

  const getUserPosts = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequests(localStorage.getItem('token') ));
    await dispatch(getMyConnections(localStorage.getItem("token")));
  };

  useEffect(() => {
    const post = postState.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postState.posts]);
 
  useEffect(() => {
    console.log("connectionId" ,authState.connections.map(user=>user.connectionId));
    console.log("user profile" ,userProfile.userId._id);
    if (authState.connections.some((user) => user.connectionId === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);
      if(authState.connections.find(user=>String(user.connectionId) === String(userProfile.userId._id)).status_accepted===true){
        setIsConnectionNull(false);
      }
    }
    if (authState.connectionRequest.some((user) => user.userId === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);
      if(authState.connectionRequest.find(user=>String(user.userId) === String(userProfile.userId._id)).status_accepted===true){
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections ,authState.connectionRequest]);

  useEffect(()=>{
    getUserPosts();
  },[])

  console.log("connections",authState.connections);
  console.log("isconnection" ,isConnectionNull);

  return (
    <Layout>
      <DashboardLayout>
        {/* Banner */}
        <div className={styles.card}></div>

        {/* Profile Info */}
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

        {/* Connect/Connected Button */}
        <div className={styles.connectionSection}>
          {isCurrentUserInConnection ? (
            <button className={styles.connectedButton}>{isConnectionNull ? "Pending" :"Connected"}</button>
          ) : (
            <button
              className={styles.connectButton}
              onClick={() => {
                dispatch(sendConnectionRequest(userProfile.userId._id ));
              }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Bio */}
        <div className={styles.bio}>{userProfile.bio}</div>

        {/* Recent Posts */}
        <div className={styles.recentActivity}>
          <h2>Recent Activity</h2>
          {userPosts.map((post, index) => (
            <div key={index} className={styles.post}>
              {post.media !== '' ? (
                <div className={styles.postMedia}>
                  <img src={`${BASE_URL}/${post.media}`} alt="Post media" />
                </div>
              ) : (
                <div className={styles.emptyMedia}></div>
              )}
              <p className={styles.postBody}>{post.body}</p>
            </div>
          ))}
        </div>
        <div>
          <h2>Work History</h2>
          {userProfile.pastWork.map((work ,index)=>{
            return(
            <div>
              <p>{work.company} - {work.position}</p>
              <p>{work.years}</p>
            </div>
            )
          })}
          <div style={{cursor:"pointer"}} onClick={async ()=>{
            const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`);
            
            window.open(`${BASE_URL}/${response.data.message}` ,"_blank");
          }}>
            <i class="fa-solid fa-download">Download resume</i>
          </div>
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
