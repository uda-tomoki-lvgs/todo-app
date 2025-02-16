import { useState, useEffect, createContext } from "react";

export type userInfoType = {
    email: string;
    name: string;
    picture: string;
};

export const UserInfoContext = createContext<userInfoType | null>(null);

export const useUserInfo = () => {
    // ユーザー情報を記録
    const [userInfo, setUserInfo] = useState<userInfoType | null>(null);

    // ユーザー情報を取得
    useEffect(() => {
        const fetchUserInfo = async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/auth/userinfo`,
                {
                    cache: "no-store",
                }
            );
            const data = await response.json();

            if (data.status === "login") {
                setUserInfo(data.payload);
            } else {
                setUserInfo(null);
            }
        };
        fetchUserInfo();
    }, []);

    return { userInfo };
};
