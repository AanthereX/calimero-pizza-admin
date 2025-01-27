import React from "react";
import labels from "../configs/Label";
import Button from "./Button";
import { FiPlus } from "react-icons/fi";

export default function AddNewItem({ setShowAddModal, btnTitle, title }) {
  const plusIcon = <FiPlus />;
  return (
    <React.Fragment>
      <div className="flex flex-col items-center justify-center mb-32">
        <p className="text-[28px] my-4 text-c_121516 font-generalSansMedium">
          {title}
        </p>
        {window.location.pathname === "/feedback" ? null : (
          <Button
            onClick={() => setShowAddModal((prev) => !prev)}
            label={btnTitle}
            className={`text-c_fff w-fit rounded-xl bg-c_ED3237 py-3 px-8`}
            icon={plusIcon}
          />
        )}
      </div>
    </React.Fragment>
  );
}
