import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { AlertNotificationRoot } from "react-native-alert-notification";

export default function RootLayout() {
  return (
    <AlertNotificationRoot>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </AlertNotificationRoot>
  );
}
