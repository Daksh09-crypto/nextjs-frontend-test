export default function Loading() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        
        {/* Rocket */}
        <div style={styles.rocket}>🚀</div>
 
        {/* Text */}
        <h2 style={styles.title}>Hang tight!</h2>
        <p style={styles.subtitle}>We’re preparing something awesome...</p>

        {/* Progress Bar */}
        <div style={styles.bar}>
          <div style={styles.progress}></div>
        </div>

        <p style={styles.loadingText}>Loading...</p>
      </div>
    </div>
  ); 
}

const styles = {
  wrapper: {
    position: "fixed",      // Keeps it locked onto the full viewport layer
    top: 0,
    left: 0,
    zIndex: 9999,          // Keeps it layered over your dashboards, navigation, or sidebars
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at top, #1d0f2a7c, #18032056)",
    color: "white",
  },

  card: {
    width: "340px",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 0 40px rgba(99,102,241,0.3)",
  },

  rocket: {
    fontSize: "50px",
    animation: "float 2s ease-in-out infinite",
  },

  title: {
    marginTop: "10px",
    fontSize: "22px",
  },

  subtitle: {
    fontSize: "13px",
    opacity: 0.7,
  },

  bar: {
    height: "8px",
    background: "#1f2937",
    borderRadius: "10px",
    marginTop: "20px",
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    width: "60%",
    background: "linear-gradient(90deg, #6366f1, #a855f7)",
    animation: "load 2s infinite",
  },

  loadingText: {
    marginTop: "10px",
    fontSize: "12px",
    opacity: 0.6,
  },
};