import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNewTable } from "@/database/create.ts";
import { readAllTasks } from "@/database/read.ts";
import {
    addNewTask,
    updateTask,
    deleteTask,
    changeTaskState,
} from "@/database/write.ts";

const app = new Hono();

// なかったらデータベースを作成
await createNewTable(
    "users",
    `CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        PRIMARY KEY (id)
    )`
);
await createNewTable(
    "tasks",
    `CREATE TABLE tasks (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        task VARCHAR(10000) NOT NULL,
        time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        done_flg BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`
);

// データベースからタスクをロード
const user_id = 1;

// フロントエンドからのCORSを許可
app.use(
    cors({
        origin: ["http://localhost:3000", "http://frontend:3000"],
        allowMethods: ["GET", "POST", "PUT"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Todo一覧取得API(getメソッド)
app.get("/api/todos", async (c) => c.json(await readAllTasks(user_id)));

// Todo登録API(postメソッド)
app.post("/api/todos", async (c) => {
    const { task } = await c.req.json<{ task: string }>();
    if (!task) {
        return c.json({ message: "タイトルは必須です" }, 400);
    }
    await addNewTask(user_id, task);
    return c.json(200);
});

// Todo更新API(putメソッド)
app.put("/api/todos/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) {
        return c.json({ message: "不正なidです" }, 400);
    }
    const { task } = await c.req.json<{ task: string }>();
    if (!task) {
        return c.json({ message: "タイトルは必須です" }, 400);
    }
    await updateTask(user_id, id, task);
    return c.json(200);
});

// Todo削除API(putメソッド)
app.put("/api/todos/:id/delete", async (c) => {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) {
        return c.json({ message: "不正なidです" }, 400);
    }
    await deleteTask(user_id, id);
    return c.json(200);
});

// Todo状態変更API(putメソッド)
app.put("/api/todos/:id/change-task-state", async (c) => {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) {
        return c.json({ message: "不正なidです" }, 400);
    }
    await changeTaskState(user_id, id);
    return c.json(200);
});

const port = 8000;
console.log(`Server is running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
