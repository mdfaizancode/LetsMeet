import axios from "axios";
import httpStatus from "http-status";
import { createContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})


export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState({});

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        const request = await client.post("/register", {
            name,
            username,
            password
        });

        if (request.status === httpStatus.CREATED) {
            return request.data.message;
        }

        throw new Error("Registration failed.");
    }

    const handleLogin = async (username, password) => {
        const request = await client.post("/login", {
            username,
            password
        });

        if (request.status === httpStatus.OK && request.data.token) {
            localStorage.setItem("token", request.data.token);
            router("/home");
            return;
        }

        throw new Error("Login failed.");
    }

    const getHistoryOfUser = useCallback(async () => {
        const request = await client.get("/get_all_activity", {
            params: {
                token: localStorage.getItem("token")
            }
        });
        return request.data;
    }, []);

    const addToUserHistory = async (meetingCode) => {
        return client.post("/add_to_activity", {
            token: localStorage.getItem("token"),
            meeting_code: meetingCode
        });
    }


    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}
