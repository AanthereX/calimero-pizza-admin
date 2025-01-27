/** @format */

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import labels from "../configs/Label";
import Button from "../components/Button.jsx";
import ForwardIcon from "./../assets/images/ForwardIcon.jsx";
import TableHeader from "../components/TableHeader";
import { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";
import { Dialog, Transition } from "@headlessui/react";
import AddNewItem from "../components/AddNewItem.jsx";
import ToggleButton from "../components/ToggleButton.jsx";
import { MdArrowForward, MdArrowBack } from "react-icons/md";
import EditIcon from "../assets/images/EditIcon";
import DeleteIcon from "../assets/images/DeleteIcon";
import { db, storage } from "../configs/firebase/index.js";
import GridLoader from "react-spinners/GridLoader";
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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import UploadIcon from "../assets/images/UploadIcon";
import Input from "../components/Input";
import { toast } from "react-toastify";
import { AiOutlineDelete } from "react-icons/ai";
import {
  validateLength,
  validateOnlySpace,
  validateText,
} from "../utils/validate";
import DeleteModal from "../components/DeleteModal";
import AddNewModal from "../components/AddNewModal";
import NoSearchFound from "../components/NoSearchFound";

const Store = () => {
  const storeImageRef = useRef();
  const [storeItem, setStoreItem] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const [values, setValues] = useState({
    storeImage: "",
    storeImageUrl: "",
    storeImageFile: "",
    storeName: "",
    storeLocation: "",
    latitude: "",
    longitude: "",
    orderUrl: "",
    visibility: "",
  });
  const [errors, setErrors] = useState({
    storeImageError: null,
    storeName: null,
    storeLocation: null,
    latitude: null,
    longitude: null,
    orderUrl: null,
    visibility: null,
  });
  const [loadingGetStoreItem, setLoadingGetStoreItem] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingNextStores, setLoadingNextStores] = useState(false);
  const [loadingPrevStores, setLoadingPrevStores] = useState(false);

  const getCollectionSize = () => {
    const q = query(collection(db, "store"), orderBy("createdAt", "desc"));
    onSnapshot(q, (querySnapshot) => {
      const size = querySnapshot.size;
      const totalPages = Math.ceil(size / pageSize);
      setTotalPages(totalPages);
    });
  };

  useEffect(() => {
    setLoadingGetStoreItem(true);
    getCollectionSize();
    const q = query(
      collection(db, "store"),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let storeItemArray = [];
      QuerySnapshot.forEach((doc) => {
        storeItemArray.push({ ...doc.data(), id: doc.id });
      });
      setStoreItem(storeItemArray);
      setTimeout(() => {
        setLoadingGetStoreItem(false);
      }, 250);
    });
    return () => unsub();
  }, []);

  // console.log(storeItem);

  const filteredStores = useMemo(() => {
    if (search) {
      return storeItem.filter((store) => {
        const storeNameMatch =
          store.storeName
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          store.storeLocation
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase());

        return storeNameMatch;
      });
    }
    return storeItem;
  }, [search, storeItem]);

  const handleNextPage = async () => {
    if (currentPage < totalPages && storeItem.length > 0) {
      setLoadingNextStores(true);
      const lastItem = storeItem[storeItem.length - 1];
      const q = query(
        collection(db, "store"),
        orderBy("createdAt", "desc"),
        startAfter(lastItem.createdAt),
        limit(5),
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newStoreItems = [];
        QuerySnapshot.forEach((doc) => {
          newStoreItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingNextStores(false);
        }, 500);
        setStoreItem(newStoreItems);
        setCurrentPage((prevPage) => prevPage + 1);
      });
      return () => unsub();
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1 && storeItem.length > 0) {
      setLoadingPrevStores(true);
      const firstItem = storeItem[0];
      const q = query(
        collection(db, "store"),
        orderBy("createdAt", "desc"),
        endBefore(firstItem.createdAt),
        limitToLast(5),
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newStoreItems = [];
        QuerySnapshot.forEach((doc) => {
          newStoreItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingPrevStores(false);
        }, 500);
        setStoreItem(newStoreItems);
        setCurrentPage((prevPage) => prevPage - 1);
      });
      return () => unsub();
    }
  };

  const handleDeleteStore = async () => {
    try {
      const storeDocRef = doc(db, "store", selectedId);
      await deleteDoc(storeDocRef);
      toast.success("Store Deleted Successfully!");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Delete Store Failed!");
    }
  };

  const handleFetchData = async () => {
    setFetchingData(true);
    try {
      const docRef = doc(db, "store", selectedId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setValues((prevState) => ({
          ...prevState,
          storeName: data?.storeName,
          storeImage: data?.storeImageURL,
          storeLocation: data?.storeLocation,
          latitude: data?.latitude,
          longitude: data?.longitude,
          orderUrl: data?.orderUrl,
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
  }, [selectedId, showEditModal]);

  const handleEditStore = useCallback(async () => {
    try {
      if (!values.storeName) {
        const textError = validateText(values?.storeName);
        setErrors((prevState) => ({
          ...prevState,
          storeName: textError,
        }));
      }
      if (values.storeName) {
        const textError = validateOnlySpace(values?.storeName);
        setErrors((prevState) => ({
          ...prevState,
          storeName: textError,
        }));
        if (textError) return;
      }
      if (values.storeName) {
        const textError = validateLength(values?.storeName);
        setErrors((prevState) => ({
          ...prevState,
          storeName: textError,
        }));
        if (textError) return;
      }
      if (!values.storeLocation) {
        const textError = validateText(values?.storeLocation);
        setErrors((prevState) => ({
          ...prevState,
          storeLocation: textError,
        }));
      }
      if (values.storeLocation) {
        const textError = validateOnlySpace(values?.storeLocation);
        setErrors((prevState) => ({
          ...prevState,
          storeLocation: textError,
        }));
        if (textError) return;
      }
      if (values.storeLocation) {
        const textError = validateLength(values?.storeLocation);
        setErrors((prevState) => ({
          ...prevState,
          storeLocation: textError,
        }));
        if (textError) return;
      }
      if (!values.storeImageFile && !values.storeImage) {
        const textError = validateText(values?.storeImageFile);
        setErrors((prevState) => ({
          ...prevState,
          storeImageError: textError,
        }));
        toast.error(labels.pleaseSelectImagetoUpload);
      }
      const storeDocRef = doc(db, "store", selectedId);
      if (
        values.storeLocation &&
        validateOnlySpace(values.storeLocation) === null &&
        validateLength(values.storeLocation) === null &&
        values.storeName &&
        validateOnlySpace(values.storeName) === null &&
        validateLength(values.storeName) === null &&
        (values?.storeImageFile || values?.storeImage)
      ) {
        setLoading(true);
        if (values?.storeImageFile) {
          const storeImageStorageRef = ref(
            storage,
            `files/${values.storeImageFile?.name}`,
          );
          const uploadTaskStore = uploadBytesResumable(
            storeImageStorageRef,
            values?.storeImageFile,
          );
          uploadTaskStore.on(
            "state_changed",
            (_) => {},
            (error) => {
              throw new Error(error);
            },
            () => {
              getDownloadURL(uploadTaskStore.snapshot.ref).then(
                async (storeDownloadURL) => {
                  await updateDoc(storeDocRef, {
                    storeName: values.storeName.trim(),
                    storeLocation: values.storeLocation.trim(),
                    storeImageURL: storeDownloadURL,
                    latitude: values.latitude,
                    longitude: values.longitude,
                    orderUrl: values.orderUrl,
                    visibility: true,
                    createdAt: new Date(),
                  });
                },
              );
            },
          );
          setShowEditModal(false);
        } else {
          await updateDoc(storeDocRef, {
            storeName: values.storeName.trim(),
            storeLocation: values.storeLocation.trim(),
            storeImageURL: values.storeImage,
            latitude: values.latitude,
            longitude: values.longitude,
            orderUrl: values.orderUrl,
            visibility: true,
            createdAt: new Date(),
          });
        }
        setShowEditModal(false);
        setTimeout(() => {
          setLoading(false);
          toast.success("Store Updated Successfully!");
        }, 200);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Store Updated Failed!");
    }
  }, [setErrors, values]);

  const updateStatus = async (id, visibility) => {
    const storeDocRef = doc(db, "store", id);
    const newStatus = { visibility: !visibility };
    await updateDoc(storeDocRef, newStatus);
    toast.success("Visibility updated!");
  };

  return (
    <React.Fragment>
      <TableHeader
        title={`${labels.store}s`}
        setShowAddModal={setShowAddModal}
        showAddModal={showAddModal}
        setSearch={setSearch}
        search={search}
      />

      {search && filteredStores.length <= 0 ? (
        <div>
          <NoSearchFound entity={`${labels.store}s`} />
        </div>
      ) : storeItem <= 0 &&
        !loadingGetStoreItem &&
        totalPages < currentPage &&
        !storeItem.length > 0 &&
        totalPages < currentPage &&
        !storeItem.length > 0 ? (
        <div className='min-h-screen min-w-screen grid place-content-center'>
          <AddNewItem
            title={labels.youhavenotaddedanystores}
            btnTitle={labels.addNow}
            setShowAddModal={setShowAddModal}
            showAddModal={showAddModal}
          />
        </div>
      ) : (
        <div className=''>
          <div className='overflow-x-auto'>
            {loadingGetStoreItem ? (
              <div className='min-h-screen flex items-center justify-center'>
                <GridLoader size={12} color={"#ED3237"} />
              </div>
            ) : (
              <table className='table-responsive w-full overflow-auto !text-c_000'>
                <thead>
                  <tr className='bg-c_fff !rounded-2xl'>
                    <th
                      scope='col'
                      className='py-3.5 pl-4 pr-4 text-left text-[15px] font-generalSansRegular capitalize !rounded-tl-2xl text-c_9EA2A5 sm:pl-0'
                    >
                      <div className='flex items-center justify-center gap-x-4 pl-4'>
                        <div className='font-normal text-c_000/60'>
                          {labels.Sno}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 pr-4 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className=''></div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 pr-4 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal capitalize text-c_000/60'>
                          {labels.store}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal capitalize text-c_000/60'>
                          {labels.location}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal capitalize text-c_000/60'>
                          {labels.visibility}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular !rounded-tr-2xl capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center justify-center gap-x-4'>
                        <div className='font-normal capitalize text-c_000/60'>
                          {labels.actions}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className='w-full'>
                  {filteredStores?.map((item, index) => (
                    <tr
                      className='bg-c_FCFCFC !rounded-md border-b-2 border-c_F5F7F8 cursor-pointer'
                      key={item?.id}
                    >
                      <td className='px-4 py-6 text-sm text-c_595B5C !rounded-tl-md !rounded-bl-md'>
                        <div className='flex justify-center'>{index + 1}</div>
                      </td>
                      <td className='px-3 py-6 text-sm text-c_000'>
                        <div className='flex items-center justify-start gap-x-2 rounded-lg'>
                          <img
                            src={item?.storeImageURL}
                            alt='storeimage'
                            className='h-12 w-12 rounded-lg'
                          />
                        </div>
                      </td>
                      <td className='px-3 capitalize py-6 md:px-0 text-sm font-generalSansRegular text-c_595B5C'>
                        {item?.storeName}
                      </td>
                      <td className='px-3 py-6 md:px-0 text-sm font-generalSansRegular text-c_595B5C'>
                        {item?.storeLocation}
                      </td>
                      <td className='px-3 py-6 md:px-0 text-sm text-c_121516 font-generalSansMedium'>
                        <ToggleButton
                          onClick={() => {
                            updateStatus(item?.id, item?.visibility);
                          }}
                          onChange={(e) => {
                            setValues((prevState) => ({
                              ...prevState,
                              visibility: !values?.visibility,
                            }));
                          }}
                          value={values.visibility}
                          defaultChecked={item?.visibility}
                        />
                      </td>
                      <td className='px-3 py-6 md:px-0 text-sm !rounded-tr-md !rounded-br-md'>
                        <div className='flex items-center justify-center pl-6 gap-x-4 cursor-pointer'>
                          <EditIcon
                            onClick={() => {
                              setShowEditModal(!showEditModal);
                              setSelectedId(item?.id);
                            }}
                            width={20}
                            height={20}
                            color={"#121516"}
                          />
                          <DeleteIcon
                            onClick={() => {
                              setSelectedId(item?.id);
                              setShowDeleteModal(!showDeleteModal);
                            }}
                            width={18}
                            height={18}
                            color={"#121516"}
                          />
                          <ForwardIcon
                            onClick={() => {
                              setSelectedId(item?.id);
                              setShowViewModal(!showViewModal);
                            }}
                            width={16}
                            height={16}
                            color={"#121516"}
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
            <div className='flex justify-center gap-x-4 mt-6 w-full'>
              <button
                disabled={currentPage === 1}
                onClick={handlePrevPage}
                className='text-center items-center justify-center flex bg-c_ED3237 rounded-full p-2 font-generalSansMedium mr-4'
              >
                <MdArrowBack color={"#fff"} size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
                className='text-center items-center justify-center flex bg-c_ED3237 rounded-full p-2 font-generalSansMedium'
              >
                <MdArrowForward color={"#fff"} size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* edit store modal */}
      {showEditModal && (
        <React.Fragment>
          <div className='justify-center items-center flex overflow-x-hidden pt-8 mb-4 overflow-y-auto fixed inset-0 z-99 outline-none focus:outline-none'>
            <div className='relative w-11/12 !rounded-[20px] md:w-auto my-6 mx-auto max-w-3xl'>
              <Transition.Root show={showEditModal} as={Fragment}>
                <Dialog
                  as='div'
                  className='relative z-10'
                  onClose={setShowEditModal}
                >
                  <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                  >
                    <div className='fixed inset-0 min-w-screen min-h-screen bg-c_000/25 bg-opacity-75 transition-opacity' />
                  </Transition.Child>

                  <div className='fixed z-99 inset-0 z-10 overflow-y-auto'>
                    <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 !text-c_000'>
                      <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                        enterTo='opacity-100 translate-y-0 sm:scale-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                        leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                      >
                        <Dialog.Panel className='relative transform overflow-hidden rounded-[26px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                          <div
                            className='absolute right-4 top-5 cursor-pointer'
                            onClick={() => {
                              setShowEditModal(false);
                            }}
                          >
                            <RxCross2 />
                          </div>
                          <div className='flex flex-col justify-center items-center px-6 pt-8'>
                            <h1 className='text-c_050405 font-generalSansSemiBold text-center text-3xl mb-10 mt-4'>
                              {labels.editStore}
                            </h1>

                            <div
                              className={`w-full h-32 relative flex flex-col items-center justify-center gap-y-2 bg-c_F9F9F9 ${
                                errors?.storeImageError &&
                                "border-red-700 border"
                              } ${
                                values?.storeImageFile && "border-none"
                              } px-4 rounded-[10px]`}
                            >
                              {values?.storeImage ? (
                                <div className='image_container'>
                                  {fetchingData ? (
                                    <div className='w-full h-24 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <img
                                      src={values.storeImage}
                                      alt='storeImage'
                                      className='h-20 w-26'
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className='upload_container flex flex-col items-center justify-center'>
                                  <UploadIcon width={24} height={24} />
                                  <p className='text-c_000 font-generalSansSemiBold text-base'>
                                    {labels.uploadImage}
                                  </p>
                                  <p className='text-c_595B5C font-generalSansRegular text-sm'>
                                    {labels.DragAndDropHere}
                                  </p>
                                </div>
                              )}
                              <Input
                                ref={storeImageRef}
                                accept='image/*'
                                type='file'
                                onChange={(e) => {
                                  if (
                                    window.location.pathname === "/store" &&
                                    e?.target?.files[0]
                                  ) {
                                    setValues((prev) => ({
                                      ...prev,
                                      storeImage: URL.createObjectURL(
                                        e.target?.files[0],
                                      ),
                                      storeImageFile: e.target.files[0],
                                    }));
                                  }
                                }}
                                className='w-full h-32 absolute left-0 cursor-pointer top-0 opacity-0 border border-c_000'
                              />
                              {values?.storeImage && !fetchingData ? (
                                <div
                                  className='absolute bottom-2 right-2 cursor-pointer bg-c_ED3237 rounded-full z-99 w-fit p-2 font-generalSansRegular text-base'
                                  onClick={() => {
                                    if (
                                      window.location.pathname === "/store" &&
                                      storeImageRef.current
                                    ) {
                                      storeImageRef.current.value = "";
                                    }
                                    setValues((prev) => ({
                                      ...prev,
                                      storeImage: "",
                                      storeImageFile: null,
                                    }));
                                  }}
                                >
                                  <AiOutlineDelete size={20} color={"#fff"} />
                                </div>
                              ) : null}
                            </div>

                            <div className='w-full input_container'>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {window.location.pathname === "/store"
                                    ? labels.storeName
                                    : window.location.pathname === "/special"
                                    ? labels.title
                                    : null}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    placeholder={
                                      window.location.pathname === "/store"
                                        ? labels.typeStoreName
                                        : window.location.pathname ===
                                          "/special"
                                        ? labels.typeTitleHere
                                        : null
                                    }
                                    onChange={(e) => {
                                      if (
                                        window.location.pathname === "/store"
                                      ) {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          storeName: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          storeName: e.target.value,
                                        }));
                                      }
                                    }}
                                    error={errors.title}
                                    errorText={errors.title}
                                    maxLength={25}
                                    value={values.storeName}
                                    className={`w-full capitalize mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {window.location.pathname === "/store"
                                    ? labels.location
                                    : window.location.pathname === "/special"
                                    ? labels.description
                                    : null}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    placeholder={labels.typeLocationHere}
                                    onChange={(e) => {
                                      if (
                                        window.location.pathname === "/store"
                                      ) {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          storeLocation: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          storeLocation: e.target.value,
                                        }));
                                      }
                                    }}
                                    error={errors.storeLocation}
                                    errorText={errors.storeLocation}
                                    value={values.storeLocation}
                                    maxLength={40}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.OrderUrl}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    placeholder={labels.typeUrlHere}
                                    onChange={(e) => {
                                      setErrors((prevState) => ({
                                        ...prevState,
                                        orderUrl: null,
                                      }));
                                      setValues((prevState) => ({
                                        ...prevState,
                                        orderUrl: e.target.value,
                                      }));
                                    }}
                                    error={errors.orderUrl}
                                    errorText={errors.orderUrl}
                                    value={values.orderUrl}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              <div className='lat_long_container flex justify-between gap-x-4'>
                                <div className='relative w-full'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.latitude}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <Input
                                      placeholder={labels.typeLatitude}
                                      onChange={(e) => {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          latitude: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          latitude: e.target.value,
                                        }));
                                      }}
                                      type={"number"}
                                      error={errors.latitude}
                                      errorText={errors.latitude}
                                      value={values.latitude}
                                      className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                    />
                                  )}
                                </div>

                                <div className='relative w-full'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.longitude}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <Input
                                      placeholder={labels.typeLongitude}
                                      onChange={(e) => {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          longitude: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          longitude: e.target.value,
                                        }));
                                      }}
                                      type={"number"}
                                      error={errors.longitude}
                                      errorText={errors.longitude}
                                      value={values.longitude}
                                      className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={handleEditStore}
                              loading={loading}
                              disabled={loading}
                              className={
                                "w-full bg-c_ED3237 rounded-xl px-8 py-3 md:px-20 font-generalSansRegular my-4 text-c_fff"
                              }
                              label={labels.editStore}
                            ></Button>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition.Root>
            </div>
          </div>
          <div className='opacity-50 fixed inset-0 z-90 bg-c_000'></div>
        </React.Fragment>
      )}

      {/* view store data modal */}
      {showViewModal && (
        <React.Fragment>
          <div className='justify-center items-center flex overflow-x-hidden pt-8 mb-4 overflow-y-auto fixed inset-0 z-99 outline-none focus:outline-none'>
            <div className='relative w-11/12 !rounded-[20px] md:w-auto my-6 mx-auto max-w-3xl'>
              <Transition.Root show={showViewModal} as={Fragment}>
                <Dialog
                  as='div'
                  className='relative z-10'
                  onClose={setShowViewModal}
                >
                  <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                  >
                    <div className='fixed inset-0 min-w-screen min-h-screen bg-c_000/25 bg-opacity-75 transition-opacity' />
                  </Transition.Child>

                  <div className='fixed z-99 inset-0 z-10 overflow-y-auto'>
                    <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 !text-c_000'>
                      <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                        enterTo='opacity-100 translate-y-0 sm:scale-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                        leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                      >
                        <Dialog.Panel className='relative transform overflow-hidden rounded-[26px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                          <div
                            className='absolute right-4 top-5 cursor-pointer'
                            onClick={() => {
                              setShowViewModal(false);
                            }}
                          >
                            <RxCross2 />
                          </div>
                          <div className='flex flex-col justify-center items-center px-6 pt-8 pb-8'>
                            <h1 className='text-c_050405 font-generalSansSemiBold text-center text-3xl mb-10 mt-4'>
                              {labels.viewStore}
                            </h1>

                            <div
                              className={`w-full h-32 relative flex flex-col items-center justify-center gap-y-2 bg-c_F9F9F9 px-4 rounded-[10px]`}
                            >
                              {values?.storeImage && (
                                <div className='image_container'>
                                  {fetchingData ? (
                                    <div className='w-full h-24 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <img
                                      src={values.storeImage}
                                      alt='storeImage'
                                      className='h-20 w-26'
                                    />
                                  )}
                                </div>
                              )}
                              <Input
                                accept='image/*'
                                type='file'
                                disabled={true}
                                className='w-full h-32 absolute left-0 top-0 opacity-0 border border-c_000'
                              />
                            </div>

                            <div className='w-full input_container'>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.storeName}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    disabled={true}
                                    value={values.storeName}
                                    className={`w-full capitalize mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {window.location.pathname === "/store"
                                    ? labels.location
                                    : window.location.pathname === "/special"
                                    ? labels.description
                                    : null}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    disabled={true}
                                    value={values.storeLocation}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.OrderUrl}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    disabled={true}
                                    value={values.orderUrl}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              <div className='lat_long_container flex justify-between gap-x-4'>
                                <div className='relative w-full'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.latitude}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <Input
                                      disabled={true}
                                      value={values.latitude}
                                      className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                    />
                                  )}
                                </div>

                                <div className='relative w-full'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.longitude}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <Input
                                      disabled={true}
                                      value={values.longitude}
                                      className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition.Root>
            </div>
          </div>
          <div className='opacity-50 fixed inset-0 z-90 bg-c_000'></div>
        </React.Fragment>
      )}

      {showAddModal && (
        <AddNewModal
          title={labels.addStore}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
        />
      )}
      {showDeleteModal ? (
        <DeleteModal
          handleNo={() => setShowDeleteModal(false)}
          handleYes={handleDeleteStore}
          modalTitle={labels.areYouWantToDeleteThisStore}
        />
      ) : null}
    </React.Fragment>
  );
};

export default Store;
