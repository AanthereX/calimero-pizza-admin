import React, { useState, useEffect, useMemo } from "react";
import labels from "../configs/Label";
import DeleteIcon from "./../assets/images/DeleteIcon.jsx";
import ForwardIcon from "./../assets/images/ForwardIcon.jsx";
import ToggleButton from "../components/ToggleButton.jsx";
import TableHeader from "../components/TableHeader";
import { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";
import { Dialog, Transition } from "@headlessui/react";
import AddNewItem from "../components/AddNewItem.jsx";
import AddNewModal from "../components/AddNewModal";
import { MdArrowForward, MdArrowBack } from "react-icons/md";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  getDoc,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  updateDoc,
} from "firebase/firestore";
import { db } from "../configs/firebase/index.js";
import GridLoader from "react-spinners/GridLoader";
import DeleteModal from "../components/DeleteModal";
import { toast } from "react-toastify";
import NoSearchFound from "../components/NoSearchFound";

const Notification = () => {
  const [values, setValues] = useState({
    title: "",
    description: "",
    callToAction: "",
    status: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    callToAction: "",
    status: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingGetNotificationItem, setLoadingGetNotificationItem] =
    useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingNextNotification, setLoadingNextNotification] = useState(false);
  const [loadingPrevNotification, setLoadingPrevNotification] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [notificationItem, setNotificationItem] = useState([]);
  const [fcmTokens, setFcmTokens] = useState([]);

  const getCollectionSize = () => {
    const q = query(
      collection(db, "notification"),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (querySnapshot) => {
      const size = querySnapshot.size;
      const totalPages = Math.ceil(size / pageSize);
      setTotalPages(totalPages);
    });
  };

  const getFcmTokens = () => {
    const q = query(collection(db, "fcmTokens"));
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let fcmTokensItemArray = [];
      QuerySnapshot.forEach((doc) => {
        fcmTokensItemArray.push({ ...doc.data(), id: doc.id });
      });
      setFcmTokens(fcmTokensItemArray);
    });
    return () => unsub();
  };

  useEffect(() => {
    setLoadingGetNotificationItem(true);
    getCollectionSize();
    getFcmTokens();
    const q = query(
      collection(db, "notification"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let notificationItemArray = [];
      QuerySnapshot.forEach((doc) => {
        notificationItemArray.push({ ...doc.data(), id: doc.id });
      });
      setNotificationItem(notificationItemArray);
      setTimeout(() => {
        setLoadingGetNotificationItem(false);
      }, 250);
    });
    return () => unsub();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (search) {
      return notificationItem.filter((notification) => {
        const notificationNameMatch =
          notification.title
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          notification.description
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          notification.callToAction
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase());

        return notificationNameMatch;
      });
    }
    return notificationItem;
  }, [search, notificationItem]);

  const handleNextPage = async () => {
    if (currentPage < totalPages && notificationItem.length > 0) {
      setLoadingNextNotification(true);
      const lastItem = notificationItem[notificationItem.length - 1];
      const q = query(
        collection(db, "notification"),
        orderBy("createdAt", "desc"),
        startAfter(lastItem.createdAt),
        limit(5)
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newNotificationItems = [];
        QuerySnapshot.forEach((doc) => {
          newNotificationItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingNextNotification(false);
        }, 500);
        setNotificationItem(newNotificationItems);
        setCurrentPage((prevPage) => prevPage + 1);
      });
      return () => unsub();
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1 && notificationItem.length > 0) {
      setLoadingPrevNotification(true);
      const firstItem = notificationItem[0];
      const q = query(
        collection(db, "notification"),
        orderBy("createdAt", "desc"),
        endBefore(firstItem.createdAt),
        limitToLast(5)
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newNotificationItems = [];
        QuerySnapshot.forEach((doc) => {
          newNotificationItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingPrevNotification(false);
        }, 500);
        setNotificationItem(newNotificationItems);
        setCurrentPage((prevPage) => prevPage - 1);
      });
      return () => unsub();
    }
  };

  const handleDeleteNotification = async () => {
    try {
      setShowDeleteModal(false);
      const notificationDocRef = doc(db, "notification", selectedId);
      await deleteDoc(notificationDocRef);
      toast.success("Notification Deleted Successfully!");
    } catch (error) {
      toast.error("Delete Notification Failed!");
    }
  };

  const handleFetchData = async () => {
    setFetchingData(true);
    try {
      const docRef = doc(db, "notification", selectedId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setValues((prevState) => ({
          ...prevState,
          title: data?.title,
          description: data?.description,
          callToAction: data?.callToAction,
          status: data?.status,
        }));
        setFetchingData(false);
      } else {
        setFetchingData(false);
        toast.error("No such document!");
      }
    } catch (error) {
      setFetchingData(false);
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    if (selectedId) {
      handleFetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const updateStatus = async (id, status, title, description) => {
    const notificationDocRef = doc(db, "notification", id);
    const newStatus = { status: !status };
    await updateDoc(notificationDocRef, newStatus);
    toast.success("Status updated!");
    if (!status) {
      const data = {
        title: title.trim(),
        description: description.trim(),
        tokens: fcmTokens.length ? fcmTokens.map((item) => item?.token) : [],
      };
      await fetch("https://sendnotification-i2zydvawja-uc.a.run.app/", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }
  };

  return (
    <React.Fragment>
      <TableHeader
        title={labels.notification}
        setShowAddModal={setShowAddModal}
        showAddModal={showAddModal}
        setSearch={setSearch}
        search={search}
      />
      {search && filteredNotifications.length <= 0 ? (
        <div>
          <NoSearchFound entity={`${labels.notification}`} />
        </div>
      ) : notificationItem <= 0 &&
        !loadingGetNotificationItem &&
        totalPages < currentPage &&
        !notificationItem.length > 0 &&
        totalPages < currentPage &&
        !notificationItem.length > 0 ? (
        <div className="min-h-screen min-w-screen grid place-content-center">
          <AddNewItem
            title={labels.youHaveNotAddedNotification}
            btnTitle={labels.sendNow}
            setShowAddModal={setShowAddModal}
            showAddModal={showAddModal}
          />
        </div>
      ) : (
        <div className="">
          <div className="overflow-x-auto">
            {loadingGetNotificationItem ? (
              <div className="min-h-screen flex items-center justify-center">
                <GridLoader size={12} color={"#ED3237"} />
              </div>
            ) : (
              <table className="table-responsive w-full overflow-auto !text-c_000">
                <thead>
                  <tr className="bg-c_fff !rounded-2xl">
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-4 text-left text-[15px] font-generalSansRegular capitalize !rounded-tl-2xl text-c_9EA2A5 sm:pl-0"
                    >
                      <div className="flex items-center justify-center gap-x-4 pl-4">
                        <div className="font-normal text-c_000/60">
                          {labels.Sno}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 pr-4 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.title}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 pr-4 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.description}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.callToAction}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.status}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular !rounded-tr-2xl capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.actions}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="w-full">
                  {filteredNotifications?.map((item, index) => (
                    <tr
                      className="bg-c_FCFCFC !rounded-md border-b-2 border-c_F5F7F8 cursor-pointer"
                      key={item?.id}
                    >
                      <td className="px-4 py-6 text-sm text-c_595B5C !rounded-tl-md !rounded-bl-md">
                        <div className="flex justify-center">{index + 1}</div>
                      </td>
                      <td
                        className="px-3 py-6 text-sm text-c_000"
                        onClick={() => setShowModalDetails(true)}
                      >
                        <div className="flex items-center gap-x-2">
                          <p className="text-sm capitalize text-c_121516 font-generalSansSemiBold">
                            {item?.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-6 text-sm text-c_595B5C font-generalSansRegular">
                        {item?.description}
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm">
                        <p className="text-c_006CA3 text-[15px] cursor-pointer underline">
                          {item?.callToAction}
                        </p>
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm">
                        <ToggleButton
                          onClick={() => {
                            updateStatus(
                              item?.id,
                              item?.status,
                              item?.title,
                              item?.description
                            );
                          }}
                          onChange={(e) => {
                            setValues((prevState) => ({
                              ...prevState,
                              status: !values?.status,
                            }));
                          }}
                          value={values.status}
                          defaultChecked={item?.status}
                        />
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm !rounded-tr-md !rounded-br-md">
                        <div className="flex items-center gap-x-4 cursor-pointer">
                          <DeleteIcon
                            onClick={() => {
                              setSelectedId(item?.id);
                              setShowDeleteModal(!showDeleteModal);
                            }}
                            color={"#121516"}
                            width={18}
                            height={18}
                          />
                          <ForwardIcon
                            color={"#121516"}
                            width={12}
                            height={12}
                            onClick={() => {
                              setShowModalDetails(true);
                              setSelectedId(item?.id);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {search ? null : (
            <div className="flex justify-center gap-x-4 mt-6 w-full">
              <button
                disabled={currentPage === 1}
                onClick={handlePrevPage}
                className="text-center items-center justify-center flex bg-c_ED3237 rounded-full p-2 font-generalSansMedium mr-4"
              >
                <MdArrowBack color={"#fff"} size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
                className="text-center items-center justify-center flex bg-c_ED3237 rounded-full p-2 font-generalSansMedium"
              >
                <MdArrowForward color={"#fff"} size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddNewModal
          title={labels.sendNotification}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
        />
      )}
      {showModalDetails && (
        <Transition.Root show={showModalDetails} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setShowModalDetails}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 min-w-screen min-h-screen bg-c_000/25 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed z-99 inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 !text-c_000">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-[26px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div
                      className="absolute right-4 top-5 cursor-pointer"
                      onClick={() => setShowModalDetails(false)}
                    >
                      <RxCross2 />
                    </div>
                    <div className="flex flex-col justify-center px-6">
                      <h1 className="text-c_050405 font-generalSansSemiBold text-center text-3xl mt-8 mb-12">
                        {labels.notificationDetail}
                      </h1>
                      <div className={`flex flex-col justify-between gap-y-0`}>
                        {fetchingData ? (
                          <div className="w-1/3 h-4 rounded-xl bg-c_F9F9F9 animate-pulse my-2"></div>
                        ) : (
                          <p className="text-base text-c_0E1014 font-generalSansSemiBold">
                            {values?.title}
                          </p>
                        )}
                        {fetchingData ? (
                          <div className="w-3/5 h-4 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
                        ) : (
                          <p className="text-base text-c_595B5C font-generalSansRegular">
                            {values?.description}
                          </p>
                        )}
                      </div>
                      {fetchingData ? (
                        <div className="w-3/5 h-4 rounded-xl bg-c_F9F9F9 animate-pulse my-2"></div>
                      ) : (
                        <a
                          href={values?.callToAction}
                          target={"_blank"}
                          className="text-[15px] cursor-pointer text-c_006CA3 mt-4 mb-8 font-generalSansMedium"
                        >
                          {values?.callToAction}
                        </a>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      )}
      {showDeleteModal ? (
        <DeleteModal
          handleNo={() => setShowDeleteModal(false)}
          handleYes={handleDeleteNotification}
          modalTitle={labels.areYouSureYouWantToDeleteNotification}
        />
      ) : null}
    </React.Fragment>
  );
};

export default Notification;
