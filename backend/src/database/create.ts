import { query, existTable } from "@/database/pool.ts";

export const createNewTable = async (
    tableName: string,
    createTableQuery: string
) => {
    try {
        const existFlag = await existTable(tableName);
        if (!existFlag) {
            console.log("made new table");
            await query(createTableQuery);
        } else {
            console.log("already exists");
        }
    } catch (error) {
        console.error("failed to make new table", error);
        throw error;
    }
};
