import { express } from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const CLIENT_ID = "Ov23lil8Z6B45d2ZRNnLL";
const CLIENT_SECRET = "1e67f44fccc9c720d5cf5490c32222202cdda815";

app.post("/api/github/callback", async (req, res) => {
  const { code } = req.body;

  // Exchange code for access token
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
  const accessToken = tokenData.access_token;

  if (accessToken) {
    const stars = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    const data = await stars.json();
    res.json({ success: true, data });
  } else {
    res.json({ success: false });
  }
});

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});




