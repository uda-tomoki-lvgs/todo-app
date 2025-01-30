import { query } from "./pool.ts";

export const addNewTask = async (user_id: number, task: string) => {
    await query("INSERT INTO tasks (user_id, task) VALUES (?, ?)", [
        user_id,
        task,
    ]);
};

export const updateTask = async (user_id: number, id: number, task: string) => {
    await query("UPDATE tasks SET task = ? WHERE user_id = ? AND id = ?", [
        task,
        user_id,
        id,
    ]);
};

export const deleteTask = async (user_id: number, id: number) => {
    await query("DELETE FROM tasks WHERE user_id = ? AND id = ?", [
        user_id,
        id,
    ]);
};

export const changeTaskState = async (user_id: number, id: number) => {
    await query(
        "UPDATE tasks SET done_flag = NOT done_flag WHERE user_id = ? AND id = ?",
        [user_id, id]
    );
};
