import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { MenuProvider } from "react-native-popup-menu";
import { NotificationProvider } from "../context/NotificationContext";

export default function RootLayout() {
  return (
    <MenuProvider>
      <AlertNotificationRoot>
        <AuthProvider>
          <NotificationProvider>
            <Slot />
          </NotificationProvider>
        </AuthProvider>
      </AlertNotificationRoot>
    </MenuProvider>
  );
}
