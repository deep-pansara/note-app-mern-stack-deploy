import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";

function TagInput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = e => {
    setInputValue(e.target.value);
  };

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      addNewTag();
      setInputValue("");
    }
  };

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex items-center justify-normal gap-2 flex-wrap mt-2 overflow-y-auto">
          {tags.map((tag, index) => {
            return (
              <span
                key={index}
                className="flex gap-2 items-center bg-slate-200 text-xs py-1 px-2 rounded shadow-md font-semibold"
              >
                #{tag}
                <button
                  onClick={() => {
                    handleRemoveTag(tag);
                  }}
                >
                  <MdClose />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          className="text-sm bg-transparent border px-3 py-2 rounded outline-none"
          placeholder="Add Tags"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
        />
        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-blue-700  hover:bg-blue-200"
          onClick={() => {
            addNewTag();
          }}
        >
          <MdAdd className="text-2xl text-black-700" />
        </button>
      </div>
    </div>
  );
}
export default TagInput;
