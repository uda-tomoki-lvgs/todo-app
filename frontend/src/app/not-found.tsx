import Logo from "@/app/components/logo";
import "@/app/globals.css";

const NotFound = () => {
    return (
        <div className="site-wrapper">
            <Logo />
            <div className="main-wrapper">404 Not Found</div>
            <a href="/">ホームページに戻る</a>
        </div>
    );
};

export default NotFound;
