// import React, { useEffect, useState } from "react";

// const Callback = () => {
    
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get("code");

//     if (code) {
      
//       fetch("/api/github/callback", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ code }),
//       })
//         .then((response) => response.text())
//         .then((data) => {
//           // Handle the user data received from your backend
//           console.log("User data:", data);
//           // Update your UI or store the user info as needed
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//         });
//     }

//   return (
//     <div>
//         {code}
//     </div>
//   )
// }

 

// export default Callback;
