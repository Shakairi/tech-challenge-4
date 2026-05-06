import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/context/AuthContext";
import { validators } from "@/utils/validators";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const { signup } = useAuth();

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showErrorModal("Preencha todos os campos");
      return;
    }

    if (!validators.isValidEmail(email)) {
      showErrorModal("Digite um email válido");
      return;
    }

    if (password.length < 6) {
      showErrorModal("A senha precisa ter pelo menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      await signup(name.trim(), email.trim(), password);

      router.replace("/dashboard");
    } catch (error: any) {
      let message = "Erro ao criar conta";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Este email já está cadastrado";
          break;

        case "auth/invalid-email":
          message = "Email inválido";
          break;

        case "auth/weak-password":
          message = "A senha precisa ter pelo menos 6 caracteres";
          break;

        case "auth/network-request-failed":
          message = "Erro de conexão com a internet";
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
          />

          <Text style={styles.title}>Cadastrar Conta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />

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
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Criando..." : "Cadastrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.back()}>
            <Text>
              Já tem conta? <Text style={styles.bold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  innerContainer: {
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
