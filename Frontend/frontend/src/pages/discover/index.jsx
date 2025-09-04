import React, { useEffect, useState } from "react";
import Layout from "@/layout/userlayout/userlayout";
import DashboardLayout from "@/layout/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./discover.module.css";
import { useRouter } from "next/router";

export default function Discover() {
  const [isClient, setIsClient] = useState(false);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (!authState.allProfileFetched) {
      dispatch(getAllUsers());
    }
  }, [authState.allProfileFetched, dispatch]);

  return (
    <Layout>
      <DashboardLayout>
        <div className={styles.discoverContainer}>
          <h2 className={styles.pageTitle}>Discover People</h2>

          {isClient && authState.allUsers.length > 0 ? (
            <div className={styles.userList}>
              {authState.allUsers.map((profile) => (
                <div
                  onClick={() =>
                    router.push(`/profile/${profile.userId.username}`)
                  }
                  className={styles.userRow}
                  key={profile.userId._id}
                >
                  <img
                    className={styles.userAvatar}
                    src={`${BASE_URL}/${profile.userId.profilePicture}`}
                    alt="profile"
                  />
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{profile.userId.name}</p>
                    <p className={styles.userUsername}>
                      @{profile.userId.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noUsers}>No users found</p>
          )}
        </div>
      </DashboardLayout>
    </Layout>
  );
}
