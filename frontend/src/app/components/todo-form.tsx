"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import "@/app/globals.css";

const formSchema = z.object({
    task: z
        .string()
        .min(1, { message: "タイトルは1文字以上入力してください。" }),
});

const TodoForm = () => {
    // ルーティングを管理
    const router = useRouter();

    // フォームのスキーマ
    const { control, handleSubmit, reset } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            task: "",
        }, // 初期値(reset()で初期値に戻せる)
    });

    // 送信ボタンを押したら
    const onSubmit = async (value: z.infer<typeof formSchema>) => {
        const { task } = value;
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/api/todos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                    body: JSON.stringify({ task }),
                }
            );
            if (!response.ok) {
                throw new Error("サーバエラーが発生しました。");
            }
            reset();
            router.refresh();
        } catch (error) {
            console.error("フォーム送信エラー:", error);
        }
    };

    return (
        <form className="todo-form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="task"
                control={control}
                render={({ field }) => (
                    <div className="todo-form-wrapper">
                        <input
                            className="todo-form-input"
                            placeholder="新規タスク"
                            {...field}
                        />
                        <div className="todo-form-underline"></div>
                    </div>
                )}
            />
            <button className="normal-button" type="submit">
                追加
            </button>
        </form>
    );
};

export default TodoForm;
