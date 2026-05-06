import React from "react";
import { LineChart, LineChartPropsType } from "react-native-gifted-charts";

type ChartProps = LineChartPropsType & {};

export default function Chart({ ...rest }: ChartProps) {
  return (
    <LineChart
      adjustToWidth      
      height={230}

      // Linha
      thickness={3}
      color="#3B82F6"
      curved

      // Área
      areaChart
      startFillColor="rgba(59,130,246,0.35)"
      endFillColor="rgba(59,130,246,0.02)"
      startOpacity={0.9}
      endOpacity={0.1}

      // Pontos
      hideDataPoints={false}
      dataPointsRadius={5}
      dataPointsColor="#3B82F6"

      // Grid
      rulesColor="rgba(0,0,0,0.05)"
      rulesType="dashed"

      // Eixos
      yAxisColor="transparent"
      xAxisColor="rgba(0,0,0,0.1)"
      yAxisTextStyle={{ color: "#79808a", fontSize: 12 }}
      xAxisLabelTextStyle={{ color: "#79808a", fontSize: 12 }}

      // Espaçamento
      initialSpacing={10}
      endSpacing={30}

      // Animação
      isAnimated
      animationDuration={900}
      animateOnDataChange

      {...rest}
    />
  );
}