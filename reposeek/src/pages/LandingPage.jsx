import SideBar from "../components/sidebar";
import { useOutlet } from "react-router-dom";
import { AuroraBackground } from "../components/aurora-bg";
import { FlipWords } from "../components/flip-words";
import { Placeholder } from "../components/placeholder";
import { motion } from "framer-motion";

import { useEffect  } from "react";
import axios from "axios";
import React, { useState } from "react";
function extractRepoInfo(repos) {
  return repos.map((repo) => ({
    name: repo.name,

    description: repo.description,

    fullName: repo.full_name,

    language: repo.language,

    url: repo.html_url,

    stargazersCount: repo.stargazers_count,
  }));
}

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const Main = ({ user }) => {
  const words = [
    "website",
    "lib",
    "model",
    "service",
    "app",
    "api",
    "server",
    "client",
    "database",
    "framework",
    "library",
    "tool",
    "platform",
    "system",
    "interface",
    "network",
    "protocol",
    "algorithm",
    "data",
    "object",
    "function",
    "variable",
    "constant",
    "class",
    "module",
  ];
  const placeholders = [
    "Tell me whatcu makin",
    "Come on, dont be shy",
    "I'm all ears",
    "I'm listening",
    "I'm ready",
    "I'm here",
    "I'm waiting",
  ];
  const [newRepos, setNewRepos] = useState([]);
  const [keywords , setkeywords] = useState("");
const handleChange = (e) => {
  console.log(e.target.value);
  setkeywords(e.target.value);
};
const fetchResponse = async ({keywords}) => {
  try{
    const geminiResponse = await axios.post(
      "http://localhost:5000/gemini",
      {
        text: newRepos,
        keywords: keywords,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    const curatedRepos = geminiResponse.data.curated_repos;
    console.log(JSON.stringify(curatedRepos));
  }catch (error) {
    console.error("Error getting starred repos:", error);
  }
}
const onSubmit = (e) => {
  e.preventDefault();
  console.log("submitted");
  fetchResponse({keywords});
};

  useEffect(() => {
    const accessToken = getCookie("accessToken");
    console.log(accessToken);
    if (!accessToken) {
      window.location.href = "/login";
    }
    const fetchData = async () => {
      try {
        const githubResponse = await axios.get(
          "https://api.github.com/user/starred",
          {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          }
        );
        const newRepos = extractRepoInfo(githubResponse.data);
        setNewRepos(newRepos);
        console.log(JSON.stringify(newRepos));

        
        
      } catch (error) {
        console.error("Error getting starred repos:", error);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen relative lg:pl-72">
      <AuroraBackground className="absolute inset-0 z-0" />
      <div className="relative z-10 flex  flex-col min-h-screen justify-between px-20">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col gap-4 pt-20 "
        >
          <div className=" lg:mx-14 ">
            <div className="text-5xl sm:text-7xl  md:text-6xl font-semibold dark:text-neutral-200 text-start">
              hello,{" "}
              <span
                style={{
                  background: "linear-gradient(to right, red, darkgrey)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {user.name.toLowerCase()}
              </span>
            </div>
            <div className="font-extralight text-4xl md:text-4xl dark:text-neutral-200 py-4">
              what you
              <span className="font-serif "> cookin </span>
              today?
            </div>
            <FlipWords
              className="font-extralight text-4xl -ml-2  md:text-4xl dark:text-neutral-200"
              words={words}
            />
          </div>
        </motion.div>

        <div className="flex-grow flex flex-col justify-end mb-16 items-center">
          <Placeholder
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${localStorage.getItem("github-code")}`,
        },
      })
      .then((response) => {
        setUser(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error getting user data:", error);
        setIsLoading(false); // even if there's an error, stop loading
      });
  }, []);

  if (isLoading) {
    return <div className="bg-black"></div>;
  }

  return (
    <div>
      <SideBar user={user} />
      
      <Main user={user} />
      
    </div>
  );
}
