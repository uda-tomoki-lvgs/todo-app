import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNewTable } from "./database/create.ts";
import { readAllTasks } from "./database/read.ts";
import {
    addNewTask,
    updateTask,
    deleteTask,
    changeTaskState,
} from "./database/write.ts";
import { google } from "googleapis";

import * as dotenv from "dotenv";
import { HTTPException } from "hono/http-exception";
dotenv.config();

const app = new Hono();

interface Credentials {
    refresh_token?: string | null;
    expiry_date?: number | null;
    access_token?: string | null;
    token_type?: string | null;
    id_token?: string | null;
    scope?: string;
}

// アクセストークンを保持する変数
let userCredential: Credentials = {};

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
        done_flag BOOLEAN NOT NULL DEFAULT FALSE,
        created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`
);

// データベースからタスクをロード
// これを自在に変えられるようにしたい
// usersテーブルをid, name, email, ハッシュ化されたpassword
const user_id = 1;

// フロントエンドからのCORSを許可
app.use(
    cors({
        origin: ["http://localhost:826", "http://frontend:826"],
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

// google認証
app.get("/auth/login", async (c) => {
    const oauth2client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
    );
    const authorizationUrl = oauth2client.generateAuthUrl({
        access_type: "offline", // リフレッシュトークンを取得
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "openid",
        ],
    });
    return c.redirect(authorizationUrl);
});

// 認証成功したらリダイレクト
app.get("/auth/success", async (c) => {
    const oauth2client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
    );

    const code: string | undefined = c.req.query("code");
    if (code === undefined) {
        throw new HTTPException(500, { message: "cannot auth google account" });
    }

    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);
    userCredential = tokens;

    console.log(code);
    console.log("access_token", userCredential.access_token);
    console.log("refresh_token", userCredential.refresh_token);

    return c.redirect("http://localhost:826/");
});

// メールアドレスとユーザー名を取得
app.get("/auth/userinfo", async (c) => {
    return c.json(200);
});

const port = 2025;
console.log(`Server is running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
