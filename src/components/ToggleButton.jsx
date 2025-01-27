import Input from "./Input.jsx";

const ToggleBtn = ({ value, onChange, onClick, defaultChecked }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <Input
        type="checkbox"
        defaultChecked={defaultChecked}
        value={value}
        onChange={onChange}
        onClick={onClick}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-c_C6C6C6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-c_F9F9F9 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-c_0F4B32"></div>
    </label>
  );
};

export default ToggleBtn;
