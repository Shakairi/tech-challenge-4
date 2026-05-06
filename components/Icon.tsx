import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

interface IconButtonProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: any;
}

export const Icon = ({
  name,
  size = 24,
  color = "#333",
  onPress,
  style,
}: IconButtonProps) => {
  return (
    <MaterialCommunityIcons
      name={name as any}
      size={size}
      color={color}
      onPress={onPress}
      style={style}
    />
  );
};

export default Icon;
