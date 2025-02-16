import { useState, useEffect } from "react";
import { TodoType } from "@/app/types/todo";

export const useGetAllTodos = () => {
    const [todos, setTodos] = useState<TodoType[] | null>(null);

    // 全てのtodoを取得する
    const getAllTodos = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/api/todos`,
                {
                    cache: "no-store",
                }
            );
            const todosData = await response.json();
            setTodos(todosData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getAllTodos();
    }, []);

    console.log(todos);

    return { todos };
};
