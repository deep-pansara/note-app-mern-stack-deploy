import moment from "moment";
import { MdCreate, MdDelete } from "react-icons/md";

function NoteCard({ title, date, content, tags, onEdit, onDelete }) {
  return (
    <div className="border rounded-md p-4 bg-white hover:shadow-xl transition-all ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-md font-bold">{title}</h6>
          <span className="text-xs text-slate-500">
            {moment(date).format("Do MMM YYYY")}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-2">{content?.slice(0, 60)}</p>

      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500 overflow-y-scroll no-scrollbar">
          {tags?.map((item, i) => {
            return (
              <span
                className="bg-slate-100 text-black mr-1 text-sm rounded px-1"
                key={i}
              >
                #{item}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <MdCreate
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
          />

          <MdDelete
            className="icon-btn hover:text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
export default NoteCard;
