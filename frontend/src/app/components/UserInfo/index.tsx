"use client";

import { UserInfoContext } from "@/app/hooks/useUserInfo";
import { useRouter } from "next/navigation";
import { useContext } from "react";

const UserInfo = () => {
    const router = useRouter();
    const userInfo = useContext(UserInfoContext);

    // Google認証する
    const handleLogin = async () => {
        try {
            router.push(`${process.env.NEXT_PUBLIC_HOST}/auth/login`);
        } catch (error) {
            console.error(error);
        }
    };

    // ログアウトする
    const handleLogout = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/auth/logout`,
                {
                    cache: "no-store",
                }
            );
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (userInfo !== null) {
        return (
            <div>
                {userInfo.email}
                <button onClick={() => handleLogout()}>ログアウト</button>
            </div>
        );
    } else {
        return (
            <div>
                <button onClick={() => handleLogin()}>ログイン</button>
            </div>
        );
    }
};

export default UserInfo;
