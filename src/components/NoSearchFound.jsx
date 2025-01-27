import NoSearchFoundImage from "../assets/images/NoSearchFoundImage.jsx";

const NoSearchFound = ({ entity }) => {
  return (
    <div className="min-h-screen flex flex-col gap-y-2 items-center justify-center pb-40">
      <NoSearchFoundImage color={"#ED3237"} width={48} height={48} />
      <p className="text-base font-medium">
        {`No Search Found in `}
        <span className="text-c_ED3237 text-xl">{`"${entity}"`}</span>
      </p>
    </div>
  );
};

export default NoSearchFound;
