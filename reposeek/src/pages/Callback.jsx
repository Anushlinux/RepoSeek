import { useEffect } from "react";
import axios from "axios";

function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      axios
        .post("http://localhost:8000/auth/github/callback", {
          code,
        })
        .then((response) => {
          console.log(response.data);
          localStorage.setItem("github-code", response.data.accessToken);
          window.location.href = "/home";
          console.log("code", response.data.accessToken);
        })
        .catch((error) => {
          console.error("Error getting starred repos:", error);
        });
    }
  }, []);

  return <div>Processing GitHub login...</div>;
}

export default Callback;
