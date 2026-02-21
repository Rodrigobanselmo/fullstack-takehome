"use client";

import { memo } from "react";
import styles from "./audio-waveform.module.css";

interface AudioWaveformProps {
  /** Array of amplitude values (0-1) for each bar */
  data: number[];
  /** Whether the recording is active */
  isRecording: boolean;
}

/**
 * Renders an audio waveform visualization from amplitude data.
 * Shows bars that represent audio levels over time.
 */
export const AudioWaveform = memo(function AudioWaveform({
  data,
  isRecording,
}: AudioWaveformProps) {
  return (
    <div className={styles.container}>
      <div className={styles.waveform}>
        {data.map((amplitude, index) => {
          // Minimum height for visual appeal, scale up for actual amplitude
          // Boost the amplitude to make bars more visible
          const boostedAmplitude = Math.min(1, amplitude * 2.5);
          const minHeight = 4;
          const maxHeight = 40;
          const height = minHeight + boostedAmplitude * (maxHeight - minHeight);

          return (
            <div
              key={index}
              className={`${styles.bar} ${isRecording ? styles.barActive : ""}`}
              style={{
                height: `${height}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
});

