import { useState } from "react";
// import { motion } from "framer-motion";
import React from "react";
// import { AuroraBackground } from "../components/aurora-bg";
// import { FlipWords } from "../components/flip-words";
// import { Placeholder } from "../components/placeholder";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { MultiStepLoader as Loader } from "../components/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const teams = [
  { id: 1, name: "Session - 1", href: "#", initial: "1", current: false },
  { id: 2, name: "Session - 2", href: "#", initial: "2", current: false },
  { id: 3, name: "Session - 3", href: "#", initial: "3", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const loadingStates = [
  {
    text: "Sudden urge to make a project",
  },
  {
    text: "gets an idea",
  },
  {
    text: "creates a repo",
  },
  {
    text: "npm create",
  },
  {
    text: "initial enthusiasm",
  },
  {
    text: "fuck now what?",
  },
  {
    text: "Welcome to reposeek",
  },
];

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div>
        <Transition show={sidebarOpen}>
          <Dialog className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <TransitionChild
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </TransitionChild>

            <div className="fixed inset-0 flex">
              <TransitionChild
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <TransitionChild
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </TransitionChild>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto border-1 px-6 pb-2 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <div className="text-xs font-semibold mt-12 leading-6 text-gray-400">
                            Your sessions
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? "bg-gray-800 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                    {team.initial}
                                  </span>
                                  <span className="truncate">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        {/* Static sidebar for desktop */}
        <div className="hidden border-r border-dashed border-gray-400  lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 bg-transparent overflow-y-auto px-6">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                alt="Your Company"
              />
            </div>

            <nav className="flex flex-1 mt-12 flex-col">
              <ul role="list" className="flex flex-1 flex-col ">
                <li className="">
                  <div className=" w-full border-b border-white border-dashed"></div>
                  <div className="text-xl my-4 mx-4 font-semibold leading-6 mt-6 text-gray-400">
                    Your sessions
                  </div>
                  <ul role="list" className="mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-800",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="mt-auto">
                  <div className="flex justify-baseline ">
                    {/* Core Loader Modal */}
                    <Loader
                      loadingStates={loadingStates}
                      loading={loading}
                      duration={2000}
                    />

                    {/* The buttons are for demo only, remove it in your actual code ⬇️ */}
                    <button
                        onClick={() => setLoading(true)}
                        className="bg-transparent hover:bg-[grey]/60 text-white hover:text-black mx-auto text-sm md:text-base transition font-medium duration-200 h-10 mb-10 rounded-lg px-8 cursor-pointer"
                        style={{
                            boxShadow:
                                "0px -1px 0px 0px #ffffff40 inset, 0px 1px 0px 0px #ffffff40 inset",
                        }}
                    >
                        why am i here?
                    </button>

                    {loading && (
                      <button
                        className="fixed top-4 right-4 text-black dark:text-white z-[120]"
                        onClick={() => setLoading(false)}
                      >
                        <IconSquareRoundedX className="h-10 w-10" />
                      </button>
                    )}
                  </div>
                  <div className="my-1  mt-auto border-b border-dashed"></div>
                  <a
                    href="#"
                    className="flex items-center -mx-6 gap-x-4 px-12 py-10 text-sm font-semibold leading-6 text-white hover:bg-gray-900"
                  >
                    <img
                      className="h-16 rounded-lg w-16 bg-gray-800"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true" className="px-4  text-lg">
                      Tom Cook
                    </span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            ASDASD
          </div>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <img
              className="h-8 w-8 rounded-full bg-gray-800"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </a>
        </div>

        {/* <main className="min-h-screen relative lg:pl-72">
          
        </main> */}
      </div>
    </div>
  );
}
