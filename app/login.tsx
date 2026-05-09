import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/context/AuthContext";
import { validators } from "@/utils/validators";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 30_000; // 30 segundos

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // ✅ Rate limiting local
  const attempts = useRef(0);
  const blockedUntil = useRef<Date | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const isBlocked = (): boolean => {
    if (!blockedUntil.current) return false;
    if (new Date() < blockedUntil.current) return true;
    // Bloquio expirou — resetar
    blockedUntil.current = null;
    attempts.current = 0;
    return false;
  };

  const getRemainingBlockTime = (): number => {
    if (!blockedUntil.current) return 0;
    return Math.ceil((blockedUntil.current.getTime() - Date.now()) / 1000);
  };

  const handleLogin = async () => {
    // ✅ Verificar bloqueio por tentativas excessivas
    if (isBlocked()) {
      showErrorModal(`Muitas tentativas. Aguarde ${getRemainingBlockTime()}s para tentar novamente.`);
      return;
    }

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

      // ✅ Reset de tentativas após login bem-sucedido
      attempts.current = 0;
      blockedUntil.current = null;

      router.replace("/dashboard");
    } catch (error: any) {
      // ✅ Incrementar contador de tentativas
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        blockedUntil.current = new Date(Date.now() + BLOCK_DURATION_MS);
        showErrorModal(`Conta temporariamente bloqueada por ${BLOCK_DURATION_MS / 1000}s após ${MAX_ATTEMPTS} tentativas.`);
        return;
      }

      let message = "Erro ao fazer login";
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          // ✅ Mensagem genérica — não revela se email existe ou não
          message = "Email ou senha incorretos";
          break;
        case "auth/invalid-email":
          message = "Email inválido";
          break;
        case "auth/too-many-requests":
          message = "Muitas tentativas. Aguarde alguns minutos.";
          break;
        case "auth/network-request-failed":
          message = "Erro de conexão. Verifique sua internet.";
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
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  innerContainer: { flex: 1, justifyContent: "center", padding: 25 },
  logoImage: { width: 250, resizeMode: "contain", alignSelf: "center", marginBottom: 30 },
  title: { color: "#1e9038", fontSize: 25, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#CCC",
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: { backgroundColor: "#28a745", padding: 18, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#93c9a0" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  link: { marginTop: 20, alignItems: "center" },
  bold: { color: "#28a745", fontWeight: "bold" },
});
