import styles from "./landing.module.css";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className={styles.wrapper}>
      {/* NAV */}
      <header className={styles.nav}>
        <div className={styles.logo}>LexiLearn</div>

        <div className={styles.navLinks}>
          <Link href="/login" className={styles.link}>
            Login
          </Link>
          <Link href="/signup" className={styles.primaryLink}>
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Master English with <span>Smart Practice</span>
        </h1>

        <p className={styles.subtitle}>
          Learn meanings instantly, improve vocabulary, and play word-based
          challenges that train your brain daily.
        </p>

        <div className={styles.cta}>
          <Link href="/dashboard" className={styles.buttonPrimary}>
            Start Learning
          </Link>

          <Link href="/login" className={styles.buttonSecondary}>
            I Already Have an Account
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.card}>
          <h2>📖 Instant Word Meaning</h2>
          <p>
            Type any word and get clear meanings, examples, and usage in real
            sentences.
          </p>
        </div>

        <div className={styles.card}>
          <h2>🎮 Word Challenge Game</h2>
          <p>
            Play interactive sentence-based games that improve your vocabulary
            naturally.
          </p>
        </div>

        <div className={styles.card}>
          <h2>🚀 Daily Improvement</h2>
          <p>
            Track progress and improve your English step-by-step with smart
            practice sessions.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        Built for learners who want practical English, not theory.
      </footer>
    </main>
  );
}