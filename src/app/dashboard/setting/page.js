"use client";
import { useState } from "react";
import styles from "../dashboard.module.css";
import { SessionEnd } from "@/components/logout";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function SettingsPage() {
  const [loading,setLoading]=useState(false)
const router=useRouter()
async  function logout() {
  
   const move=confirm("want to ending your session!")
    if(move){
      try{
       setLoading(true)
  const res=  await fetch("/api/logout",{
      method:"POST"
    }) ;
    const result= await res.json() ;
    if(result.success){
      toast.success(result.message );
    router.refresh()  
      router.push("/login");
    }else{
      toast.error(result.message);
    }
  }catch{
    toast.error("network issue ! try later .")
  }finally{
    setLoading(false)
  }
  } 
}

 async function resetData() {
    try{
     const response= await fetch("/api/logout",{
           method:"DELETE" 
      });
      const reply=await response.json();
      if(reply.success){
        toast.success(reply.message);
      }
      if(!reply.success){
        toast.error(reply.message);
      }
    }catch(error){
      toast.error("something went wrong")
    }
  }

  return (
    <div className={styles.page}>
      {loading && <SessionEnd/>}
      <div>
      <h1 className={styles.title}>⚙️ Settings</h1>
      <p className={styles.subtitle}>
        Manage your learning experience
      </p>

      {/* SETTINGS CARDS */}
      <div className={styles.settingsGrid}>
        <div className={styles.settingCard}>
          <h2>🎨 Theme</h2>
          <p>Dark mode (default)</p>
          <button disabled>Coming soon</button>
        </div>

        <div className={styles.settingCard}>
          <h2>🧹 Reset Data</h2>
          <p>Clear saved words and progress</p>
          <button onClick={resetData}>Reset</button>
        </div>

        <div className={styles.settingCard}>
          <h2>🚪 Logout</h2>
          <p>End your session</p>
          <button onClick={logout} disabled={loading}>Logout</button>
        </div>
      </div>
      </div>
    </div>
  );
}