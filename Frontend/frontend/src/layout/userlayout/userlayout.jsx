import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import styles from "./userLayout.module.css";
import { reset } from "@/config/redux/reducer/authReducer";
import { useEffect } from "react";
import { getUserAndProfile } from "@/config/redux/action/authAction";

export const metadata = {
  title: "My App",
  description: "Best social media app",
};

export default function Layout({ children }) {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getUserAndProfile({ token: token }));
    }
  }, [dispatch]);

  return (
    <>
      
      <header className={styles.header}>
        <div className={styles.container}>
          
          <div
            className={styles.leftContainer}
            onClick={() => router.push("/")}
          >
            <h1 className={styles.logo}>Pro Connect</h1>
          </div>

          
          <div className={styles.rightContainer}>
            {authState.profileFetched ? (
              <div className={styles.profileWrapper}>
                <div
                  className={styles.userInfo}
                  onClick={() => router.push("/view_profile")}
                >
                  <p className={styles.welcomeText}>Welcome</p>
                  <h4 className={styles.username}>
                    {authState.user.userId.name}
                  </h4>
                </div>
                <button
                  className={styles.logoutBtn}
                  onClick={() => {
                    localStorage.removeItem("token");
                    dispatch(reset());
                    router.push("/");
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                className={styles.authBtn}
                onClick={() => router.push("/login")}
              >
                Be a part
              </button>
            )}
          </div>
        </div>
      </header>

      
      <main className={styles.main}>{children}</main>

      
      <footer className={styles.footer}>© 2025 My App</footer>
    </>
  );
}
