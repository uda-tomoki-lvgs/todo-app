"use client";

import TodoForm from "@/app/components/todo-form";
import TodoList from "@/app/components/todo-list";
import Logo from "@/app/components/logo";
import UserInfo from "@/app/components/UserInfo";
import { useUserInfo, UserInfoContext } from "@/app/hooks/useUserInfo";

const Home = () => {
    // useContextを実行
    // サイト全体のレンダリングで1回しか実行しないようにする
    const { userInfo } = useUserInfo();

    return (
        <div className="site-wrapper">
            <UserInfoContext.Provider value={userInfo}>
                <div className="header-wrapper">
                    <Logo />
                    <UserInfo />
                </div>
                {userInfo !== null ? (
                    <div className="main-wrapper">
                        <div className="list-of-tasks">タスク一覧</div>
                        <div className="form-wrapper">
                            <TodoForm />
                            <TodoList />
                        </div>
                    </div>
                ) : null}
            </UserInfoContext.Provider>
        </div>
    );
};

export default Home;
