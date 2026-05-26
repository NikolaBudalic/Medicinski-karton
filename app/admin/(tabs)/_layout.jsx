import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";

export default function AdminTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#15803d",
                tabBarInactiveTintColor: "#64748b",
            }}
        >
            <Tabs.Screen
                name="patients"
                options={{
                    title: "Pacijenti",
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="people-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="doctors"
                options={{
                    title: "Lekari",
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="medkit-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}