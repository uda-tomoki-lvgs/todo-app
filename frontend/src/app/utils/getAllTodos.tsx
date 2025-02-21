import { TodoType } from "../types/todo";

export const getAllTodos = async () => {
    try {
        const response = await fetch(`${process.env.HOST}/api/todos`, {
            cache: "no-store",
        });
        const todosData: TodoType[] = await response.json();
        return todosData;
    } catch (error) {
        console.error(error);
    }
};
