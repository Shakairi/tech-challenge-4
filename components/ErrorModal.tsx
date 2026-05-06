import { Colors } from "@/constants/colors";
import React, { useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoClose?: number;
}

export default function ErrorModal({
  visible,
  message,
  onClose,
  autoClose = 4000,
}: ErrorModalProps) {
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.errorContainer}>
          <View style={styles.headerError}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Erro</Text>
          </View>

          <Text style={styles.errorMessage}>{message}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60,
  },

  errorContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },

  headerError: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.error,
  },

  errorMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 20,
  },

  closeButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },

  closeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
