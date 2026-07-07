import styles from "./dashboard.module.css";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.layout}>
      {/* TOP NAV */}
      <header className={styles.nav}>
        <div className={styles.logo}>LexiLearn</div>

        <nav className={styles.menu}>
          <Link href="/dashboard">Home</Link>
          <Link href="/dashboard/meaning">Meaning</Link>
          <Link href="/dashboard/vault">Vault</Link>
          <Link href="/dashboard/game">Game</Link>
          <Link href="/dashboard/profile">Profile</Link>
          <Link href="/dashboard/setting">Settings</Link>
        </nav>

        <div className={styles.right}>
          <div className={styles.badge}>🔥 4</div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className={styles.content}>{children}</main>

         <nav className={styles.bottomNav}>
        <Link href="/dashboard">Home</Link>
        <Link href="/dashboard/meaning">Meaning</Link>
        <Link href="/dashboard/game">Game</Link>
        <Link href="/dashboard/vault">Vault</Link>
        <Link href="/dashboard/profile">Profile</Link>
      </nav>
    </div>
  );
}