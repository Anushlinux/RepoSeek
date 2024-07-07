import SideBar from '../components/sidebar'
import { useOutlet } from "react-router-dom";
import { AuroraBackground } from "../components/aurora-bg";
import { FlipWords } from "../components/flip-words";
import { Placeholder } from "../components/placeholder";
import { motion } from "framer-motion";


const Main = () => {

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
    const handleChange = (e) => {
      console.log(e.target.value);
    };
    const onSubmit = (e) => {
      e.preventDefault();
      console.log("submitted");
    };

    return (
      <div className="min-h-screen relative lg:pl-72">
        <AuroraBackground className="absolute inset-0 z-0" />
        <div className="relative z-10 flex flex-col min-h-screen justify-between px-20">
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
            <div className="mx-14">
              <div className="text-lg sm:text-5xl  md:text-7xl font-semibold dark:text-white text-start">
                Hello,
                <span
                  style={{
                    background: "linear-gradient(to right, red, darkgrey)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  user
                </span>
              </div>
              <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
                what you
                <span className="font-serif"> cookin </span>
                today?
              </div>
              <FlipWords
                className="font-extralight text-base -ml-1.5  md:text-4xl dark:text-neutral-200"
                words={words}
              />
            </div>
          </motion.div>

          <div className="flex-grow flex flex-col justify-end mb-16 items-center">
            {/* <h2 className="mb-10 text-xl text-center sm:text-5xl dark:text-white text-black">
                Ask Aceternity UI Anything
              </h2> */}
            <Placeholder
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    );
}

export default function LandingPage() {
  return (
    <div>
      <Main />
      <SideBar />
    </div>
  );
}