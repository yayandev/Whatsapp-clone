import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { MenuProvider } from "react-native-popup-menu";

export default function RootLayout() {
  return (
    <MenuProvider>
      <AlertNotificationRoot>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </AlertNotificationRoot>
    </MenuProvider>
  );
}
