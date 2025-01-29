import { Todo as TodoType } from "@/app/types/todo";
import Todo from "@/app/components/todo";

interface TodoListProps {
    todos: TodoType[];
}

const TodoList = ({ todos }: TodoListProps) => {
    return (
        <div className="todolist-wrapper">
            <div className="todolist-header">残りタスク {todos.length}個</div>
            <div className="todolist-body">
                {todos.map((todo) => (
                    <Todo key={todo.id} todo={todo} />
                ))}
            </div>
        </div>
    );
};

export default TodoList;
