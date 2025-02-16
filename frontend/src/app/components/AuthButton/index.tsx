"use client";

import { useRouter } from "next/navigation";

const AuthButton = () => {
    const router = useRouter();

    // Google認証する
    const handleGoogleAuth = async () => {
        try {
            // バックエンド経由
            router.push(`${process.env.NEXT_PUBLIC_HOST}/auth/login`);
        } catch (error) {
            console.error(error);
        }
    };

    return <button onClick={() => handleGoogleAuth()}>ログイン</button>;
};

export default AuthButton;
