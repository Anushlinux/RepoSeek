// import { express } from "express";
// import fetch from "node-fetch";
// import bodyParser from "body-parser";

// const app = express();
// app.use(bodyParser.json());

// const CLIENT_ID = "Ov23lis3taWzpmsGOWBL";
// const CLIENT_SECRET = "8f819671c83ec276a2eece1b7807f264ef6323e8";

// app.post("/auth/github/callback/starred", async (req, res) => {
//   const { code } = req.body;

//   // Exchange code for access token
//   const tokenResponse = await fetch(
//     "https://github.com/login/oauth/access_token",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify({
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET,
//         code,
//       }),
//     }
//   );

//   const tokenData = await tokenResponse.json();
//   const accessToken = tokenData.access_token;

//   if (accessToken) {
//     const stars = await fetch("https://api.github.com/user/starred", {
//       headers: {
//         Authorization: `token ${accessToken}`,
//       },
//     });
//     const data = await stars.json();
//     res.json({ success: true, data });
//   } else {
//     res.json({ success: false });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server started on http://localhost:${PORT}`);
// });




