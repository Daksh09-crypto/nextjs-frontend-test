"use client";

import { useState } from "react";
import { useEffect } from "react";
export default function ErrorBox({
  title ,
  message ,
  state,
  onClose
}) {
  const [visible, setVisible] = useState(false);
     useEffect(() => {
    if (state) {
      setVisible(true)
    }
  }, );
  return (
     <div style={{ display: visible ? "block" : "none" }}>
    <div style={styles.overlay} >
      <div style={styles.box}>
        <div style={styles.icon}>⚠️</div>

        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>

        <button style={styles.button} onClick={onClose}>
          OK
        </button>
      </div>
    </div>  
    </div>
  );
} 
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(6px)",
    zIndex: 9999,
  },

  box: {
    width: "320px",
    padding: "24px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    animation: "pop 0.25s ease",
  },

  icon: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  title: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "600",
  },

  message: {
    fontSize: "14px",
    opacity: 0.85,
    margin: "10px 0 20px",
  },

  button: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#ff4d4d",
    color: "white",
    fontWeight: "500",
  },
};