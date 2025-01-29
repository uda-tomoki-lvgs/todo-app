import { query } from "@/database/pool.ts";
import type { Todo } from "@/type/todo.ts";

export const readAllTasks = async (user_id: number): Promise<Todo[]> => {
    const rows = await query(
        "SELECT id, task, done_flg FROM tasks WHERE user_id = ?",
        [user_id]
    );
    return rows[0];
};
