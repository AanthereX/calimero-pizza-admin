import React, { useEffect, useState } from "react";
import labels from "../configs/Label/index.js";
import NotificationIcon from "../assets/images/NotificationIcon.jsx";
import SpecialStarIcon from "../assets/images/SpecialStarIcon.jsx";
import FeedbackIcon from "../assets/images/FeedbackIcon.jsx";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../configs/firebase/index.js";

const Home = () => {
  const [loadingGetFeedbackItem, setLoadingGetFeedbackItem] = useState(false);
  const [loadingGetSpecialItem, setLoadingGetSpecialItem] = useState(false);
  const [loadingGetNotificationItem, setLoadingGetNotificationItem] =
    useState(false);
  const [feedbackItemCount, setFeedbackItemCount] = useState([]);
  const [specialItemCount, setSpecialItemCount] = useState([]);
  const [notificationItemCount, setNotificationItemCount] = useState([]);

  useEffect(() => {
    setLoadingGetFeedbackItem(true);
    const q = query(collection(db, "feedback"));
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let feedbackItemArray = [];
      QuerySnapshot.forEach((doc) => {
        feedbackItemArray.push({ ...doc.data(), id: doc.id });
      });
      setFeedbackItemCount(feedbackItemArray.length);
      setTimeout(() => {
        setLoadingGetFeedbackItem(false);
      }, 250);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setLoadingGetSpecialItem(true);
    const q = query(collection(db, "specials"));
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let specialItemArray = [];
      QuerySnapshot.forEach((doc) => {
        specialItemArray.push({ ...doc.data(), id: doc.id });
      });
      setSpecialItemCount(specialItemArray.length);
      setTimeout(() => {
        setLoadingGetSpecialItem(false);
      }, 250);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setLoadingGetNotificationItem(true);
    const q = query(collection(db, "notification"));
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      let notificationItemArray = [];
      QuerySnapshot.forEach((doc) => {
        notificationItemArray.push({ ...doc.data(), id: doc.id });
      });
      setNotificationItemCount(notificationItemArray.length);
      setTimeout(() => {
        setLoadingGetNotificationItem(false);
      }, 250);
    });
    return () => unsub();
  }, []);

  function handleAboveThousand(count) {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    } else {
      return Number(count);
    }
  }

  const Card = ({ icon, feedback, title, href }) => {
    return (
      <div className="bg-c_FDFDFD card_container px-8 py-2 rounded-xl col-span-12 md:col-span-4 mr-4 my-4 md:my-0">
        <a href={href}>
          <div className="my-4">{icon}</div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-c_0E1014 text-[22px] font-generalSansSemiBold">
              {title}
            </p>
            {loadingGetFeedbackItem ||
            loadingGetNotificationItem ||
            loadingGetSpecialItem ? (
              <div className="w-8 h-4 rounded-xl bg-c_F9F9F9 animate-pulse"></div>
            ) : (
              <p className="text-c_909193 text-[20px]">
                {handleAboveThousand(feedback)}
              </p>
            )}
          </div>
        </a>
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className="heading_container">
        <p className="text-f_32 text-c_000 font-generalSansSemiBold">
          {labels.dashboard}
        </p>
      </div>
      <div className="grid grid-cols-12 my-4">
        <Card
          title={labels.specials}
          icon={<SpecialStarIcon width={24} height={24} color={"#0F4B32"} />}
          feedback={specialItemCount >= 1 ? specialItemCount : "0"}
          href={"/special"}
        />
        <Card
          title={labels.notification}
          icon={<NotificationIcon width={24} height={24} color={"#0F4B32"} />}
          feedback={notificationItemCount >= 1 ? notificationItemCount : "0"}
          href={"/notification"}
        />
        <Card
          title={labels.feedback}
          icon={<FeedbackIcon width={24} height={24} color={"#0F4B32"} />}
          feedback={feedbackItemCount >= 1 ? feedbackItemCount : "0"}
          href={"/feedback"}
        />
      </div>
    </React.Fragment>
  );
};

export default Home;
