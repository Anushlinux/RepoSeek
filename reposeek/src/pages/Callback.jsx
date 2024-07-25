import { useEffect } from "react";
import axios from "axios";

const setCookie = (name, value, hours) => {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
};

function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log(`Authorization code: ${code}`);

    if (code) {
      axios
        .post("http://localhost:5000/api/data", { code })
        .then((response) => {
          console.log(response.data);
          const accessToken = response.data.access_token;
          localStorage.setItem("github-code", accessToken);
          console.log(accessToken);
          // Use your setCookie function here
          setCookie("accessToken", accessToken, 5);
          if (accessToken) {
            window.location.href = "/home";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
        });
    }
  }, []);

  return <div>Processing GitHub login...</div>;
}

export default Callback;
