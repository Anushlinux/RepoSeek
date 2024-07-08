import React from 'react'
const Callback = () => {

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        fetch("http://localhost:5173/api/github/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })
          .then((response) => {
            console.log("Raw response:", response);
            return response.text(); // Use .text() instead of .json()
          })
          .then((text) => {
            console.log("Response text:", text);
            if (text) {
              return JSON.parse(text);
            } else {
              throw new Error("Empty response");
            }
          })
          .then((data) => {
            console.log("Parsed data:", data);
            // Handle the user data
          })
          .catch((error) => {
            console.error("Error:", error);
          });
    }

  return (
    <div>
        {code}
    </div>
  )
}

 
export default Callback