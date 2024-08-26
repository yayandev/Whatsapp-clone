import {  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../utils/firebase";
import LoginVIew from "../components/LoginVIew";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";
const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      })
    }

    init();
  }, []);

  const login = async (email,password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      if (res) {
        setUser(res.user);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          textBody: "Login successful",
          position: "bottom",
        })

        return res;
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          textBody: "User not found",
          position: "bottom",
          title: "Sign In Error",
        })
      }

      if (error.code === "auth/too-many-requests") {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Sign In Error",
          textBody: "Too many requests",
          position: "bottom",
        })
      }

      if (error.code === "auth/invalid-credential") {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Sign In Error",
          textBody: "Invalid credentials",
          position: "bottom",
        })
      }

     console.log(error);
     
    }
  };

  const logout = async () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      textBody: "Are you sure you want to log out?",
      button: "Logout",
      onPressButton: async () => {
        await signOut(auth);
        setUser(null);
        Dialog.hide();
      }
    })
  };

  const register = async (email, password, confirmPassword) => {
    
    if (password !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        textBody: "Passwords do not match",
        position: "bottom",
      })
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        textBody: "Password must be at least 6 characters",
        position: "bottom",
      })
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (res) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          textBody: "Account created successfully",
          position: "bottom",
        })
        setUser(res.user);
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          textBody: "Email already in use",
          position: "bottom",
        })
      }
    }
    
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#25d366" />
      </View>
    );
  }

  if(!user && !loading) {
    return <LoginVIew login={login} register={register}/>
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
