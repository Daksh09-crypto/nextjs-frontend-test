"use client";
import styles from "./login.module.css";
import { useState } from "react";
import Link from "next/link";
import Loading from "@/components/loading";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [loading,setLoading]=useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
const router=useRouter()
  function handleChange(e) {
    setForm(prev=>({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();   
    try{
      setLoading(true);
//data handling .
      const response=await fetch("/api/login",{
       method:"POST",
       body:JSON.stringify(form),
       headers:{
        "content-type":"application/json"
       }
      }) ;

      const result=await response.json();
      if(result.success){
        toast.success(result.message);
        router.refresh()
      router.push("/dashboard");
      }
      if(!result.success){
        toast.error(result.message)
      }
    }catch(err){
      toast.error("network error! unkown issue ,please try later ")
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className={styles.wrapper}>
      {loading && <Loading/>} 
            <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Login to continue</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="email"
            type="email"
            required
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />
     
          <input
            className={styles.input}
            type="password"
            name="password" 
            required
            placeholder="Password"
            max={12}
            value={form.password}
            onChange={handleChange}
          />
          <button className={styles.button} type="submit" disabled={loading}>
            Login
          </button>
        </form>     

        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <Link href="/signup" className={styles.link} disabled={loading}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}