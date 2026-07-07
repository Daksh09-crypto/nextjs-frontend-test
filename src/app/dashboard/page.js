"use client";

import styles from "./dashboard.module.css";

import { useRouter } from "next/navigation";
export default function DashboardPage() {
 
const router= useRouter();
  function change(){router.push("./dashboard/meaning")}
  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>
          Learn English <span>Smartly</span>
        </h1>
        <p>Search words, save them, and play learning games</p>
      </section>

      {/* SEARCH */}
      <section className={styles.searchBox}>
        <input  disabled
          placeholder="Search any word..."
        />
        <button  onClick={change} >Search</button>
      </section>

      {/* QUICK CARDS */}
      <section className={styles.cards}>
        <div className={styles.card}>
          <h2>📖 Meaning</h2>
          <p>Learn words instantly with examples</p>
        </div>

        <div className={styles.card}>
          <h2>📦 Vault</h2>
          <p>Save words you like</p>
        </div>

        <div className={styles.card}>
          <h2>🎮 Game</h2>
          <p>Practice with challenges</p>
        </div>

        <div className={styles.card}>
          <h2>👤 Profile</h2>
          <p>Track your progress</p>
        </div>
      </section>
    </div>
  );
}