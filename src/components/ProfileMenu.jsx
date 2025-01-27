import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import defaultAvatar from "../assets/images/defaultAvatar.png";
import { classNames } from "../utils/classNames.js";
import labels from "../configs/Label";
import { auth } from "../configs/firebase/index.js";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { getDocById } from "../utils/firestore";

export default function ProfileMenu() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const data = await getDocById("users", user.uid);
      setUserData(data);
      setTimeout(() => {
        setLoading(false);
      }, 250);
    } catch (error) {
      setLoading(false);
      toast.error(error);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  const options = [
    {
      id: 1,
      title: "Logout",
    },
  ];
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        toast.success(labels.logoutSuccess);
        window.location.href = "/";
      })
      .catch((error) => toast.error("Logout Failed!", error));
  };
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center gap-x-2">
        {loading ? (
          <div className="bg-c_F1F1F1 rounded-lg animate-pulse h-4 w-12"></div>
        ) : (
          <p className={`font-generalSansMedium text-base text-c_121516`}>
            {userData?.fullName}
          </p>
        )}
        <Menu.Button className="flex items-center rounded-full p-0.5 focus:outline-none">
          <span className="sr-only">Open options</span>
          {
            <img
              src={defaultAvatar}
              alt="profileImage"
              className="w-10 h-10 rounded-full object-cover"
            />
          }
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-xl bg-c_F1F1F1 text-c_000 shadow-md focus:outline-none">
          <div className="">
            {options.map((option, index) => (
              <Menu.Item key={`option-${index}`}>
                {({ active }) => (
                  <React.Fragment>
                    <a
                      onClick={handleSignOut}
                      className={classNames(
                        active
                          ? "text-c_000"
                          : "text-c_C9C9C9 hover:text-c_BB9847",
                        "block px-4 py-3.5 text-base font-generalSansRegular cursor-pointer"
                      )}
                    >
                      {option.title}
                    </a>
                    {options.length - 1 === index ? null : (
                      <div className="border-b border-c_ffffff17 mx-2" />
                    )}
                  </React.Fragment>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
