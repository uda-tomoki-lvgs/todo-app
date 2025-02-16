import { TodoType } from "@/app/types/todo";

const getAllTodos = async (): Promise<TodoType[]> => {
    const response = await fetch(`${process.env.HOST}/api/todos`, {
        cache: "no-store",
    });
    const data = await response.json();
    return data;
};

export default getAllTodos;
