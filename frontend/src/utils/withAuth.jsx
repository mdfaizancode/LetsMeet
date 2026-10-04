import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent ) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const isAuthenticated = Boolean(localStorage.getItem("token"));

        useEffect(() => {
            if (!isAuthenticated) {
                router("/auth", { replace: true });
            }
        }, [isAuthenticated, router]);

        if (!isAuthenticated) return null;
        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;