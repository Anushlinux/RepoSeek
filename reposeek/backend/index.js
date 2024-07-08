import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const CLIENT_ID = "Ov23lil8Z6B45d2ZRNnLL";
const CLIENT_SECRET = "1e67f44fccc9c720d5cf5490c32222202cdda815";

app.post("/api/github/callback", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { code } = req.body;

    console.log("Exchanging code for access token");
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    console.log("Token response:", tokenData);

    const accessToken = tokenData.access_token;

    if (accessToken) {
      console.log("Fetching user data");
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = await userResponse.json();
      console.log("User data:", userData);
      res.json({ success: true, data: userData });
    } else {
      console.log("Failed to obtain access token");
      res.json({ success: false, error: "Failed to obtain access token" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
