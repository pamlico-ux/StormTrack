"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CastProtocol = "AirPlay" | "Google Cast" | "Miracast";

export interface CastState {
  isCasting: boolean;
  protocol: CastProtocol | null;
  deviceName: string | null;
  mediaTitle: string | null;
  mediaArtist: string | null;
  mediaArt: string | null;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;
}

interface CastContextType {
  state: CastState;
  protocols: Record<CastProtocol, boolean>;
  sbcName: string;
  network: string;
  ipAddress: string;
  toggleProtocol: (protocol: CastProtocol) => void;
  setSbcName: (name: string) => void;
  updateNetwork: (net: string) => void;
  appPin: string;
  setAppPin: (pin: string) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  // Simulated actions
  playPause: () => void;
  setVolume: (vol: number) => void;
  stopCasting: () => void;
  seek: (time: number) => void;
  simulateCast: (protocol: CastProtocol) => void;
}

const defaultState: CastState = {
  isCasting: false,
  protocol: null,
  deviceName: null,
  mediaTitle: null,
  mediaArtist: null,
  mediaArt: null,
  isPlaying: false,
  volume: 50,
  duration: 0,
  currentTime: 0,
};

const CastContext = createContext<CastContextType | undefined>(undefined);

export function CastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CastState>(defaultState);
  const [protocols, setProtocols] = useState<Record<CastProtocol, boolean>>({
    AirPlay: true,
    "Google Cast": true,
    Miracast: true,
  });
  const [sbcName, setSbcName] = useState("Room 104 Display");
  const [network, setNetwork] = useState("Pamlico_Staff_WiFi");
  const [ipAddress, setIpAddress] = useState("10.0.4.142");
  const [appPin, setAppPin] = useState("123456");
  const [isLocked, setIsLocked] = useState(false);

  const toggleProtocol = (protocol: CastProtocol) => {
    setProtocols((prev) => ({ ...prev, [protocol]: !prev[protocol] }));
  };

  const playPause = () => setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
  const setVolume = (vol: number) => setState((s) => ({ ...s, volume: vol }));
  const stopCasting = () => setState(defaultState);
  const seek = (time: number) => setState((s) => ({ ...s, currentTime: time }));
  const updateNetwork = (net: string) => {
    setNetwork(net);
    // Simulate getting a new IP address
    setIpAddress(`10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
  };

  const simulateCast = (protocol: CastProtocol) => {
    setState({
      isCasting: true,
      protocol,
      deviceName: "Teacher's Device",
      mediaTitle: "Educational Video Presentation",
      mediaArtist: "Pamlico County Schools",
      mediaArt: "https://picsum.photos/seed/education/400/400",
      isPlaying: true,
      volume: 65,
      duration: 354,
      currentTime: 120,
    });
  };

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isCasting && state.isPlaying) {
      interval = setInterval(() => {
        setState((s) => {
          if (s.currentTime >= s.duration) {
            return { ...s, isPlaying: false, currentTime: s.duration };
          }
          return { ...s, currentTime: s.currentTime + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isCasting, state.isPlaying]);

  return (
    <CastContext.Provider
      value={{
        state,
        protocols,
        sbcName,
        network,
        ipAddress,
        appPin,
        isLocked,
        toggleProtocol,
        setSbcName,
        updateNetwork,
        setAppPin,
        setIsLocked,
        playPause,
        setVolume,
        stopCasting,
        seek,
        simulateCast,
      }}
    >
      {children}
    </CastContext.Provider>
  );
}

export const useCast = () => {
  const context = useContext(CastContext);
  if (!context) throw new Error("useCast must be used within CastProvider");
  return context;
};
