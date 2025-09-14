import { useRouter } from "next/router";
import styles from "./dashboardLayout.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { useEffect } from "react";
import { BASE_URL } from "@/config";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("token") == null) {
      router.push("./login");
    }
    dispatch(setTokenIsThere());
  }, []);
  console.log("all users" ,authState.allUsers);
  return (
    <div className={styles.container}>
      {/* Left Sidebar */}
      <div className={styles.leftContainer}>
        <div
          onClick={() => router.push("/dashboard")}
          className={styles.navItem}
        >
          <i className="fa-regular fa-house"></i>
          <p>Home</p>
        </div>

        <div
          onClick={() => router.push("/discover")}
          className={styles.navItem}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          <p>Discover</p>
        </div>

        <div
          onClick={() => router.push("/myconnections")}
          className={styles.navItem}
        >
          <i className="fa-solid fa-user"></i>
          <p>Connections</p>
        </div>
      </div>

      {/* Middle Content */}
      <div className={styles.middleContainer}>{children}</div>

      {/* Right Sidebar */}
      <div className={styles.rightContainer}>
        <h3 className={styles.rightTitle}>✨ Top Profiles</h3>
        {authState.allProfileFetched &&
          authState.allUsers.map((profile, index) => (
            <div key={index} className={styles.profileCard}>
              <img
                src={profile.userId.profilePicture}
                alt="profile"
                className={styles.profileImg}
              />
              <div>
                <p className={styles.profileName}>{profile.userId.name}</p>
                <p className={styles.profileUsername}>
                  @{profile.userId.username}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
