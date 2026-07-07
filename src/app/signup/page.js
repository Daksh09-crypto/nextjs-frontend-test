"use client";
import Loading from "../../components/loading";
import styles from "./signup.module.css";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function SignupPage() {
  const [loading,setLoading]=useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
 const router=useRouter();
  function handleChange(e) {
    setForm((prev)=> ({...prev,[e.target.name]:e.target.value}) );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
   try{ const response=await fetch("/api/signup",{
      method:"POST",
      body: JSON.stringify(form),
      headers:{ "content-type":"application/json"}
    });
    const result=await response.json();
    if(result.success){
        toast.success(result.message);
        router.refresh();
      router.push("/dashboard");
    } 
   if(!result.success){
    toast.error(result.message);
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
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join us and start your journey</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            name="name"
            required
            placeholder="Full Name"
            max={12}
            value={form.name}
            onChange={handleChange}
          />
      
          <input
            className={styles.input}
            type="email"
            name="email"
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
            max={12}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button className={styles.button} type="submit" disabled={loading}>
            Sign Up
          </button>
        </form>

       <p className={styles.footerText}>
  Already have an account?{" "}
  <Link href="/login" className={styles.link} disabled={loading}>
    Login
  </Link>
</p>
      </div> 
    </div>
  );
}