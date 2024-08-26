import { createContext, useContext, useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import LoginVIew from "../components/LoginVIew";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SetNameView from "../components/SetNameView";
const AuthContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  loading: true,
  login: () => {},
  logout: () => {},
  verifyOtp: () => {},
});

export const useAuth = () => useContext(AuthContext);
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        const res = await fetch(`${API_URL}/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.data.user);
          setToken(token);
          setLoading(false);
          return;
        }
      }

      setUser(null);
      setToken(null);
      setLoading(false);
    };

    init();
  }, []);

  const login = async (phone) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    if (phone.startsWith("0")) {
      phone = `62${phone.slice(1)}`;
    }

    if (!phone.startsWith("0") && !phone.startsWith("62")) {
      phone = `62${phone}`;
    }

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    return data;
  };

  const logout = async () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      textBody: "Are you sure you want to log out?",
      button: "Logout",
      onPressButton: async () => {
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          textBody: "Logout success",
        });
        Dialog.hide();
      },
    });
  };

  const verifyOtp = async (phone, otp) => {
    if (phone.startsWith("0")) {
      phone = `62${phone.slice(1)}`;
    }

    if (!phone.startsWith("0") && !phone.startsWith("62")) {
      phone = `62${phone}`;
    }

    const body = {
      phone,
      otp,
    };

    const res = await fetch(`${API_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    await AsyncStorage.setItem("token", data.data.token);
    setToken(data.data.token);

    if (data.success) {
      const res = await fetch(`${API_URL}/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": data.data.token,
        },
      });

      const data2 = await res.json();

      if (data2.success) {
        setUser(data2.data.user);
        return;
      }
    }

    Toast.show({
      type: ALERT_TYPE.DANGER,
      title: "Error",
      textBody: data.message,
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#25d366" />
      </View>
    );
  }

  if (!user && !loading && !token) {
    return <LoginVIew login={login} verifyOtp={verifyOtp} />;
  }

  if ((user && user?.name === undefined) || user?.name.length === 0) {
    return <SetNameView user={user} setUser={setUser} />;
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};
