import React from 'react'



const Callback = () => {

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        fetch('http://localhost:5173/api/github/callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('User data', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

  return (
    <div>
        {code}
    </div>
  )
}

 

export default Callback