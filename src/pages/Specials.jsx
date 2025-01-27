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
import Input from "../components/Input.jsx";
import DeleteIcon from "./../assets/images/DeleteIcon.jsx";
import ForwardIcon from "./../assets/images/ForwardIcon.jsx";
import EditIcon from "./../assets/images/EditIcon.jsx";
import ToggleButton from "../components/ToggleButton.jsx";
import TableHeader from "../components/TableHeader";
import UploadIcon from "../assets/images/UploadIcon";
import { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";
import { db, storage } from "../configs/firebase/index.js";
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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Dialog, Transition } from "@headlessui/react";
import AddNewItem from "../components/AddNewItem.jsx";
import { toast } from "react-toastify";
import { AiOutlineDelete } from "react-icons/ai";
import {
  validateLength,
  validateOnlySpace,
  validateText,
} from "../utils/validate";
import TextArea from "../components/TextArea";
import AddNewModal from "../components/AddNewModal";
import DeleteModal from "../components/DeleteModal";
import GridLoader from "react-spinners/GridLoader";
import NoSearchFound from "../components/NoSearchFound";
import CustomSelect from "../components/CustomSelect.jsx";

const Specials = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const specialImageRef = useRef();
  const [selectedId, setSelectedId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingNextStores, setLoadingNextStores] = useState(false);
  const [loadingPrevStores, setLoadingPrevStores] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [values, setValues] = useState({
    specialImage: "",
    specialImageUrl: "",
    specialImageFile: "",
    title: "",
    description: "",
    location: "",
    link: "",
    status: "",
  });
  const [errors, setErrors] = useState({
    specialImageError: null,
    title: null,
    description: null,
    location: null,
    link: null,
    status: null,
  });

  const [loadingGetSpecialItem, setLoadingGetSpecialItem] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [specialItem, setSpecialItem] = useState([]);
  const [specialItemCount, setSpecialItemCount] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [storeNames, setStoreNames] = useState([]);
  const [loadingGetStoreItem, setLoadingGetStoreItem] = useState(false);

  useEffect(() => {
    setLoadingGetStoreItem(true);
    const q = query(collection(db, "store"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let storeItemArray = [];
      QuerySnapshot.forEach((doc) => {
        storeItemArray.push({ ...doc.data(), id: doc.id });
      });
      const storeNamesArray = storeItemArray
        ?.filter((elm) => elm?.storeName !== "Brazilian Menu")
        ?.map((store) => ({
          label: store?.storeName,
          value: store?.storeName,
        }));
      setStoreNames(storeNamesArray);
      setTimeout(() => {
        setLoadingGetStoreItem(false);
      }, 250);
    });
    return () => unsub();
  }, [setStoreNames, setLoadingGetStoreItem]);

  const getCollectionSize = () => {
    const q = query(collection(db, "specials"), orderBy("createdAt", "desc"));
    onSnapshot(q, (querySnapshot) => {
      const size = querySnapshot.size;
      const totalPages = Math.ceil(size / pageSize);
      setTotalPages(totalPages);
    });
  };

  useEffect(() => {
    setLoadingGetSpecialItem(true);
    getCollectionSize();
    const q = query(
      collection(db, "specials"),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let specialItemArray = [];
      QuerySnapshot.forEach((doc) => {
        specialItemArray.push({ ...doc.data(), id: doc.id });
      });
      setSpecialItem(specialItemArray);
      setSpecialItemCount(specialItemArray.length);
      setTimeout(() => {
        setLoadingGetSpecialItem(false);
      }, 500);
    });
    return () => unsub();
  }, []);

  // get total no of docuemnts present in a collection
  useEffect(() => {
    const q = query(collection(db, "specials"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let specialItemArray = [];
      QuerySnapshot.forEach((doc) => {
        specialItemArray.push({ ...doc.data(), id: doc.id });
      });
      setSpecialItemCount(specialItemArray.length);
    });
    return () => unsub();
  }, [specialItemCount]);

  const handleNextPage = async () => {
    if (currentPage < totalPages && specialItem.length > 0) {
      setLoadingNextStores(true);
      const lastItem = specialItem[specialItem.length - 1];
      const q = query(
        collection(db, "specials"),
        orderBy("createdAt", "desc"),
        startAfter(lastItem.createdAt),
        limit(5),
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newSpecialItems = [];
        QuerySnapshot.forEach((doc) => {
          newSpecialItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingNextStores(false);
        }, 500);
        setSpecialItem(newSpecialItems);
        setCurrentPage((prevPage) => prevPage + 1);
      });
      return () => unsub();
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1 && specialItem.length > 0) {
      setLoadingPrevStores(true);
      const firstItem = specialItem[0];
      const q = query(
        collection(db, "specials"),
        orderBy("createdAt", "desc"),
        endBefore(firstItem.createdAt),
        limitToLast(5),
      );
      const unsub = onSnapshot(q, (QuerySnapshot) => {
        const newSpecialItems = [];
        QuerySnapshot.forEach((doc) => {
          newSpecialItems.push({ id: doc.id, ...doc.data() });
        });
        setTimeout(() => {
          setLoadingPrevStores(false);
        }, 500);
        setSpecialItem(newSpecialItems);
        setCurrentPage((prevPage) => prevPage - 1);
      });
      return () => unsub();
    }
  };

  const filteredSpecialItems = useMemo(() => {
    if (search) {
      return specialItem.filter((special) => {
        const specialNameMatch =
          special?.title
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          special?.description
            ?.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase());

        return specialNameMatch;
      });
    }
    return specialItem;
  }, [search, specialItem]);

  const handleDeleteSpecialItem = async () => {
    try {
      const specialDocRef = doc(db, "specials", selectedId);
      await deleteDoc(specialDocRef);
      toast.success("Special Item Deleted Successfully!");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Delete Special Item Failed!");
    }
  };

  const handleFetchData = async () => {
    setFetchingData(true);
    try {
      const docRef = doc(db, "specials", selectedId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setValues((prevState) => ({
          ...prevState,
          title: data?.title,
          description: data?.description,
          location: data?.location,
          link: data?.link,
          specialImage: data?.specialImageURL,
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

  const handleEditSpecialItem = useCallback(async () => {
    try {
      if (!values.title) {
        const textError = validateText(values?.title);
        setErrors((prevState) => ({
          ...prevState,
          title: textError,
        }));
      }
      if (values.title) {
        const textError = validateOnlySpace(values?.title);
        setErrors((prevState) => ({
          ...prevState,
          title: textError,
        }));
        if (textError) return;
      }
      if (values.title) {
        const textError = validateLength(values?.title);
        setErrors((prevState) => ({
          ...prevState,
          title: textError,
        }));
        if (textError) return;
      }
      if (!values.description) {
        const textError = validateText(values?.description);
        setErrors((prevState) => ({
          ...prevState,
          description: textError,
        }));
      }
      if (values.description) {
        const textError = validateOnlySpace(values?.description);
        setErrors((prevState) => ({
          ...prevState,
          description: textError,
        }));
        if (textError) return;
      }
      if (values.description) {
        const textError = validateLength(values?.description);
        setErrors((prevState) => ({
          ...prevState,
          description: textError,
        }));
        if (textError) return;
      }
      if (!values.location) {
        const textError = validateText(values?.location);
        setErrors((prevState) => ({
          ...prevState,
          location: textError,
        }));
      }
      if (values.location) {
        const textError = validateOnlySpace(values?.location);
        setErrors((prevState) => ({
          ...prevState,
          location: textError,
        }));
        if (textError) return;
      }
      if (values.location) {
        const textError = validateLength(values?.location);
        setErrors((prevState) => ({
          ...prevState,
          location: textError,
        }));
        if (textError) return;
      }
      if (!values.link) {
        const textError = validateText(values?.link);
        setErrors((prevState) => ({
          ...prevState,
          link: textError,
        }));
      }
      if (values.link) {
        const textError = validateOnlySpace(values?.link);
        setErrors((prevState) => ({
          ...prevState,
          link: textError,
        }));
        if (textError) return;
      }
      if (values.link) {
        const textError = validateLength(values?.link);
        setErrors((prevState) => ({
          ...prevState,
          link: textError,
        }));
        if (textError) return;
      }
      if (!values.specialImageFile && !values.specialImage) {
        const textError = validateText(values?.specialImageFile);
        setErrors((prevState) => ({
          ...prevState,
          specialImageError: textError,
        }));
        toast.error(labels.pleaseSelectImagetoUpload);
      }
      const specialDocRef = doc(db, "specials", selectedId);
      if (
        values.title &&
        validateOnlySpace(values.title) === null &&
        validateLength(values.title) === null &&
        values.link &&
        validateOnlySpace(values.link) === null &&
        validateLength(values.link) === null &&
        values.location &&
        validateOnlySpace(values.location) === null &&
        validateLength(values.location) === null &&
        values.description &&
        validateOnlySpace(values.description) === null &&
        validateLength(values.description) === null &&
        (values.specialImageFile || values.specialImage)
      ) {
        setLoadingEdit(true);
        if (values?.specialImageFile) {
          const specialImageStorageRef = ref(
            storage,
            `files/${values.specialImageFile?.name}`,
          );
          const uploadTaskSpecial = uploadBytesResumable(
            specialImageStorageRef,
            values?.specialImageFile,
          );
          uploadTaskSpecial.on(
            "state_changed",
            (_) => {},
            (error) => {
              throw new Error(error);
            },
            () => {
              getDownloadURL(uploadTaskSpecial.snapshot.ref).then(
                async (specialDownloadURL) => {
                  await updateDoc(specialDocRef, {
                    title: values?.title.trim(),
                    description: values?.description.trim(),
                    link: values?.link.trim(),
                    location: values?.location.trim(),
                    specialImageURL: specialDownloadURL,
                    createdAt: new Date(),
                  });
                },
              );
            },
          );
          setShowEditModal(false);
        } else {
          await updateDoc(specialDocRef, {
            title: values?.title.trim(),
            description: values?.description.trim(),
            link: values?.link.trim(),
            location: values?.location.trim(),
            specialImageURL: values?.specialImage,
            createdAt: new Date(),
          });
        }
        setShowEditModal(false);
        setTimeout(() => {
          setLoadingEdit(false);
          toast.success("Item Updated Successfully!");
        }, 200);
      }
    } catch (error) {
      setLoadingEdit(false);
      toast.error("Item Updated Failed!");
    }
  }, [setErrors, values]);

  const updateStatus = async (id, visibility) => {
    const specialsDocRef = doc(db, "specials", id);
    const newStatus = { visibility: !visibility };
    await updateDoc(specialsDocRef, newStatus);
    toast.success("Status updated!");
  };

  return (
    <React.Fragment>
      <TableHeader
        title={labels.specials}
        setShowAddModal={setShowAddModal}
        showAddModal={showAddModal}
        setSearch={setSearch}
        search={search}
        specialItemCount={specialItemCount}
      />
      {search && filteredSpecialItems.length <= 0 ? (
        <NoSearchFound entity={labels.specials} />
      ) : specialItem <= 0 && !loadingGetSpecialItem ? (
        <div className='min-h-screen min-w-screen grid place-content-center'>
          <AddNewItem
            title={labels.youHaveNotAddedAnySpecial}
            btnTitle={labels.addNow}
            setShowAddModal={setShowAddModal}
            showAddModal={showAddModal}
          />
        </div>
      ) : (
        <div className=''>
          <div className='overflow-x-auto'>
            {loadingGetSpecialItem ? (
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
                      className='px-3 py-3.5 pr-4 text-left text-[15px] font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal text-c_000/60'>
                          {labels.title}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 py-3.5 pr-4 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal text-c_000/60'>
                          {labels.description}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal text-c_000/60'>
                          {labels.status}
                        </div>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-3 md:px-0 py-3.5 text-left text-[15px]  font-generalSansRegular !rounded-tr-2xl capitalize text-c_9EA2A5'
                    >
                      <div className='flex items-center gap-x-4'>
                        <div className='font-normal text-c_000/60'>
                          {labels.actions}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className='w-full'>
                  {filteredSpecialItems?.map((item, index) => (
                    <tr
                      className='bg-c_FCFCFC !rounded-md border-b-2 border-c_F5F7F8'
                      key={index}
                    >
                      <td className='px-4 py-4 text-sm text-c_595B5C !rounded-tl-md !rounded-bl-md'>
                        <div className='flex justify-center'>{index + 1}</div>
                      </td>
                      <td className='px-3 py-4 text-sm text-c_000'>
                        <div className='flex items-center gap-x-2'>
                          <img
                            src={item?.specialImageURL}
                            alt='specialImage'
                            className='h-9 w-9 rounded-lg'
                          />
                          <p className='text-sm text-c_121516 font-generalSansSemiBold'>
                            {item?.title}
                          </p>
                        </div>
                      </td>
                      <td className='px-3 py-4 text-sm text-c_595B5C font-generalSansRegular w-[40ch] break-words'>
                        {item?.description}
                      </td>
                      <td className='px-3 md:px-0 text-sm'>
                        <ToggleButton
                          onClick={() => {
                            updateStatus(item?.id, item?.visibility);
                          }}
                          onChange={(e) => {
                            setValues((prevState) => ({
                              ...prevState,
                              status: !values?.status,
                            }));
                          }}
                          value={values.status}
                          defaultChecked={item?.visibility}
                        />
                      </td>
                      <td className='px-3 md:px-0 text-sm !rounded-tr-md !rounded-br-md'>
                        <div className='flex items-center gap-x-4 cursor-pointer'>
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
                            color={"#121516"}
                            width={12}
                            height={12}
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
      {/* show edit modal */}
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
                              {labels.editSpecialItem}
                            </h1>

                            <div
                              className={`w-full h-32 relative flex flex-col items-center justify-center gap-y-2 bg-c_F9F9F9 ${
                                errors?.specialImageError &&
                                "border-red-700 border"
                              } ${
                                values?.specialImageFile && "border-none"
                              } px-4 rounded-[10px]`}
                            >
                              {values?.specialImage ? (
                                <div className='image_container'>
                                  {fetchingData ? (
                                    <div className='w-full h-24 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <img
                                      src={values.specialImage}
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
                                ref={specialImageRef}
                                accept='image/*'
                                type='file'
                                onChange={(e) => {
                                  if (
                                    window.location.pathname === "/special" &&
                                    e?.target?.files[0]
                                  ) {
                                    setValues((prev) => ({
                                      ...prev,
                                      specialImage: URL.createObjectURL(
                                        e.target?.files[0],
                                      ),
                                      specialImageFile: e.target.files[0],
                                    }));
                                  }
                                }}
                                className='w-full h-32 absolute left-0 cursor-pointer top-0 opacity-0 border border-c_000'
                              />
                              {values?.specialImage && !fetchingData ? (
                                <div
                                  className='absolute bottom-2 right-2 cursor-pointer bg-c_ED3237 rounded-full z-99 w-fit p-2 font-generalSansRegular text-base'
                                  onClick={() => {
                                    if (
                                      window.location.pathname === "/special" &&
                                      specialImageRef.current
                                    ) {
                                      specialImageRef.current.value = "";
                                    }
                                    setValues((prev) => ({
                                      ...prev,
                                      specialImage: "",
                                      specialImageFile: null,
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
                                  {labels.title}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    placeholder={labels.typeTitleHere}
                                    onChange={(e) => {
                                      if (
                                        window.location.pathname === "/special"
                                      ) {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          title: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          title: e.target.value,
                                        }));
                                      }
                                    }}
                                    error={errors.title}
                                    errorText={errors.title}
                                    value={values.title}
                                    maxLength={25}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              {window.location.pathname === "/special" && (
                                <div className='relative my-2'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.location}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <CustomSelect
                                      name={"location"}
                                      id={"location"}
                                      onChange={(e) => {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          location: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          location: e.value,
                                        }));
                                      }}
                                      options={storeNames}
                                      selected={values?.location}
                                      error={Boolean(errors?.location)}
                                      errorText={errors?.location}
                                      placeholder={values?.location}
                                      className={`w-full mt-1 outline-none`}
                                    />
                                  )}
                                </div>
                              )}
                              {window.location.pathname === "/special" && (
                                <div className='relative my-2'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.url}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <Input
                                      placeholder={labels.typeUrlHere}
                                      onChange={(e) => {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          link: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          link: e.target.value,
                                        }));
                                      }}
                                      error={errors.link}
                                      errorText={errors.link}
                                      value={values.link}
                                      className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                    />
                                  )}
                                </div>
                              )}
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.description}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-32 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <TextArea
                                    typehere={labels.typeDescriptionHere}
                                    onChange={(e) => {
                                      if (
                                        window.location.pathname === "/special"
                                      ) {
                                        setErrors((prevState) => ({
                                          ...prevState,
                                          description: null,
                                        }));
                                        setValues((prevState) => ({
                                          ...prevState,
                                          description: e.target.value,
                                        }));
                                      }
                                    }}
                                    error={errors.storeLocation}
                                    errorText={errors.storeLocation}
                                    value={values.description}
                                    maxLength={80}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={handleEditSpecialItem}
                              loading={loadingEdit}
                              disabled={loadingEdit}
                              className={
                                "w-full bg-c_ED3237 rounded-xl px-8 py-3 md:px-20 font-generalSansRegular my-4 text-c_fff"
                              }
                              label={labels.editSpecialItem}
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

      {/* show view modal */}
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
                          <div className='flex flex-col justify-center items-center px-6 pt-8 pb-6'>
                            <h1 className='text-c_050405 font-generalSansSemiBold text-center text-3xl mb-10 mt-4'>
                              {labels.viewSpecialItem}
                            </h1>

                            <div
                              className={`w-full h-32 relative flex flex-col items-center justify-center gap-y-2 bg-c_F9F9F9 px-4 rounded-[10px]`}
                            >
                              <div className='image_container'>
                                {fetchingData ? (
                                  <div className='w-full h-24 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <img
                                    disabled={true}
                                    src={values.specialImage}
                                    alt='storeImage'
                                    className='h-20 w-26'
                                  />
                                )}
                              </div>
                            </div>

                            <div className='w-full input_container'>
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.title}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <Input
                                    disabled={true}
                                    value={values.title}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
                              </div>
                              {window.location.pathname === "/special" && (
                                <div className='relative my-2'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.location}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <CustomSelect
                                      name={"location"}
                                      id={"location"}
                                      isDisabled={true}
                                      placeholder={values?.location}
                                      className={`w-full mt-1 outline-none`}
                                    />
                                  )}
                                </div>
                              )}
                              {window.location.pathname === "/special" && (
                                <div className='relative my-2'>
                                  <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                    {labels.url}
                                  </label>
                                  {fetchingData ? (
                                    <div className='w-full h-12 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                  ) : (
                                    <Input
                                      disabled={true}
                                      value={values.link}
                                      className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                    />
                                  )}
                                </div>
                              )}
                              <div className='relative my-2'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.description}
                                </label>
                                {fetchingData ? (
                                  <div className='w-full h-32 rounded-xl bg-c_F9F9F9 animate-pulse'></div>
                                ) : (
                                  <TextArea
                                    disabled={true}
                                    value={values.description}
                                    className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                  />
                                )}
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
          title={labels.addNewSpecial}
          showAddModal={showAddModal}
          storeNames={storeNames}
          loadingGetStoreItem={loadingGetStoreItem}
          setShowAddModal={setShowAddModal}
        />
      )}
      {showDeleteModal ? (
        <DeleteModal
          handleNo={() => setShowDeleteModal(false)}
          handleYes={handleDeleteSpecialItem}
          modalTitle={labels.areYouWantToDeleteThisSpecialItem}
        />
      ) : null}
    </React.Fragment>
  );
};

export default Specials;
