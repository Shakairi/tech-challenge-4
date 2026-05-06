import { useRouter } from "expo-router";
import React from "react";
import {
   Image,
   Linking,
   SafeAreaView,
   StatusBar,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSupport = () => {
    Linking.openURL("https://seusuporte.com.br");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* SEÇÃO SUPERIOR: Imagem e Logo */}
      <View style={styles.topSection}>
        <Text style={styles.logoText}>ByteBank</Text>

        <Image
          source={require("@/assets/images/hero.jpg")}
          style={styles.womanImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.btnPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.btnSecondaryText}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.supportContainer}>
        <View style={styles.supportTextContent}>
          <Text style={styles.supportTitle}>
            Problemas para acessar o nosso app?
          </Text>
          <Text style={styles.supportDesc}>
            Está sem acesso ao seu e-mail cadastrado?{" "}
            <Text style={styles.linkText} onPress={handleSupport}>
              Clique aqui
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  topSection: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 54,
    fontWeight: "bold",
    color: "#FFF",
    zIndex: 5,
  },

  womanImage: {
    width: "100%",
    height: "110%",
    position: "absolute",
    bottom: -20,
    zIndex: 1,
  },

  buttonContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 2,
    marginBottom: -20,
  },

  btnPrimary: {
    backgroundColor: "#28a745",
    height: 54,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  btnPrimaryText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  btnSecondary: {
    backgroundColor: "transparent",
    height: 58,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#28a745",
  },

  btnSecondaryText: {
    color: "#28a745",
    fontSize: 20,
    fontWeight: "700",
  },

  supportContainer: {
    backgroundColor: "#000000",
    paddingHorizontal: 5,
    paddingBottom: 60,
    paddingTop: 40,
    alignItems: "center",
    zIndex: 1,
  },

  supportTextContent: {
    alignItems: "center",
    width: "100%",
  },

  supportTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },

  supportDesc: {
    fontSize: 13,
    color: "#DDD",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  linkText: {
    color: "#28a745",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
