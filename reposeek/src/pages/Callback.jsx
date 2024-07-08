import React, { useEffect, useState } from "react";

const Callback = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch("http://localhost:5173/api/github/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("Received data:", data);
          // Handle the data
        })
        .catch((error) => console.error("Error:", error));
    }
  }, []);

 
};

export default Callback;
