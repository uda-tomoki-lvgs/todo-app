"use client";

import { useState } from "react";
import { Todo as TodoType } from "@/app/types/todo";
import Todo from "@/app/components/todo";

interface TodoListProps {
    todos: TodoType[];
}

const TodoList = ({ todos }: TodoListProps) => {
    // 完了したタスクを非表示にするか
    const [isHideCheckedTasks, setIsHideCheckedTasks] =
        useState<boolean>(false);
    const handleHideCheckedTasks = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setIsHideCheckedTasks(event.target.checked);
    };

    // 日時や名前で並び替え
    const [selectedSortOption, setSelectedSortOption] =
        useState<string>("new-create");
    const handleSortOption = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSortOption(event.target.value);
    };
    const sortTodoList = () => {
        console.log(selectedSortOption);
        if (selectedSortOption === "new-create") {
            todos = todos.sort(
                (a, b) =>
                    new Date(b.created_time).getTime() -
                    new Date(a.created_time).getTime()
            );
        } else if (selectedSortOption === "old-create") {
            todos = todos.sort(
                (a, b) =>
                    new Date(a.created_time).getTime() -
                    new Date(b.created_time).getTime()
            );
        } else if (selectedSortOption === "new-update") {
            todos = todos.sort(
                (a, b) =>
                    new Date(b.updated_time).getTime() -
                    new Date(a.updated_time).getTime()
            );
        } else if (selectedSortOption === "old-update") {
            todos = todos.sort(
                (a, b) =>
                    new Date(a.updated_time).getTime() -
                    new Date(b.updated_time).getTime()
            );
        } else if (selectedSortOption === "descend-name") {
            todos = todos.sort((a, b) => a.task.localeCompare(b.task));
        } else if (selectedSortOption === "ascend-name") {
            todos = todos.sort((a, b) => b.task.localeCompare(a.task));
        }
    };
    sortTodoList();

    // Propsから残りタスク数を算出
    const restTask = todos.reduce((acc: number, todo: TodoType): number => {
        return !todo.done_flag ? acc + 1 : acc;
    }, 0);

    return (
        <div className="todolist-wrapper">
            <div className="todolist-header">
                <div className="rest-tasks-wrapper">
                    残りタスク {restTask}個
                </div>
                <div className="right-header-wrapper">
                    <div className="hide-checked-wrapper">
                        <input
                            type="checkbox"
                            id="hide-checked"
                            name="hide-checked"
                            checked={isHideCheckedTasks}
                            onChange={handleHideCheckedTasks}
                        />
                        <label htmlFor="hide-checked">
                            完了したタスクを非表示
                        </label>
                    </div>
                    <select
                        className="tasks-order-wrapper"
                        name="tasks-order"
                        value={selectedSortOption}
                        onChange={handleSortOption}
                    >
                        <option value="new-create">作成順 (新しい)</option>
                        <option value="old-create">作成順 (古い)</option>
                        <option value="new-update">更新順 (新しい)</option>
                        <option value="old-update">更新順 (古い)</option>
                        <option value="descend-name">名前順 (A-Z あ-ん)</option>
                        <option value="ascend-name">名前順 (ん-あ Z-A)</option>
                    </select>
                </div>
            </div>
            <div className="todolist-body">
                {todos.map((todo) =>
                    !isHideCheckedTasks || !todo.done_flag ? (
                        <Todo key={todo.id} todo={todo} />
                    ) : null
                )}
            </div>
        </div>
    );
};

export default TodoList;
