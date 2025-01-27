import React, { memo } from "react";
import Button from "./Button";
import SearchBar from "./SearchBar";
import { FiPlus } from "react-icons/fi";

const TableHeader = ({
  title,
  setShowAddModal,
  search,
  setSearch,
  specialItemCount,
}) => {
  const plusIcon = <FiPlus />;

  return (
    <React.Fragment>
      <div className="flex justify-between py-4">
        <div className="header_heading_cont">
          <p className="flex items-center gap-x-4 text-c_000 text-f_32 font-generalSansSemiBold">
            {title}
            {window.location.pathname === "/special" && specialItemCount ? (
              <span className="text-c_909193 text-f_22 font-generalSansRegular">
                {`(${specialItemCount})`}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {window.location.pathname === "/feedback" ? null : (
            <Button
              onClick={() => setShowAddModal((prev) => !prev)}
              icon={plusIcon}
              className={`text-c_fff text-[18px] bg-c_ED3237 px-3.5 py-3 rounded-xl`}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default memo(TableHeader);
