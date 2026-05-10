/**
 * useAppStartup.ts
 *
 * Pré-carrega recursos críticos (fontes, imagens, sessão) em paralelo
 * durante a splash screen, antes de mostrar qualquer tela.
 *
 * Sem isso: app abre → tela pisca → carrega fonte → layout muda
 * Com isso: app abre → tudo pronto → tela aparece limpa
 *
 * Instalação: npx expo install expo-font expo-splash-screen
 */
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image } from "react-native";

// Mantém a splash screen visível até tudo estar pronto
SplashScreen.preventAutoHideAsync();

// Imagens críticas para pré-carregar (aparecem na primeira tela)
const CRITICAL_IMAGES = [
  require("@/assets/images/logo.png"),
  require("@/assets/images/hero.jpg"),
];

// Fontes customizadas (adicione as suas aqui se usar)
const FONTS = {
  // "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
  // "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
};

export function useAppStartup() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // ✅ Carrega tudo em paralelo — mais rápido que sequencial
        await Promise.all([
          // Pré-carrega fontes
          Object.keys(FONTS).length > 0 ? Font.loadAsync(FONTS) : Promise.resolve(),

          // Pré-carrega imagens críticas
          ...CRITICAL_IMAGES.map((img) =>
            Image.prefetch(
              typeof img === "string" ? img : Image.resolveAssetSource(img).uri,
            ).catch(() => {}), // silencioso se falhar
          ),

          // Simula tempo mínimo de splash (evita flash muito rápido)
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch (error) {
        console.warn("Erro no startup:", error);
      } finally {
        setIsReady(true);
        // Esconde a splash screen após tudo estar pronto
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return { isReady };
}
