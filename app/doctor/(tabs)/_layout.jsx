import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { getTheme } from "../../../utils/theme";

export default function DoctorTabsLayout() {
    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.subtext,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopWidth: 0,
                    height: 74,
                    paddingTop: 8,
                    paddingBottom: 10,
                    position: "absolute",
                    left: 14,
                    right: 14,
                    bottom: 14,
                    borderRadius: 24,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "700",
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="pacijenti"
                options={{
                    title: "Pacijenti",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name={focused ? "people" : "people-outline"}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="kalendar"
                options={{
                    title: "Kalendar",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name={focused ? "calendar" : "calendar-outline"}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profil"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name={focused ? "person-circle" : "person-circle-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}