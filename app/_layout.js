import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/patient/[id]" />
        <Stack.Screen name="doctor/index" />
        <Stack.Screen name="doctor/patient/[id]" />
        <Stack.Screen name="patient/index" />
      </Stack>
    </Provider>
  );
}