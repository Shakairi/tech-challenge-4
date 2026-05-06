import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/context/AuthContext";
import { validators } from "@/utils/validators";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showErrorModal("Preencha email e senha");
      return;
    }

    if (!validators.isValidEmail(email)) {
      showErrorModal("Digite um email válido");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      router.replace("/dashboard");
    } catch (error: any) {
      let message = "Erro ao fazer login";

      switch (error.code) {
        case "auth/user-not-found":
          message = "Usuário não encontrado";
          break;

        case "auth/wrong-password":
          message = "Senha incorreta";
          break;

        case "auth/invalid-credential":
          message = "Email ou senha inválidos";
          break;

        case "auth/invalid-email":
          message = "Email inválido";
          break;
      }

      showErrorModal(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logoImage}
        />

        <Text style={styles.title}>Bem-vindo</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <Link href="/signup" asChild>
          <TouchableOpacity style={styles.link}>
            <Text>
              Não tem conta? <Text style={styles.bold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ErrorModal
        visible={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  logoImage: {
    width: 250,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 30,
  },

  title: {
    color: "#1e9038",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#fff",
    borderColor: "#CCC",
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#28a745",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  link: {
    marginTop: 20,
    alignItems: "center",
  },

  bold: {
    color: "#28a745",
    fontWeight: "bold",
  },
});
