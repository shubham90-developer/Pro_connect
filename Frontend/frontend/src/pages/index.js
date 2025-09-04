import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import React from "react";
import Layout from "@/layout/userlayout/userlayout";

export default function Home() {
  const router = useRouter();
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.leftContainer}>
          <h2 className={styles.mainHeading}>
            Connect with friends without exaggeration
          </h2>
          <h3 className={styles.subHeading}>
            A true social media platform, with stories — no bluffs!
          </h3>
          <div
            className={styles.loginWrapper}
            onClick={() => {
              router.push("/login");
            }}
          >
            <button className={styles.loginButton}>Login</button>
          </div>
        </div>

        <div className={styles.rightContainer}>
          <img src="/connect.png" alt="connect" className={styles.heroImage} />
        </div>
      </div>
    </Layout>
  );
}
