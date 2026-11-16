import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ff2032',
        tabBarInactiveTintColor: '#b6b8bf',
        tabBarStyle: {
          backgroundColor: '#222329',
          borderTopColor: '#383a40',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Filmes',
        }}
      />
    </Tabs>
  );
}
