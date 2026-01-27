/**
 * Custom Radar Chart Component
 * Displays 5 skill dimensions in a pentagon shape
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Polygon, Line, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
  data: number[]; // Array of 5 scores (0-100)
  labels: string[]; // Array of 5 labels
  size?: number;
  color?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  labels,
  size = 280,
  color = '#4FD1C5',
}) => {
  const center = size / 2;
  const radius = size / 2 - 60; // Leave space for labels
  const levels = 5; // Number of concentric pentagons

  // Calculate pentagon points for a given radius
  const getPentagonPoints = (r: number) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2; // Start from top
      points.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      });
    }
    return points;
  };

  // Get label positions (slightly outside the chart)
  const getLabelPositions = () => {
    const labelRadius = radius + 30;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      positions.push({
        x: center + labelRadius * Math.cos(angle),
        y: center + labelRadius * Math.sin(angle),
      });
    }
    return positions;
  };

  // Convert data points to polygon string
  const dataPoints = data.map((value, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const dataPolygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const labelPositions = getLabelPositions();

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background grid - concentric pentagons */}
        {Array.from({ length: levels }).map((_, i) => {
          const levelRadius = ((i + 1) / levels) * radius;
          const points = getPentagonPoints(levelRadius);
          const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

          return (
            <Polygon
              key={`level-${i}`}
              points={polygonPoints}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Radial lines from center to each corner */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          return (
            <Line
              key={`radial-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPolygonPoints}
          fill={color}
          fillOpacity="0.3"
          stroke={color}
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <Circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
          />
        ))}

        {/* Labels */}
        {labels.map((label, i) => {
          const pos = labelPositions[i];
          return (
            <SvgText
              key={`label-${i}`}
              x={pos.x}
              y={pos.y}
              fontSize="12"
              fontWeight="600"
              fill="#1F2937"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
