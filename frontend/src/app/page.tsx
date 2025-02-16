import getAllTodos from "@/app/actions/todo";
import { Todo as TodoType } from "@/app/types/todo";
import TodoForm from "@/app/components/todo-form";
import TodoList from "@/app/components/todo-list";
import Logo from "@/app/components/logo";
import AuthButton from "@/app/components/AuthButton";

const Home = async () => {
    const todos: TodoType[] = await getAllTodos();

    return (
        <div className="site-wrapper">
            <Logo />
            <AuthButton />
            <div className="main-wrapper">
                <div className="list-of-tasks">タスク一覧</div>
                <div className="form-wrapper">
                    <TodoForm />
                    <TodoList todos={todos} />
                </div>
            </div>
        </div>
    );
};

export default Home;
