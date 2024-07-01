import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

function SearchBar({ value, onChange, handleSearch, onClearSearch }) {
  return (
    <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md ">
      <input
        type="text"
        placeholder="Search ToDos"
        className="w-full bg-transparent py-[11px] outline-none text-md font-semibold"
        value={value}
        onChange={onChange}
      />
      {value && (
        <IoMdClose
          className="text-xl text-slate-500 cursor-pointer hover:text-black mr-3"
          onClick={onClearSearch}
        />
      )}
      <FaMagnifyingGlass
        className="text-slate-400 cursor-pointer hover:text-black mx-1"
        onClick={handleSearch}
      />
    </div>
  );
}
export default SearchBar;
