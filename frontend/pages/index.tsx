// import Head from 'next/head';
// import styles from '../styles/Home.module.css';
// import React, { useState } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";

// export default function Home() {
//   const router = useRouter();
  
//   const redirectToRegister = () => {
//     router.push("/register");
//   };
  
//   const redirectToLogin = () => {
//     router.push("/login");
//   };

//   return (
//     <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
//       <h2>Welcom to Our E-Learning Platform</h2>
//         <div style={{ marginBottom: "1rem" }}>
//           <label htmlFor="haveAccount">Do not have an account?</label>
//           <button
//           type="button"
//           onClick={redirectToRegister}
//           style={{
//             backgroundColor: "#0070f3",
//             color: "white",
//             padding: "10px",
//             width: "100%",
//             border: "none",
//             cursor: "pointer",
//             fontSize: "1rem",
//             borderRadius: "5px",
//             marginBottom: "1rem"
//           }}
//         >
//           Register
//         </button>
//         </div>

//         <div style={{ marginBottom: "1rem" }}>
//           <label htmlFor="haveAccount">Already have an account?</label>
//           <button
//           type="button"
//           onClick={redirectToLogin}
//           style={{
//             backgroundColor: "#0070f3",
//             color: "white",
//             padding: "10px",
//             width: "100%",
//             border: "none",
//             cursor: "pointer",
//             fontSize: "1rem",
//             borderRadius: "5px",
//             marginBottom: "1rem"
//           }}
//         >
//           Login
//         </button>
//         </div>

//     </div>
//   );
// }
