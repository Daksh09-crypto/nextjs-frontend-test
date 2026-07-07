"use client";

import { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import Loading from "@/components/loading";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Real database metrics loaded from our new endpoint
  const [vaultCount, setVaultCount] = useState(0);
  const [user, setUser] = useState({
    name: "Loading...",
    email: "...",
    dailyTarget: 5,
    theme: "dark"
  });

  // 1. Fetch live user profile and vault metrics on mount
  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          toast.error("Session invalid. Please sign in again. 🔒");
          return;
        }

        if (data.success) {
          setUser({
            name: data.profile.name,
            email: data.profile.email,
            dailyTarget: data.profile.dailyTarget,
            theme: data.profile.theme || "dark"
          });
          setVaultCount(data.profile.vaultCount || 0);
        } else {
          toast.error(data.message || "Failed to parse account settings.");
        }
      } catch (err) {
        toast.error("Network error reading your account properties.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  // 2. Persist updated configuration data to MongoDB
  async function saveProfileSettings(e) {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          dailyTarget: user.dailyTarget,
          theme: user.theme
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Profile tracking limits saved! ⭐");
      } else {
        toast.error(data.message || "Failed to update target details.");
      }
    } catch (err) {
      toast.error("Network error sync pipeline timed out.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleTargetChange = (e) => {
    setUser({ ...user, dailyTarget: parseInt(e.target.value) || 0 });
  };

  // Safe progressive limits checking logic mapped out of 50 total possible items
  const maxLimit = 50;
  const progressPercentage = Math.min((vaultCount / maxLimit) * 100, 100);

  if (isLoading) return <Loading />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>👤 Account Settings</h1>
      <p className={styles.subtitle}>Manage your profile details and preferences</p>

      <div className={styles.profileLayoutGrid}>
        
        {/* ================= LEFT SIDE ================= */}
        <div className={styles.profileSideColumn}>
          {/* Card 1: Live User Identity Summary */}
          <div className={styles.profileBox}>
            <div className={styles.avatarCircle}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            {/* Input allowing the user to rename themselves */}
            <input 
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className={styles.settingInput}
              style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "4px", width: "100%" }}
            />
            <p className={styles.profileEmail}>{user.email}</p>
          </div>

          {/* Card 2: App Interface Customization */}
          <div className={styles.profileBox}>
            <h3>🎨 App Preferences</h3>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>Interface Theme</span>
                <p className={styles.settingDesc}>Change your layout look.</p>
              </div>
              <select 
                className={styles.settingSelect} 
                value={user.theme}
                onChange={(e) => setUser({ ...user, theme: e.target.value })}
              >
                <option value="dark">Deep Charcoal</option>
                <option value="light">Crisp White</option>
                <option value="amoled">Pure Black</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className={styles.profileSideColumn}>
          {/* Card 3: Real-time Goal Tracker (Fixed Max Parameter out of 50) */}
          <div className={styles.profileBox}>
            <h3>📊 Vault Capacity Progress</h3>
            <p className={styles.settingDesc}>
              Saved <strong>{vaultCount}</strong> of <strong>{maxLimit}</strong> maximum allowed vault storage slots.
            </p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className={styles.progressPercentText}>
              {Math.round(progressPercentage)}% vault slots filled
            </span>
          </div>

         

            {/* Action Save Button Triggers Database POST Synchronization */}
            <button disabled
              onClick={saveProfileSettings} 
              //disabled={isSaving} 
              className={styles.saveBtn}
              style={{ width: "100%", padding: "10px", fontWeight: "bold" }}
            >
              {isSaving ? "Saving Settings..." : "💾 Save Changes"}
            </button>
          </div>
        </div>

      </div>
    
  );
}