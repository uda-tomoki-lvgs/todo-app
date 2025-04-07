import TodoForm from "@/app/components/todo-form";
import TodoList from "@/app/components/todo-list";
import Logo from "@/app/components/logo";
import UserInfo from "@/app/components/UserInfo";
import { getAllTodos } from "@/app/utils/getAllTodos";

const Home = async () => {
    // Todoを取得
    const todos = await getAllTodos();

    return (
        <div className="site-wrapper">
            <div className="header-wrapper">
                <Logo />
                {/* <UserInfo /> */}
            </div>
            <div className="main-wrapper">
                <div className="list-of-tasks">タスク一覧</div>
                <div className="form-wrapper">
                    <TodoForm />
                    {todos !== undefined ? <TodoList todos={todos} /> : null}
                </div>
            </div>
        </div>
    );
};

export default Home;
