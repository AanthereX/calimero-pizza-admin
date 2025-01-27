/** @format */

import React, { useState, useCallback, useRef, useEffect } from "react";
import Button from "./Button";
import labels from "../configs/Label";
import Input from "./Input";
import { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";
import { Dialog, Transition } from "@headlessui/react";
import { AiOutlineDelete } from "react-icons/ai";
import {
  validateLatitude,
  validateLength,
  validateLongitude,
  validateOnlySpace,
  validateText,
} from "../utils/validate";
import UploadIcon from "../assets/images/UploadIcon";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../configs/firebase/index.js";
import { toast } from "react-toastify";
import CustomSelect from "./CustomSelect.jsx";

export default function AddNewModal({
  showAddModal,
  setShowAddModal,
  title,
  storeNames,
  loadingGetStoreItem,
}) {
  const [values, setValues] = useState({
    storeImage: "",
    storeImageUrl: "",
    storeImageFile: null,
    storeName: "",
    storeLocation: "",
    specialImage: "",
    specialImageUrl: "",
    specialImageFile: null,
    title: "",
    description: "",
    location: "",
    link: "",
    latitude: "",
    longitude: "",
    orderUrl: "",
    callToAction: "",
  });
  const [errors, setErrors] = useState({
    storeImageError: null,
    storeName: null,
    storeLocation: null,
    specialImageError: null,
    title: null,
    description: null,
    location: null,
    link: null,
    latitude: null,
    longitude: null,
    orderUrl: null,
    callToAction: null,
  });
  const storeImageRef = useRef();
  const specialImageRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleAddStore = useCallback(async () => {
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
      if (!values.orderUrl) {
        const textError = validateText(values?.orderUrl);
        setErrors((prevState) => ({
          ...prevState,
          orderUrl: textError,
        }));
      }
      if (values.orderUrl) {
        const textError = validateOnlySpace(values?.orderUrl);
        setErrors((prevState) => ({
          ...prevState,
          orderUrl: textError,
        }));
        if (textError) return;
      }
      if (values.orderUrl) {
        const textError = validateLength(values?.orderUrl);
        setErrors((prevState) => ({
          ...prevState,
          orderUrl: textError,
        }));
        if (textError) return;
      }
      if (!values.latitude) {
        const textError = validateText(values?.latitude);
        setErrors((prevState) => ({
          ...prevState,
          latitude: textError,
        }));
      }
      if (values.latitude) {
        const textError = validateOnlySpace(values?.latitude);
        setErrors((prevState) => ({
          ...prevState,
          latitude: textError,
        }));
        if (textError) return;
      }
      if (values.latitude) {
        const textError = validateLatitude(values?.latitude);
        setErrors((prevState) => ({
          ...prevState,
          latitude: textError,
        }));
        if (textError) return;
      }
      if (!values.longitude) {
        const textError = validateText(values?.longitude);
        setErrors((prevState) => ({
          ...prevState,
          longitude: textError,
        }));
      }
      if (values.longitude) {
        const textError = validateOnlySpace(values?.longitude);
        setErrors((prevState) => ({
          ...prevState,
          longitude: textError,
        }));
        if (textError) return;
      }
      if (values.longitude) {
        const textError = validateLongitude(values?.longitude);
        setErrors((prevState) => ({
          ...prevState,
          longitude: textError,
        }));
        if (textError) return;
      }
      if (!values.storeImageFile) {
        const textError = validateText(values?.storeImageFile);
        setErrors((prevState) => ({
          ...prevState,
          storeImageError: textError,
        }));
        toast.error(labels.pleaseSelectImagetoUpload);
      }

      if (
        values.storeLocation &&
        validateOnlySpace(values.storeLocation) === null &&
        validateLength(values.storeLocation) === null &&
        values.storeName &&
        validateOnlySpace(values.storeName) === null &&
        validateLength(values.storeName) === null &&
        values.storeImageFile
      ) {
        setLoading(true);
        const storeImageStorageRef = ref(
          storage,
          `files/${values.storeImageFile.name}`,
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
            setShowAddModal(false);
            getDownloadURL(uploadTaskStore.snapshot.ref)
              .then(async (storeDownloadURL) => {
                await addDoc(collection(db, "store"), {
                  storeName: values.storeName?.trim(),
                  storeLocation: values.storeLocation?.trim(),
                  storeImageURL: storeDownloadURL,
                  latitude: values.latitude?.trim(),
                  longitude: values.longitude?.trim(),
                  orderUrl: values.orderUrl,
                  visibility: true,
                  createdAt: new Date(),
                });
                setTimeout(() => {
                  setLoading(false);
                  toast.success("Store Added Successfully!");
                }, 200);
                if (storeImageRef.current) {
                  storeImageRef.current.value = "";
                }
                setValues((prev) => ({
                  ...prev,
                  storeImage: "",
                  storeImageFile: null,
                }));
              })
              .catch((err) => {
                throw new Error(err);
              });
          },
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [setErrors, values]);

  const handleAddSpecialItem = useCallback(async () => {
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
      if (!values.specialImageFile) {
        const textError = validateText(values?.specialImageFile);
        setErrors((prevState) => ({
          ...prevState,
          specialImageError: textError,
        }));
        toast.error(labels.pleaseSelectImagetoUpload);
      }
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
        values.specialImageFile
      ) {
        setLoading(true);
        const specialImageStorageRef = ref(
          storage,
          `files/${values?.specialImageFile?.name}`,
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
            getDownloadURL(uploadTaskSpecial.snapshot.ref)
              .then(async (specialDownloadURL) => {
                await addDoc(collection(db, "specials"), {
                  title: values.title.trim(),
                  description: values.description.trim(),
                  link: values.link.trim(),
                  location: values.location.trim(),
                  specialImageURL: specialDownloadURL,
                  visibility: true,
                  createdAt: new Date(),
                });
                setTimeout(() => {
                  setLoading(false);
                  toast.success("Special Item Added Successfully!");
                }, 200);
                setShowAddModal(false);
                if (specialImageRef.current) {
                  specialImageRef.current.value = "";
                }
                setValues((prev) => ({
                  ...prev,
                  specialImage: "",
                  specialImageFile: null,
                }));
              })
              .catch((err) => {
                throw new Error(err);
              });
          },
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [setErrors, values]);

  const handleAddNotification = useCallback(async () => {
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
      if (!values.callToAction) {
        const textError = validateText(values?.callToAction);
        setErrors((prevState) => ({
          ...prevState,
          callToAction: textError,
        }));
      }
      if (values.callToAction) {
        const textError = validateOnlySpace(values?.callToAction);
        setErrors((prevState) => ({
          ...prevState,
          callToAction: textError,
        }));
        if (textError) return;
      }
      if (values.callToAction) {
        const textError = validateLength(values?.callToAction);
        setErrors((prevState) => ({
          ...prevState,
          callToAction: textError,
        }));
        if (textError) return;
      }
      if (
        values.title &&
        validateOnlySpace(values.title) === null &&
        validateLength(values.title) === null &&
        values.callToAction &&
        validateOnlySpace(values.callToAction) === null &&
        validateLength(values.callToAction) === null &&
        values.description &&
        validateOnlySpace(values.description) === null &&
        validateLength(values.description) === null
      ) {
        setLoading(true);
        setShowAddModal(false);
        await addDoc(collection(db, "notification"), {
          title: values.title?.trim(),
          description: values.description?.trim(),
          callToAction: values.callToAction,
          status: false,
          createdAt: new Date(),
        });
        setTimeout(() => {
          setLoading(false);
          toast.success("Notification Added Successfully!");
        }, 300);
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [setErrors, values]);

  return (
    <React.Fragment>
      <div className='justify-center items-center flex overflow-x-hidden pt-8 mb-4 overflow-y-auto fixed inset-0 z-99 outline-none focus:outline-none'>
        <div className='relative w-11/12 !rounded-[20px] md:w-auto my-6 mx-auto max-w-3xl'>
          <Transition.Root show={showAddModal} as={Fragment}>
            <Dialog
              as='div'
              className='relative z-10'
              onClose={setShowAddModal}
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
                          setShowAddModal(false);
                          if (storeImageRef.current) {
                            storeImageRef.current.value = "";
                          }
                          setValues((prev) => ({
                            ...prev,
                            storeImage: "",
                            storeImageFile: null,
                          }));
                          if (specialImageRef.current) {
                            specialImageRef.current.value = "";
                          }
                          setValues((prev) => ({
                            ...prev,
                            specialImage: "",
                            specialImageFile: null,
                          }));
                        }}
                      >
                        <RxCross2 />
                      </div>
                      <div className='flex flex-col justify-center items-center px-6 pt-8'>
                        <h1 className='text-c_050405 font-generalSansSemiBold text-center text-3xl mb-4 mt-4'>
                          {title}
                        </h1>

                        {window.location.pathname === "/notification" ? null : (
                          <div
                            className={`w-full h-32 relative flex flex-col items-center justify-center gap-y-2 bg-c_F9F9F9 ${
                              (errors?.storeImageError ||
                                errors?.specialImageError) &&
                              "border-red-700 border"
                            } ${
                              values?.storeImageFile ||
                              (values?.specialImageFile && "border-none")
                            } px-4 rounded-[10px]`}
                          >
                            {values?.storeImage || values?.specialImage ? (
                              <div className='image_container'>
                                <img
                                  src={values.storeImage || values.specialImage}
                                  alt='storeImage'
                                  className='h-20 w-26'
                                />
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
                              ref={
                                window.location.pathname === "/store"
                                  ? storeImageRef
                                  : window.location.pathname === "/special"
                                  ? specialImageRef
                                  : null
                              }
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
                            {values?.storeImage || values?.specialImage ? (
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
                        )}

                        <div className='w-full input_container'>
                          <div className='relative my-2'>
                            <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                              {window.location.pathname === "/store"
                                ? labels.storeName
                                : window.location.pathname === "/special"
                                ? labels.title
                                : window.location.pathname === "/notification"
                                ? labels.title
                                : null}
                            </label>
                            <Input
                              placeholder={
                                window.location.pathname === "/store"
                                  ? labels.typeStoreName
                                  : window.location.pathname === "/special"
                                  ? labels.typeTitleHere
                                  : window.location.pathname === "/notification"
                                  ? labels.typeNotificationTitle
                                  : null
                              }
                              onChange={(e) => {
                                if (window.location.pathname === "/store") {
                                  setErrors((prevState) => ({
                                    ...prevState,
                                    storeName: null,
                                  }));
                                  setValues((prevState) => ({
                                    ...prevState,
                                    storeName: e.target.value,
                                  }));
                                }
                                if (
                                  window.location.pathname === "/special" ||
                                  window.location.pathname === "/notification"
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
                              error={errors.title || errors.storeName}
                              errorText={errors.title || errors.storeName}
                              maxLength={25}
                              className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                            />
                          </div>
                          {window.location.pathname === "/special" && (
                            <div className='relative my-2'>
                              <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                {labels.location}
                              </label>
                              {loadingGetStoreItem ? (
                                <div className='w-full h-11 rounded-xl bg-c_F9F9F9 animate-pulse mt-1'></div>
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
                                  placeholder={labels.selectLocation}
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
                                className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                              />
                            </div>
                          )}
                          <div className='relative my-2'>
                            <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                              {window.location.pathname === "/store"
                                ? labels.location
                                : window.location.pathname === "/special"
                                ? labels.description
                                : window.location.pathname === "/notification"
                                ? labels.description
                                : null}
                            </label>
                            <Input
                              placeholder={
                                window.location.pathname === "/store"
                                  ? labels.typeLocationHere
                                  : window.location.pathname === "/special"
                                  ? labels.typeDescriptionHere
                                  : window.location.pathname === "/notification"
                                  ? labels.typeDescriptionHere
                                  : null
                              }
                              onChange={(e) => {
                                if (window.location.pathname === "/store") {
                                  setErrors((prevState) => ({
                                    ...prevState,
                                    storeLocation: null,
                                  }));
                                  setValues((prevState) => ({
                                    ...prevState,
                                    storeLocation: e.target.value,
                                  }));
                                }
                                if (
                                  window.location.pathname === "/special" ||
                                  window.location.pathname === "/notification"
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
                              error={errors.storeLocation || errors.description}
                              errorText={
                                errors.storeLocation || errors.description
                              }
                              maxLength={
                                window.location.pathname === "/store"
                                  ? 40
                                  : window.location.pathname === "/special"
                                  ? 80
                                  : 40
                              }
                              className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                            />
                          </div>
                          {window.location.pathname === "/store" && (
                            <div className='relative my-2'>
                              <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                {labels.OrderUrl}
                              </label>
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
                                className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                              />
                            </div>
                          )}
                          {window.location.pathname === "/notification" && (
                            <div className='relative my-2'>
                              <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                {labels.callToAction}
                              </label>
                              <Input
                                placeholder={labels.typeUrlHere}
                                onChange={(e) => {
                                  setErrors((prevState) => ({
                                    ...prevState,
                                    callToAction: null,
                                  }));
                                  setValues((prevState) => ({
                                    ...prevState,
                                    callToAction: e.target.value,
                                  }));
                                }}
                                error={errors.callToAction}
                                errorText={errors.callToAction}
                                className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                              />
                            </div>
                          )}
                          {window.location.pathname === "/store" && (
                            <div className='lat_long_container flex justify-center gap-x-4'>
                              <div className='relative'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.latitude}
                                </label>
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
                                  className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                />
                              </div>
                              <div className='relative'>
                                <label className='capitalize text-c_0E1014 text-sm font-generalSansMedium'>
                                  {labels.longitude}
                                </label>
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
                                  className={`w-full mt-1 bg-c_fff text-c_000 outline-none rounded-xl pl-4 py-2 border border-c_E2E2E2`}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={
                            window.location.pathname === "/store"
                              ? handleAddStore
                              : window.location.pathname === "/special"
                              ? handleAddSpecialItem
                              : window.location.pathname === "/notification"
                              ? handleAddNotification
                              : null
                          }
                          loading={loading}
                          disabled={loading}
                          className={
                            "w-full bg-c_ED3237 rounded-xl px-8 py-3 md:px-20 font-generalSansRegular my-4 text-c_fff"
                          }
                          label={
                            window.location.pathname === "/store"
                              ? labels.addNewStore
                              : window.location.pathname === "/special"
                              ? labels.addNewSpecial
                              : window.location.pathname === "/notification"
                              ? labels.sendNotification
                              : null
                          }
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
  );
}
