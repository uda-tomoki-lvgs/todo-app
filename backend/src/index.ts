import { serve } from '@hono/node-server';
import { Hono, type Context } from 'hono';
import type { BlankEnv, BlankInput } from 'hono/types';
import { cors } from 'hono/cors';
import { createNewTable } from './database/create.ts';
import { readAllTasks } from './database/read.ts';
import {
	addNewTask,
	updateTask,
	deleteTask,
	changeTaskState,
} from './database/write.ts';
import { google } from 'googleapis';

import * as dotenv from 'dotenv';
import { HTTPException } from 'hono/http-exception';
import { error } from 'console';
dotenv.config();

const app = new Hono();

// Google OAuth 2.0
const oauth2client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URL
);

interface Credentials {
	refresh_token?: string | null;
	expiry_date?: number | null;
	access_token?: string | null;
	token_type?: string | null;
	id_token?: string | null;
	scope?: string;
}

export interface TokenPayload {
	iss: string;
	at_hash?: string;
	email_verified?: boolean;
	sub: string;
	azp?: string;
	email?: string;
	profile?: string;
	picture?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	aud: string;
	iat: number;
	exp: number;
	nonce?: string;
	hd?: string;
	locale?: string;
}

// アクセストークンを保持する変数
let userCredential: Credentials = {};

// なかったらデータベースを作成
await createNewTable(
	'users',
	`CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
		user_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
		email VARCHAR(255),
		picture VARCHAR(511),
        PRIMARY KEY (id),
		UNIQUE KEY (user_id)
    )`
);
await createNewTable(
	'tasks',
	`CREATE TABLE tasks (
        id INT NOT NULL AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        task VARCHAR(1023) NOT NULL,
        done_flag BOOLEAN NOT NULL DEFAULT FALSE,
        created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
		UNIQUE KEY (user_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    )`
);

// データベースからタスクをロード
// これを自在に変えられるようにしたい
// usersテーブルをid, name, email
const user_id = 1;

// フロントエンドからのCORSを許可
app.use(
	cors({
		origin: ['http://localhost:826', 'http://frontend:826'],
		allowMethods: ['GET', 'POST', 'PUT'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);

// Todo一覧取得API(getメソッド)
app.get('/api/todos', async (c) => c.json(await readAllTasks(user_id)));

// Todo登録API(postメソッド)
app.post('/api/todos', async (c) => {
	const { task } = await c.req.json<{ task: string }>();
	if (!task) {
		return c.json({ message: 'タイトルは必須です' }, 400);
	}
	await addNewTask(user_id, task);
	return c.json(200);
});

// Todo更新API(putメソッド)
app.put('/api/todos/:id', async (c) => {
	const id = Number(c.req.param('id'));
	if (Number.isNaN(id)) {
		return c.json({ message: '不正なidです' }, 400);
	}
	const { task } = await c.req.json<{ task: string }>();
	if (!task) {
		return c.json({ message: 'タイトルは必須です' }, 400);
	}
	await updateTask(user_id, id, task);
	return c.json(200);
});

// Todo削除API(putメソッド)
app.put('/api/todos/:id/delete', async (c) => {
	const id = Number(c.req.param('id'));
	if (Number.isNaN(id)) {
		return c.json({ message: '不正なidです' }, 400);
	}
	await deleteTask(user_id, id);
	return c.json(200);
});

// Todo状態変更API(putメソッド)
app.put('/api/todos/:id/change-task-state', async (c) => {
	const id = Number(c.req.param('id'));
	if (Number.isNaN(id)) {
		return c.json({ message: '不正なidです' }, 400);
	}
	await changeTaskState(user_id, id);
	return c.json(200);
});

// googleアカウントでログイン
app.get('/auth/login', async (c) => {
	const authorizationUrl = oauth2client.generateAuthUrl({
		access_type: 'offline', // リフレッシュトークンを取得
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'openid',
		],
	});
	return c.redirect(authorizationUrl);
});

// googleアカウントからログアウト
app.get('/auth/logout', async (c) => {
	userCredential = {};
	return c.json(200);
});

// 認証成功したらリダイレクト
app.get('/auth/success', async (c) => {
	const code: string | undefined = c.req.query('code');
	if (code === undefined) {
		throw new HTTPException(500, { message: 'cannot auth google account' });
	}

	const { tokens } = await oauth2client.getToken(code);
	oauth2client.setCredentials(tokens);
	userCredential = tokens;

	// ユーザー情報をSQLに登録
	const user = await verifyGoogleToken();

	return c.redirect('http://localhost:826/');
});

// トークンを送信して有効なアカウントか確認(JWT認証)
// Google Auth 2.0は、id_tokenメソッドがJWTになる
// そのJWTをGoogle側のエンドポイントに送信して検証
const verifyGoogleToken = async (): Promise<TokenPayload | null> => {
	try {
		if (
			userCredential.id_token === undefined ||
			userCredential.id_token === null
		) {
			return null;
		}

		// Google IDトークンを認証
		const ticket = await oauth2client.verifyIdToken({
			idToken: userCredential.id_token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		// トークンが有効ならデコードした情報を返す
		const payload = ticket.getPayload();
		if (payload === undefined) return null;

		return payload;
	} catch (err) {
		return null;
	}
};

// ログインされているか確認
app.get('/auth/status', async (c) => {
	const user = await verifyGoogleToken();
	console.log(user);
	if (user !== null) {
		return c.json({ message: 'Login' }, 200);
	} else {
		return c.json({ message: 'Logout' }, 401);
	}
});

// メールアドレスとユーザー名、アイコンを取得
app.get('/auth/userinfo', async (c) => {
	const payload = await verifyGoogleToken();
	if (payload === null) return c.json({ status: 'logout' }, 200);
	const userInfo = {
		email: payload.email,
		name: payload.name,
		picture: payload.picture,
	};
	return c.json({ status: 'login', payload: userInfo }, 200);
});

// HTTPサーバを起動
serve({
	fetch: app.fetch,
	port: Number(process.env.HONO_PORT),
});
