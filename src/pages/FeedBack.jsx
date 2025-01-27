import React, { useEffect, useState, useMemo } from "react";
import labels from "../configs/Label";
import ForwardIcon from "./../assets/images/ForwardIcon.jsx";
import TableHeader from "../components/TableHeader";
import { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";
import { Dialog, Transition } from "@headlessui/react";
import AddNewItem from "../components/AddNewItem.jsx";
import StarIcon from "../assets/images/StarIcon";
import LocationIcon from "./../assets/images/LocationIcon";
import { db } from "../configs/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  limit,
  startAfter,
  endBefore,
  limitToLast,
} from "firebase/firestore";
import GridLoader from "react-spinners/GridLoader";
import EmptyStarIcon from "../assets/images/EmptyStarIcon";
import { toast } from "react-toastify";
import NoSearchFound from "../components/NoSearchFound";
import { MdArrowForward, MdArrowBack } from "react-icons/md";

const FeedBack = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [loadingGetFeedbackItem, setLoadingGetFeedbackItem] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingNextFeedbacks, setLoadingNextFeedbacks] = useState(false);
  const [loadingPrevFeedbacks, setLoadingPrevFeedbacks] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [fetchingData, setFetchingData] = useState(false);
  const [values, setValues] = useState({
    name: "",
    feedBack: "",
    number: "",
    rating: "",
    email: "",
  });

  const getCollectionSize = () => {
    const q = query(collection(db, "store"), orderBy("createdAt", "desc"));
    onSnapshot(q, (querySnapshot) => {
      const size = querySnapshot.size;
      const totalPages = Math.ceil(size / pageSize);
      setTotalPages(totalPages);
    });
  };

  useEffect(() => {
    setLoadingGetFeedbackItem(true);
    getCollectionSize();
    const q = query(
      collection(db, "feedback"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let feedbackItemArray = [];
      QuerySnapshot.forEach((doc) => {
        feedbackItemArray.push({ ...doc.data(), id: doc.id });
      });
      setFeedbackItem(feedbackItemArray);
      setTimeout(() => {
        setLoadingGetFeedbackItem(false);
      }, 250);
    });
    return () => unsub();
  }, []);

  const filteredFeedback = useMemo(() => {
    if (search) {
      return feedbackItem.filter((feedback) => {
        const feedbackNameMatch =
          feedback.name
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          feedback.email
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          feedback.number
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          feedback.feedBack
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase());
        return feedbackNameMatch;
      });
    }
    return feedbackItem;
  }, [search, feedbackItem]);

  const handleFetchData = async () => {
    setFetchingData(true);
    try {
      const docRef = doc(db, "feedback", selectedId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setValues((prevState) => ({
          ...prevState,
          name: data?.name,
          email: data?.email,
          number: data?.number,
          feedBack: data?.feedBack,
          rating: data?.rattings,
        }));
        setFetchingData(false);
      } else {
        setFetchingData(false);
        toast.error("No such Feedback Found!");
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

  const handleNextPage = async () => {
    if (currentPage < totalPages && feedbackItem.length > 0) {
      setLoadingNextFeedbacks(true);
      const lastItem = feedbackItem[feedbackItem.length - 1];
      const q = query(
        collection(db, "feedback"),
        orderBy("createdAt", "desc"),
        startAfter(lastItem.createdAt),
        limit(5)
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newFeedbackItems = [];
        QuerySnapshot.forEach((doc) => {
          newFeedbackItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingNextFeedbacks(false);
        }, 500);
        setFeedbackItem(newFeedbackItems);
        setCurrentPage((prevPage) => prevPage + 1);
      });
      return () => unsub();
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1 && feedbackItem.length > 0) {
      setLoadingPrevFeedbacks(true);
      const firstItem = feedbackItem[0];
      const q = query(
        collection(db, "feedback"),
        orderBy("createdAt", "desc"),
        endBefore(firstItem.createdAt),
        limitToLast(5)
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newFeedbackItems = [];
        QuerySnapshot.forEach((doc) => {
          newFeedbackItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingPrevFeedbacks(false);
        }, 500);
        setFeedbackItem(newFeedbackItems);
        setCurrentPage((prevPage) => prevPage - 1);
      });
      return () => unsub();
    }
  };

  function renderStarIcons(rating) {
    const roundRating = Math.round(rating);
    const totalStars = 5;
    const starIcons = [];
    for (let i = 1; i <= totalStars; i++) {
      const isFilled = i <= roundRating;
      const icon = isFilled ? (
        <StarIcon key={i} width={16} height={16} />
      ) : (
        <EmptyStarIcon key={i} width={16} height={16} />
      );
      starIcons.push(icon);
    }
    return starIcons;
  }

  return (
    <React.Fragment>
      <TableHeader
        title={labels.feedback}
        setShowAddModal={setShowAddModal}
        showAddModal={showAddModal}
        setSearch={setSearch}
        search={search}
      />
      {search && filteredFeedback.length <= 0 ? (
        <div>
          <NoSearchFound entity={`${labels.feedback}`} />
        </div>
      ) : feedbackItem <= 0 && !loadingGetFeedbackItem ? (
        <div className="min-h-screen min-w-screen grid place-content-center">
          <AddNewItem
            title={labels.youhavenotrecievedfeedback}
            btnTitle={labels.sendNow}
            setShowAddModal={setShowAddModal}
            showAddModal={showAddModal}
          />
        </div>
      ) : (
        <div className="">
          <div className="overflow-x-auto">
            {loadingGetFeedbackItem ? (
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
                          {labels.rating}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 pr-4 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.userName}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.emailAddress}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.phoneNo}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5"
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="font-normal text-c_000/60">
                          {labels.feedback}
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
                  {filteredFeedback?.map((item, index) => (
                    <tr
                      className="bg-c_FCFCFC !rounded-md border-b-2 border-c_F5F7F8 cursor-pointer"
                      key={item?.id}
                      onClick={() => {
                        setShowModalDetails(true);
                        setSelectedId(item?.id);
                      }}
                    >
                      <td className="px-4 py-6 text-sm text-c_595B5C !rounded-tl-md !rounded-bl-md">
                        <div className="flex justify-center">{index + 1}</div>
                      </td>
                      <td className="px-3 py-6 text-sm text-c_000">
                        <div className="flex items-center justify-start gap-x-2">
                          {renderStarIcons(item?.rattings)}
                        </div>
                      </td>
                      <td className="px-3 py-6 text-sm text-c_121516 font-generalSansMedium">
                        {item?.name}
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm font-generalSansRegular text-c_595B5C">
                        {item?.email}
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm font-generalSansRegular text-c_595B5C">
                        {item?.number}
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm text-c_121516 font-generalSansMedium">
                        {item?.feedBack}
                      </td>
                      <td className="px-3 py-6 md:px-0 text-sm !rounded-tr-md !rounded-br-md">
                        <div className="flex items-center justify-start pl-6 gap-x-4 cursor-pointer">
                          <ForwardIcon
                            color={"#121516"}
                            width={16}
                            height={16}
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
                    <div className="flex flex-col justify-center px-6 pt-8 pb-4">
                      <h1 className="text-c_050405 font-generalSansSemiBold text-center text-3xl mb-10 mt-4">
                        {labels.feedbackDetail}
                      </h1>
                      <div className="grid grid-cols-2">
                        <div className={`col-span-1`}>
                          <p className="text-base text-c_0E1014 font-generalSansSemiBold">
                            {fetchingData ? (
                              <div className="w-12 h-4 mb-1 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
                            ) : (
                              values?.name
                            )}
                          </p>
                          <p className="text-[15px] text-c_595B5C font-generalSansRegular">
                            {fetchingData ? (
                              <div className="w-28 h-4 mb-1 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
                            ) : (
                              values?.email
                            )}
                          </p>
                          <p className="text-[15px] text-c_595B5C font-generalSansRegular">
                            {fetchingData ? (
                              <div className="w-20 h-4 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
                            ) : (
                              values?.number
                            )}
                          </p>
                        </div>
                        <div className="col-span-1 flex justify-end items-center mb-auto gap-x-2">
                          <LocationIcon width={16} height={16} />
                          <p className="font-generalSansSemiBold text-c_121516 text-base">
                            {"St Heliers"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 my-6">
                        <div className="col-span-2 my-2 flex items-center justify-between">
                          <p className="text-base text-c_121516 font-generalSansSemiBold">
                            {`${labels.feedback}:`}
                          </p>
                          <div className="flex items-center justify-start gap-x-2">
                            {fetchingData ? (
                              <div className="w-28 h-5 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
                            ) : (
                              renderStarIcons(values?.rating)
                            )}
                          </div>
                        </div>
                        <p className="col-span-2 text-[15px] text-c_595B5C mt-2 font-generalSansRegular">
                          {fetchingData ? (
                            <div className="w-32 h-5 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
                          ) : (
                            values?.feedBack
                          )}
                        </p>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </React.Fragment>
  );
};

export default FeedBack;
