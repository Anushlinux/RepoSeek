import { useEffect, useState } from "react";
import axios from "axios";
const setCookie = (name, value, hours) => {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
};
function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      axios
        .post("http://localhost:5000/api/data", {
          code,
        })
        .then((response) => {
          console.log(response.data);
          const params = new URLSearchParams(response.data);
          const accessToken = params.get("access_token");
          console.log(accessToken);
          setCookie("accessToken", accessToken, 5);
          if (accessToken) {
            window.location.href = "/home";
          }
        })
        .catch((error) => {
          console.error("Error getting starred repos:", error);
        });
    }
  }, []);

  return <div>Processing GitHub login...</div>;
}

export default Callback;
