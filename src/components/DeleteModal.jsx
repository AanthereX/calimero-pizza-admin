import { memo } from "react";
import DeleteIcon from "../assets/images/DeleteIcon";
const DeleteModal = ({ modalTitle, handleNo, handleYes }) => {
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden pt-8 mb-4 overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-11/12 !rounded-[20px] md:w-auto my-6 mx-auto max-w-3xl">
          <div className="flex flex-col w-full outline-none focus:outline-none">
            <div className="bg-c_E2E2E2 relative !rounded-t-[20px] px-8 md:px-12 pt-4 flex-auto">
              <div className="flex items-center justify-center">
                <DeleteIcon width={48} height={48} color={"#ED3237"} />
              </div>
              <p className="my-4 text-center text-c_000 font-generalSansRegular text-md">
                {modalTitle}
              </p>
            </div>

            <div className="bg-c_E2E2E2 flex !rounded-b-[20px] items-center justify-center px-5 pb-4">
              <button
                className="bg-c_fff rounded-md text-c_000 background-transparent font-generalSansRegular capitialize px-6 py-1 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleNo}
              >
                No
              </button>
              <button
                className="bg-c_ED3237 rounded-md text-c_fff background-transparent font-generalSansRegular capitalize text-sm px-6 py-1 outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleYes}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-c_000"></div>
    </>
  );
};

export default memo(DeleteModal);
