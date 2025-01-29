import { Todo } from "@/app/types/todo";

const getAllTodos = async (): Promise<Todo[]> => {
    console.log(`${process.env.HOST}/api/todos`);
    const response = await fetch(`${process.env.HOST}/api/todos`, {
        cache: "no-store",
    });
    const data = await response.json();
    return data;
};

export default getAllTodos;
