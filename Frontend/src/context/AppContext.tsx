import { createContext, useContext, useEffect, useState } from "react";
import {
    initialState,
    type FoodEntry,
    type User,
    type ActivityEntry,
    type Credentials,
} from "../types";
import { useNavigate } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";

const AppContext = createContext(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [isUserFetched, setUserFetched] = useState(
        localStorage.getItem('token') ? true : false
    );
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

    const fetchFoodLogs = async (token: string) => {
        try {
            const { data } = await api.get('/api/food-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllFoodLogs(data);
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const fetchActivityLogs = async (token: string) => {
        try {
            const { data } = await api.get('/api/activity-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllActivityLogs(data);
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const signup = async (credentials: Credentials) => {
        try {
            const { data } = await api.post('/api/auth/local/register', credentials);

            // Clear any previous user's data
            setAllFoodLogs([]);
            setAllActivityLogs([]);

            setUser({ ...data.user, token: data.jwt });
            localStorage.setItem("token", data.jwt);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;

            if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
                setOnboardingCompleted(true);
                navigate("/");
            } else {
                navigate("/onboarding");
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const login = async (credential: Credentials) => {
        try {
            const { data } = await api.post('/api/auth/local', {
                identifier: credential.email,
                password: credential.password
            });

            // Clear previous user's data before loading new user's data
            setAllFoodLogs([]);
            setAllActivityLogs([]);

            setUser({ ...data.user, token: data.jwt });
            localStorage.setItem("token", data.jwt);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;

            // Fetch this user's logs fresh from backend
            await fetchFoodLogs(data.jwt);
            await fetchActivityLogs(data.jwt);

            if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
                setOnboardingCompleted(true);
                navigate("/");
            } else {
                navigate("/onboarding");
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const fetchUser = async (token: string) => {
        try {
            const { data } = await api.get('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser({ ...data, token });

            if (data?.age && data?.weight && data?.goal) {
                setOnboardingCompleted(true);
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
        setUserFetched(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("fitnessUser");
        setUser(null);
        setAllFoodLogs([]);
        setAllActivityLogs([]);
        setUserFetched(true);
        setOnboardingCompleted(false);
        api.defaults.headers.common['Authorization'] = '';
        navigate("/login");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        const initApp = async () => {
            try {
                if (token) {
                    await fetchUser(token);
                    await fetchFoodLogs(token);
                    await fetchActivityLogs(token);
                }
            } catch (error) {
                console.error("Init error:", error);
            } finally {
                setUserFetched(true);
            }
        };

        initApp();
    }, []);

    const value = {
        user,
        setUser,
        isUserFetched,
        fetchUser,
        signup,
        login,
        logout,
        onboardingCompleted,
        setOnboardingCompleted,
        allFoodLogs,
        allActivityLogs,
        setAllFoodLogs,
        setAllActivityLogs,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};
