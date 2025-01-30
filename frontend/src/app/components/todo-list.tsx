import { Todo as TodoType } from "@/app/types/todo";
import Todo from "@/app/components/todo";

interface TodoListProps {
    todos: TodoType[];
}

const TodoList = ({ todos }: TodoListProps) => {
    const restTask = todos.reduce((acc: number, todo: TodoType): number => {
        return !todo.done_flag ? acc + 1 : acc;
    }, 0);

    return (
        <div className="todolist-wrapper">
            <div className="todolist-header">残りタスク {restTask}個</div>
            <div className="todolist-body">
                {todos.map((todo) => (
                    <Todo key={todo.id} todo={todo} />
                ))}
            </div>
        </div>
    );
};

export default TodoList;
