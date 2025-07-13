import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Set token in axios headers and fetch user from backend
  const checkAuth = async () => {
    try {
      if (token) {
        axios.defaults.headers.common["token"] = token;
      }

      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        connectSocket(data.user);
      } else {
        logout();
      }
    } catch (error) {
      logout(); // invalid token, force logout
    } finally {
      setLoading(false);
    }
  };

  // 2. Login method
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        axios.defaults.headers.common["token"] = data.token;
        localStorage.setItem("token", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.userData));
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 3. Logout method
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    socket?.disconnect();
    toast.success("Logged out successfully");
  };

  // 4. Update profile method
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        toast.success("Profile updated successfully");
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 5. Connect socket
  const connectSocket = (userData) => {
    if (!userData || !userData._id || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // 6. Run on load
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
