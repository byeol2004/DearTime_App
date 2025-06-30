import React from 'react';
import Svg, { Defs, RadialGradient, Stop, Circle, Ellipse, Path, LinearGradient } from 'react-native-svg';

export default function GlassyCrystalBall({ width = 300, height = 400 }) {
  const baseWidth = 300;
  const baseHeight = 400;

  const scaleX = width / baseWidth;
  const scaleY = height / baseHeight;

  const sx = x => x * scaleX;
  const sy = y => y * scaleY;

  return (
    <Svg width={width} height={height} viewBox="0 0 300 400" fill="none">
      <Defs>
        {/* Ball Gradient */}
        <RadialGradient id="ballGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <Stop offset="60%" stopColor="#A9D9E5" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#87C0CD" stopOpacity="0.12" />
        </RadialGradient>

        {/* Base Gradient */}
        <LinearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#87C0CD" />
          <Stop offset="100%" stopColor="#5EA7B5" />
        </LinearGradient>
      </Defs>

      {/* Glass Ball */}
      <Circle
        cx={sx(150)}
        cy={sy(160)}
        r={130 * Math.min(scaleX, scaleY)}
        fill="url(#ballGradient)"
        stroke="#87C0CD"
        strokeOpacity="0.5"
        strokeWidth={4 * Math.min(scaleX, scaleY)}
      />

      {/* Inner Shine */}
      <Ellipse
        cx={sx(110)}
        cy={sy(130)}
        rx={25 * scaleX}
        ry={40 * scaleY}
        fill="#FFFFFF"
        opacity="0.15"
      />

      {/* Subtle Glare */}
      <Ellipse
        cx={sx(180)}
        cy={sy(110)}
        rx={14 * scaleX}
        ry={22 * scaleY}
        fill="#FFFFFF"
        opacity="0.1"
      />

      {/* Base */}
      <Path
        d={`
          M${sx(60)} ${sy(260)} 
          Q${sx(150)} ${sy(310)} ${sx(240)} ${sy(260)} 
          L${sx(240)} ${sy(300)} 
          Q${sx(150)} ${sy(340)} ${sx(60)} ${sy(300)} 
          Z
        `}
        fill="url(#baseGradient)"
        stroke="#5EA7B5"
        strokeWidth={3 * Math.min(scaleX, scaleY)}
      />

      {/* Base Shine */}
      <Path
        d={`M${sx(70)} ${sy(270)} Q${sx(150)} ${sy(310)} ${sx(230)} ${sy(270)}`}
        stroke="#FFFFFF"
        strokeOpacity="0.3"
        strokeWidth={2 * Math.min(scaleX, scaleY)}
      />
    </Svg>
  );
}
