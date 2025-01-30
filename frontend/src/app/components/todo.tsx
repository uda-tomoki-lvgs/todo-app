"use client";

import { Todo as TodoType } from "@/app/types/todo";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface TodoProps {
    todo: TodoType;
}

const formSchema = z.object({
    task: z
        .string()
        .min(1, { message: "タイトルは1文字以上入力してください。" }),
});

const Todo = ({ todo }: TodoProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const { control, handleSubmit } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            task: todo.task,
        },
    });

    const onSubmit = async (value: z.infer<typeof formSchema>) => {
        const { task } = value;
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/api/todos/${todo.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                    body: JSON.stringify({ task }),
                }
            );

            if (!response.ok) {
                throw new Error("サーバエラーが発生しました。");
            }
            router.refresh();
            setIsEditing(false);
        } catch (error) {
            console.error("フォーム送信エラー:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (isEditing) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/api/todos/${id}/delete`,
                {
                    method: "PUT",
                    cache: "no-store",
                }
            );
            if (!res.ok) {
                throw new Error("Todo削除に失敗しました");
            }
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = () => {
        if (isEditing) return;
        setIsEditing(!isEditing);
    };

    const handleDoneFlag = async (id: number) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_HOST}/api/todos/${id}/change-task-state`,
                {
                    method: "PUT",
                    cache: "no-store",
                }
            );
            if (!res.ok) {
                throw new Error("Todo削除に失敗しました");
            }
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    return isEditing ? (
        <div>
            <form
                className="single-todo-wrapper"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Controller
                    name="task"
                    control={control}
                    render={({ field }) => (
                        <input
                            className="todo-edit-input blinking"
                            {...field}
                            placeholder="新しいタスクを入力"
                            autoFocus
                        />
                    )}
                />
                <div className="todo-button-wrapper">
                    <button className="edit-button" type="submit">
                        保存
                    </button>
                </div>
            </form>
        </div>
    ) : (
        <div className="single-todo-wrapper">
            {todo.done_flag ? (
                <button
                    className="todo-text todo-checked"
                    onClick={() => handleDoneFlag(todo.id)}
                >
                    {todo.task}
                </button>
            ) : (
                <button
                    className="todo-text"
                    onClick={() => handleDoneFlag(todo.id)}
                >
                    {todo.task}
                </button>
            )}

            <div className="todo-button-wrapper">
                <button
                    className="edit-button"
                    type="button"
                    onClick={() => handleEdit()}
                >
                    編集
                </button>
                <button
                    className="delete-button"
                    type="button"
                    onClick={() => handleDelete(todo.id)}
                >
                    削除
                </button>
            </div>
        </div>
    );
};

export default Todo;
