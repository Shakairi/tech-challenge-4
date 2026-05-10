import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/context/AuthContext";
import { TransactionsProvider } from "@/context/TransactionsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppStartup } from "@/hooks/useAppStartup";
import { View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Pré-carregamento de fontes e imagens
  const { isReady } = useAppStartup();

  // Mantém a splash screen visível até tudo estar pronto
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return (
    <AuthProvider>
      <TransactionsProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="financeiro" options={{ headerShown: false }} />
            <Stack.Screen name="receitas" options={{ headerShown: false }} />
            <Stack.Screen name="despesas" options={{ headerShown: false }} />
            <Stack.Screen name="reports" options={{ headerShown: false }} />
            <Stack.Screen
              name="notifications"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transaction/add"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{ headerShown: false, presentation: "modal" }}
            />
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </TransactionsProvider>
    </AuthProvider>
  );
}