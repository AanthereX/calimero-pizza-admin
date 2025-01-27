import SearchIcon from "../assets/images/SearchIcon";
import labels from "../configs/Label";
import Input from "./Input";

const SearchBar = ({ value, onChange }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only"
      >
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon width={16} height={16} />
        </div>
        <Input
          type="search"
          value={value}
          onChange={onChange}
          id="default-search"
          className="block w-40 md:w-72 p-2.5 pl-10 text-sm text-c_B2B2B2 rounded-lg bg-c_fff placeholder:text-c_B2B2B2 placeholder:text-sm focus:outline-none"
          placeholder={labels.search}
        />
      </div>
    </form>
  );
};

export default SearchBar;
