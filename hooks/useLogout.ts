import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();

  return async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", onPress: () => {}, style: "cancel" },
      {
        text: "Sair",
        onPress: async () => {
          try {
            await logout();
            router.replace("/");
          } catch (error) {
            Alert.alert("Erro", "Erro ao fazer logout");
          }
        },
        style: "destructive",
      },
    ]);
  };
}
