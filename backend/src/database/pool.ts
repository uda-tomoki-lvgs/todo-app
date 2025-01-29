import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

// poolの初期設定
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// クエリを実行
export const query = async (sql: string, values?: (string | number)[]) => {
    try {
        const rows = (await pool.execute(sql, values)) as any[];
        return rows;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
};

// テーブルが存在するか確認
export const existTable = async (tablename: string) => {
    let tableExists = false;
    try {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS count 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = ?`,
            [process.env.MYSQL_DATABASE, tablename]
        );
        if ((rows as any)[0].count > 0) {
            tableExists = true;
        }
    } catch (error) {
        console.error("Error checking table existence:", error);
        throw error;
    }
    return tableExists;
};

// exit時にpoolを終了
process.on("exit", async () => {
    try {
        await pool.end();
        console.log("Database connection pool closed.");
    } catch (err) {
        console.error("Error closing connection pool:", err);
    }
});

// Ctrl+Cでexit関数を呼び出す
process.on("SIGINT", async () => {
    process.exit(0);
});
