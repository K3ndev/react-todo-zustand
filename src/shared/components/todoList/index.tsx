import { useRef, useMemo, FormEvent } from "react";
import { useTodoStore } from "../../store/todoStore";
import { DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";
import _ from "lodash";
// types
type todoListType = {
  id: number;
  isChecked: boolean;
  list: string;
};
type categoryType = {
  id: number;
  categoryName: string;
  isUsed: boolean;
  todoList: todoListType[];
};

type storeType = {
  categoryList: categoryType[];
  addList: (argTodoList: todoListType) => void;
  removeList: (argTodoList: todoListType) => void;
  changeIsChecked: (argTodoList: todoListType) => void;
};
export function TodoList() {
  // states
  const inputTodoRef = useRef<HTMLInputElement>(null);

  // get uniqueID
  const getUniqueId = () => {
    return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
  };

  // zustand, global states
  const { categoryList, addList, removeList, changeIsChecked } =
    useTodoStore<storeType>((states) => states);

  // return an index, data, and length of the chosen category of the user
  const currentUsed = useMemo(() => {
    const index = categoryList
      .map((item: categoryType) => item.isUsed)
      .indexOf(true);
    const data = categoryList.filter((item: categoryType) => item.isUsed);

    const deepClone = _.cloneDeep(categoryList[index]?.todoList);
    const reverseList = deepClone?.reverse();

    return { index, length: data.length, reverseList };
  }, [categoryList]);

  function onSubmitHandler(
    event: FormEvent<HTMLFormElement>,
    inputValue: string
  ) {
    event.preventDefault();
    if (inputTodoRef.current) {
      if (inputTodoRef.current.value === "") {
        return;
      }
      if (DOMPurify.sanitize(inputTodoRef.current.value) === "") {
        inputTodoRef.current.value = "";
        return;
      }
    }
    const checkerList = (): boolean => {
      return currentUsed.reverseList.some((item: todoListType) => {
        return item.list === inputValue;
      });
    };

    if (!checkerList()) {
      addList({ id: getUniqueId(), isChecked: false, list: inputValue });
    }
    if (inputTodoRef.current) {
      inputTodoRef.current.value = "";
    }
  }

  // removing a list
  function removeTodoList(argTodoList: todoListType) {
    removeList(argTodoList);
  }

  // changing the isChecked to true or false
  function changeChecked(argList: todoListType) {
    changeIsChecked(argList);
  }
  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <form
        action="#"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          if (inputTodoRef.current) {
            onSubmitHandler(event, inputTodoRef.current.value);
          }
        }}
        className="w-full"
      >
        <label htmlFor="todoList">
          <div className="w-full">
            <input
              disabled={!currentUsed.length}
              autoComplete="off"
              // {...register("todoList")}
              placeholder="Write a new task..."
              className="h-11 w-full rounded-2xl bg-[#D9D9D9] px-6 py-4 text-xs font-normal outline-0 placeholder:text-xs placeholder:font-normal focus:bg-white md:text-sm placeholder:md:text-sm lg:h-16 lg:text-base placeholder:lg:text-base"
              ref={inputTodoRef}
            />
          </div>
        </label>
      </form>

      {/* list */}
      <div className="scrollbar-hide flex h-[68vh] w-full flex-col gap-3 overflow-auto">
        {/*  */}
        {currentUsed.reverseList?.map((item: todoListType) => {
          return (
            <div
              key={getUniqueId()}
              className="flex items-center min-w-full px-6 py-4 bg-white rounded-2xl"
            >
              <div className="flex items-center w-full h-auto gap-4">
                {!item.isChecked ? (
                  <div
                    onClick={() => {
                      changeChecked(item);
                    }}
                    className="h-[1.25rem] w-[1.25rem] cursor-pointer rounded-lg bg-[#D9D9D9] md:h-[1.813rem] md:w-[1.813rem] md:rounded-[0.625rem]"
                  />
                ) : (
                  <div
                    onClick={() => {
                      changeChecked(item);
                    }}
                    className="flex h-[1.25rem] w-[1.25rem] cursor-pointer items-center justify-center rounded-lg bg-black md:h-[1.813rem] md:w-[1.813rem] md:rounded-[0.625rem]"
                  >
                    <CheckOutlined className="text-white scale-75 md:scale-100" />
                  </div>
                )}
                <p
                  className={`${
                    item.isChecked && "line-through decoration-2"
                  } w-full break-all text-xs font-normal md:text-sm lg:text-base`}
                >
                  {item.list}
                </p>
              </div>
              <button
                onClick={() => {
                  removeTodoList(item);
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#EB4747]"
              >
                <DeleteOutlined className="text-center" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
