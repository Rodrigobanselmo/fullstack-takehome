"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "transcribing";

/** Number of bars in the waveform visualization */
const WAVEFORM_BARS = 30;

interface UseAudioRecorderReturn {
  /** Current state of the recorder */
  state: RecordingState;
  /** Error message if any */
  error: string | null;
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and transcribe */
  stopRecording: () => Promise<string | null>;
  /** Cancel recording without transcribing */
  cancelRecording: () => void;
  /** Recording duration in seconds */
  duration: number;
  /** Waveform data for visualization (array of values 0-1) */
  waveformData: number[];
  /** Get current analyser node for custom visualization */
  analyserNode: AnalyserNode | null;
}

// Preferred audio format for optimal compression + quality
// WebM with Opus codec provides excellent compression for speech
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
];

function getSupportedMimeType(): string {
  for (const mimeType of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  // Fallback to browser default
  return "";
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(
    () => Array(WAVEFORM_BARS).fill(0) as number[]
  );
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const waveformHistoryRef = useRef<number[][]>([]);

  const cleanup = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Close audio context
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAnalyserNode(null);
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Clear interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    waveformHistoryRef.current = [];
    setWaveformData(Array(WAVEFORM_BARS).fill(0) as number[]);
  }, []);

  // Update waveform visualization
  const updateWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || state !== "recording") return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average amplitude (0-255) and normalize to 0-1
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const avg = sum / dataArray.length / 255;

    // Add to history (we keep the last WAVEFORM_BARS samples)
    waveformHistoryRef.current.push([avg]);
    if (waveformHistoryRef.current.length > WAVEFORM_BARS) {
      waveformHistoryRef.current.shift();
    }

    // Create waveform from history
    const newWaveform = Array(WAVEFORM_BARS).fill(0) as number[];
    const history = waveformHistoryRef.current;
    const startIdx = WAVEFORM_BARS - history.length;
    for (let i = 0; i < history.length; i++) {
      const historyEntry = history[i];
      if (historyEntry?.[0] !== undefined) {
        newWaveform[startIdx + i] = historyEntry[0];
      }
    }

    setWaveformData(newWaveform);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [state]);

  // Start/stop waveform animation based on state
  useEffect(() => {
    if (state === "recording" && analyserRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, updateWaveform]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setDuration(0);
      waveformHistoryRef.current = [];

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Set up Web Audio API for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);

      // Get best supported MIME type
      const mimeType = getSupportedMimeType();

      // Create MediaRecorder with optimized settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 32000, // Lower bitrate for speech (good quality, smaller file)
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Collect data every second for smoother progress
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setState("recording");

      // Track duration
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch (err) {
      console.error("[AudioRecorder] Error starting:", err);
      cleanup();
      if ((err as Error).name === "NotAllowedError") {
        setError("Microphone permission denied");
      } else if ((err as Error).name === "NotFoundError") {
        setError("No microphone found");
      } else {
        setError("Failed to start recording");
      }
    }
  }, [cleanup]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      cleanup();
      return null;
    }

    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        setState("transcribing");

        // Create blob from chunks BEFORE cleanup (cleanup clears the array)
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Now cleanup (stop stream, clear refs)
        cleanup();

        // Skip if too short (< 0.5 seconds or < 1KB)
        if (audioBlob.size < 1024) {
          setState("idle");
          resolve(null);
          return;
        }

        try {
          // Send to transcription API
          const formData = new FormData();
          const extension = mimeType.includes("webm") ? "webm" : "mp3";
          formData.append("audio", audioBlob, `recording.${extension}`);

          const response = await fetch("/api/ai/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const data = (await response.json()) as { error?: string };
            throw new Error(data.error ?? "Transcription failed");
          }

          const data = (await response.json()) as { text?: string };
          setState("idle");
          resolve(data.text ?? null);
        } catch (err) {
          console.error("[AudioRecorder] Transcription error:", err);
          setError((err as Error).message ?? "Transcription failed");
          setState("idle");
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    cleanup();
    setState("idle");
    setDuration(0);
  }, [cleanup]);

  return {
    state,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    duration,
    waveformData,
    analyserNode,
  };
}

