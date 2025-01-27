import { Fragment, useState, memo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "../utils/classNames";
import HomePageIcon from "../assets/images/HomeIcon.jsx";
import StoreIcon from "../assets/images/StoreIcon.jsx";
import SpecialStarIcon from "../assets/images/SpecialStarIcon.jsx";
import NotificationIcon from "../assets/images/NotificationIcon.jsx";
import FeedBackIcon from "../assets/images/FeedbackIcon.jsx";
import logo from "../assets/images/logo.png";
import ProfileMenu from "./ProfileMenu.jsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", current: true },
  { name: "Specials", href: "/special", current: false },
  { name: "Notifications", href: "/notification", current: false },
  { name: "Feedback", href: "/feedback", current: false },
  { name: "Store", href: "/store", current: false },
];

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCheckNavigationCondition = (href) => {
    if (window.location.pathname === href) {
      return true;
    }
  };

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-c_121516/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
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
                  </Transition.Child>
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-c_F9F9F9 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center my-4">
                      <img
                        className="h-16 w-16"
                        src={logo}
                        alt="Calimero-Pizza"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className={classNames(
                                    handleCheckNavigationCondition(item.href)
                                      ? "flex items-center bg-c_BB9847 text-c_fff bg-c_ED3237"
                                      : "flex items-center text-c_454545",
                                    "group flex gap-x-3 mb-4 py-3 px-5 text-base leading-6 font-generalSansRegular rounded-[12px]"
                                  )}
                                >
                                  {item.name === "Dashboard" ? (
                                    <HomePageIcon
                                      width={16}
                                      height={16}
                                      color={
                                        item?.href === window.location.pathname
                                          ? "#fff"
                                          : "#454545"
                                      }
                                    />
                                  ) : item?.name === "Specials" ? (
                                    <SpecialStarIcon
                                      width={16}
                                      height={16}
                                      color={
                                        item?.href === window.location.pathname
                                          ? "#fff"
                                          : "#454545"
                                      }
                                    />
                                  ) : item?.name === "Notifications" ? (
                                    <NotificationIcon
                                      width={16}
                                      height={16}
                                      color={
                                        item?.href === window.location.pathname
                                          ? "#fff"
                                          : "#454545"
                                      }
                                    />
                                  ) : item?.name === "Feedback" ? (
                                    <FeedBackIcon
                                      width={16}
                                      height={16}
                                      color={
                                        item?.href === window.location.pathname
                                          ? "#fff"
                                          : "#454545"
                                      }
                                    />
                                  ) : (
                                    <StoreIcon
                                      width={16}
                                      height={16}
                                      color={
                                        item?.href === window.location.pathname
                                          ? "#fff"
                                          : "#454545"
                                      }
                                    />
                                  )}
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="hidden lg:fixed lg:inset-y-0 lg:z-5 lg:flex lg:w-80 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-c_F9F9F9 px-10 pb-4">
            <div className="flex h-auto my-4 shrink-0 items-center">
              <img className="w-40 h-24" src={logo} alt="Calimero-Pizza" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            handleCheckNavigationCondition(item.href)
                              ? "flex items-center bg-c_BB9847 text-c_fff bg-c_ED3237"
                              : "flex items-center text-c_454545",
                            "group flex gap-x-3 mb-4 py-3 px-5 text-base leading-6 font-generalSansRegular rounded-[12px]"
                          )}
                        >
                          {item.name === "Dashboard" ? (
                            <HomePageIcon
                              width={16}
                              height={16}
                              color={
                                item?.href === window.location.pathname
                                  ? "#fff"
                                  : "#454545"
                              }
                            />
                          ) : item?.name === "Specials" ? (
                            <SpecialStarIcon
                              width={16}
                              height={16}
                              color={
                                item?.href === window.location.pathname
                                  ? "#fff"
                                  : "#454545"
                              }
                            />
                          ) : item?.name === "Notifications" ? (
                            <NotificationIcon
                              width={16}
                              height={16}
                              color={
                                item?.href === window.location.pathname
                                  ? "#fff"
                                  : "#454545"
                              }
                            />
                          ) : item?.name === "Feedback" ? (
                            <FeedBackIcon
                              width={16}
                              height={16}
                              color={
                                item?.href === window.location.pathname
                                  ? "#fff"
                                  : "#454545"
                              }
                            />
                          ) : (
                            <StoreIcon
                              width={16}
                              height={16}
                              color={
                                item?.href === window.location.pathname
                                  ? "#fff"
                                  : "#454545"
                              }
                            />
                          )}
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-80">
          <div className="relative bg-c_F9F9F9 flex h-24 shrink-0 items-center gap-x-4 border-b-[2px] border-c_F3F3F3 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="w-full flex items-center flex-row-reverse justify-between md:justify-start">
              <div className="flex items-center md:ml-auto">
                <ProfileMenu />
              </div>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-c_0E1014 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="py-10 overflow-x-hidden min-h-screen">
            <div className="px-4 sm:px-6 lg:px-8 pb-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
