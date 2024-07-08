import React, { useEffect, useState } from "react";

const Callback = () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        console.log(code);
    }

  return (
    <div>
        {code}
    </div>
  )
}

 

export default Callback;
