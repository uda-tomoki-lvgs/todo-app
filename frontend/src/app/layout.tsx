import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "Todo タスク管理",
    description:
        "毎日積み重なったタスクをTodo形式で簡単に管理できます。業務のお供にどうぞ。",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    );
}
