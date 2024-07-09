import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Endpoint to handle GitHub OAuth callback
app.post("/auth/github/callback", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {},
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          redirect_uri: "http://localhost:5173/api/github/callback",
        },
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "application/json",
        },
      }
    );

    const accessToken = response.data.access_token;

    if (accessToken) {
      res.json({ success: true, accessToken });
    } else {
      res.json({ success: false, error: response.data.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to fetch starred repos
app.post("/auth/github/starred", async (req, res) => {
  const { accessToken } = req.body;

  try {
    const starsResponse = await axios.get(
      "https://api.github.com/user/starred",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = starsResponse.data;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
