import React, { useEffect } from "react";
import Layout from "@/layout/userlayout/userlayout";
import DashboardLayout from "@/layout/dashboardLayout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptConnection,
  getMyConnections,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./connections.module.css";

export default function Connections() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyConnections());
  }, [dispatch]);

  return (
    <Layout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}> My Connections</h1>

          {/* No requests */}
          {authState.connectionRequest.length === 0 && (
            <div className={styles.emptyState}>
              <p>No requests pending 🚀</p>
            </div>
          )}

          {/* Pending requests */}
          {authState.connectionRequest.length !== 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Pending Requests</h2>
              {authState.connectionRequest
                .filter((connection) => connection.status_accepted == null)
                .map((user) => (
                  <div
                    key={user._id}
                    className={styles.userCard}
                    onClick={() =>
                      router.push(`/profile/${user.userId.username}`)
                    }
                  >
                    <img
                      src={user.userId.profilePicture}
                      alt="Profile"
                      className={styles.avatar}
                    />
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{user.userId.name}</p>
                      <p className={styles.userUsername}>
                        @{user.userId.username}
                      </p>
                    </div>
                    <button
                      className={styles.acceptBtn}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await dispatch(
                          acceptConnection({
                            token: localStorage.getItem("token"),
                            connectionId: user._id,
                            action: "accept",
                          })
                        );
                      }}
                    >
                      Accept
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Accepted requests */}
          {authState.connectionRequest.filter(
            (connection) => connection.status_accepted !== null
          ).length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Connections</h2>
              {authState.connectionRequest
                .filter((connection) => connection.status_accepted !== null)
                .map((user) => (
                  <div
                    key={user._id}
                    className={styles.userCard}
                    onClick={() =>
                      router.push(`/profile/${user.userId.username}`)
                    }
                  >
                    <img
                      src={user.userId.profilePicture}
                      alt="Profile"
                      className={styles.avatar}
                    />
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{user.userId.name}</p>
                      <p className={styles.userUsername}>
                        @{user.userId.username}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </Layout>
  );
}
