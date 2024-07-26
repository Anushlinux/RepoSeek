import React, { useState, useEffect } from "react";
import SideBar from "../components/sidebar";
import { AuroraBackground } from "../components/aurora-bg";
import { FlipWords } from "../components/flip-words";
import { Placeholder } from "../components/placeholder";
import { motion } from "framer-motion";
import axios from "axios";
import { dotWave } from "ldrs";
// import ChatMessage from "../components/ChatMessage"; // Assuming ChatMessage is moved to a separate file

dotWave.register();

function extractRepoInfo(repos) {
  return repos.map((repo) => ({
    greetings: repo.greetings,
    name: repo.name,
    description: repo.description,
    fullName: repo.full_name,
    language: repo.language,
    url: repo.html_url,
    svn_url: repo.svn_url,
    stargazersCount: repo.stargazers_count,
    forksCounts: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
    topics: repo.topics,
    updatedAt: repo.updated_at,
    license: repo.license,
    homepage: repo.homepage,
    watchersCount: repo.watchers_count,
  }));
}

const placeholders = [
  "Tell me whatcu makin",
  "Come on, dont be shy",
  "I'm all ears",
  "I'm listening",
  "I'm ready",
  "I'm here",
  "I'm waiting",
];

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const LandingPage = ({user}) => {
  const [newRepos, setNewRepos] = useState([]);
  const [keywords, setKeywords] = useState("");
  // const [user, setUser] = useState({});
  // const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false); // State to toggle view

  const handleChange = (e) => {
    console.log(e.target.value);
    setKeywords(e.target.value);
  };

  const ChatMessage = ({ message }) => {
    const isUser = message.type === "user";

    return (
      <div className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center mr-4  flex-shrink-0">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        )}
        <div
          className={`inline-block p-4 rounded-lg max-w-[80%] ${
            isUser
              ? "bg-transparent text-white"
              : message.type === "loading"
              ? "bg-transparent text-white"
              : message.type === "error"
              ? "bg-red-600 text-white"
              : "bg-transparent text-white"
          }`}
          style={{ backdropFilter: "blur(40px)" }}
        >
          {isUser ? (
            <p className="text-lg">{message.content}</p>
          ) : message.type === "loading" ? (
            <div className="flex bg-transparent items-center">
              <l-dot-wave size="47" speed="1" color="black"></l-dot-wave>
            </div>
          ) : message.type === "error" ? (
            <p className="text-lg">{message.content}</p>
          ) : (
            <div>
              <p className="text-lg font-bold mb-4">
                {message.content[0].greetings}
              </p>
              {message.content.map((repo, index) => (
                <div
                  key={index}
                  className="mb-6 last:mb-0 border-b border-purple-400 pb-4"
                >
                  <h3 className="text-xl font-semibold mb-2">{repo.name}</h3>
                  <p className="text-lg mb-2 italic">{repo.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                    <p>
                      <span className="font-semibold">Full Name:</span>{" "}
                      {repo.fullName}
                    </p>
                    <p>
                      <span className="font-semibold">Language:</span>{" "}
                      {repo.language}
                    </p>
                    <p>
                      <span className="font-semibold">Stars:</span>{" "}
                      {repo.stargazersCount}
                    </p>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:underline block "
                    >
                      View on GitHub
                    </a>
                  </div>

                  <p className="text-base my-3">{repo.explanation}</p>
                  <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto text-sm">
                    <code>{repo.codeSnippet}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mt-3 ml-2 flex-shrink-0">
            <span className="text-white text-xs font-bold">U</span>
          </div>
        )}
      </div>
    );
  };

  const fetchResponse = async ({ keywords }) => {
    try {
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

      setChatMessages((prevMessages) => {
        const newMessages = prevMessages.filter(
          (msg) => msg.type !== "loading"
        );
        return [...newMessages, { type: "ai", content: curatedRepos }];
      });
    } catch (error) {
      console.error("Error getting starred repos:", error);
      setChatMessages((prevMessages) => {
        const newMessages = prevMessages.filter(
          (msg) => msg.type !== "loading"
        );
        return [
          ...newMessages,
          {
            type: "error",
            content: "An error occurred while processing your request.",
          },
        ];
      });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: keywords },
    ]);

    setKeywords("");

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { type: "loading", content: "Processing your request..." },
    ]);

    fetchResponse({ keywords });

    setShowChat(true); // Show chat messages when a search is made
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

  // useEffect(() => {
  //   axios
  //     .get("https://api.github.com/user", {
  //       headers: {
  //         Authorization: `token ${localStorage.getItem("github-code")}`,
  //       },
  //     })
  //     .then((response) => {
  //       setUser(response.data);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error getting user data:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  // if (isLoading) {
  //   return <div className="bg-black"></div>;
  // }

  return (
    <div className="min-h-screen relative lg:pl-72">
      <AuroraBackground className="absolute inset-0 z-0" />
      <div className="relative z-10 flex flex-col min-h-screen justify-between px-20">
        {!showChat && (
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex flex-col gap-4 pt-20"
          >
            <div className="lg:mx-14">
              <div className="text-5xl sm:text-7xl md:text-6xl font-semibold dark:text-neutral-200 text-start">
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
                <span className="font-serif"> cookin </span>
                today?
              </div>
              <FlipWords
                className="font-extralight text-4xl -ml-2 md:text-4xl dark:text-neutral-200"
                words={placeholders}
              />
            </div>
          </motion.div>
        )}

        <div
          className="flex-grow px-16"
          style={{ maxHeight: "72vh", maxWidth: "100%", overflow: "auto" }}
        >
          {showChat &&
            chatMessages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
        </div>

        <div
          className="flex-grow flex flex-col mt-5 mb-10 justify-end items-center"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
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

export default function App() {
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
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="bg-black"></div>;
  }

  return (
    <div>
      <SideBar user={user} />
      <LandingPage user={user} />
    </div>
  );
}
