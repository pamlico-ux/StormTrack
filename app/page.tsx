"use client";

import React, { useState } from "react";
import { useCast } from "@/components/CastContext";
import {
  Home,
  Settings,
  Cast,
  MonitorPlay,
  Wifi,
  Smartphone,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Airplay,
  MonitorSmartphone,
  LifeBuoy,
  Loader2,
  CheckCircle2,
  Lock,
  Unlock,
  Delete,
  ChevronRight,
  Waves
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"home" | "settings">("home");
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const {
    state,
    protocols,
    sbcName,
    network,
    ipAddress,
    isLocked,
    setIsLocked,
    toggleProtocol,
    playPause,
    setVolume,
    stopCasting,
    seek,
    simulateCast,
  } = useCast();

  React.useEffect(() => {
    if (isLocked && activeTab !== "home") {
      setActiveTab("home");
    }
  }, [isLocked, activeTab]);

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-24 border-r border-zinc-800 bg-zinc-900/50 flex flex-col items-center py-8 gap-8 shrink-0">
        <div className="relative flex items-center justify-center w-14 h-14 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Waves size={48} className="text-yellow-400 -rotate-12 scale-150" />
          </div>
          <span className="relative z-10 text-2xl font-serif font-bold text-white tracking-tighter">PC</span>
        </div>

        {!isLocked ? (
          <>
            <div className="flex flex-col gap-4 mt-8">
              <button
                onClick={() => setActiveTab("home")}
                className={`p-4 rounded-2xl transition-colors ${activeTab === "home" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}
              >
                <Home size={28} />
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`p-4 rounded-2xl transition-colors ${activeTab === "settings" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}
              >
                <Settings size={28} />
              </button>
            </div>
            <div className="mt-auto">
              <button
                onClick={() => setIsLocked(true)}
                className="p-4 rounded-2xl transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                title="Lock App"
              >
                <Unlock size={28} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => setShowUnlockModal(true)}
              className="p-4 rounded-2xl transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              title="Unlock App"
            >
              <Lock size={28} />
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full w-full"
            >
              {state.isCasting ? <ActiveCastingView /> : <IdleView />}
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full w-full p-12 overflow-y-auto"
            >
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showUnlockModal && (
          <UnlockModal onClose={() => setShowUnlockModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function IdleView() {
  const { sbcName, network, ipAddress, protocols, simulateCast } = useCast();

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 relative overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-lg flex items-center justify-center relative overflow-hidden shrink-0">
             <div className="absolute inset-0 flex items-center justify-center opacity-30">
               <Waves size={64} className="text-yellow-400 -rotate-12 scale-150" />
             </div>
             <span className="relative z-10 text-3xl font-serif font-bold text-white tracking-tighter">PC</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">{sbcName}</h1>
            <p className="text-xl text-yellow-400 mt-2">Pamlico County Schools Display System</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/80 px-6 py-3 rounded-2xl border border-zinc-800">
          <Wifi className="text-yellow-400" size={24} />
          <div className="flex flex-col">
            <span className="text-sm text-zinc-400">Network</span>
            <span className="font-semibold text-white">{network}</span>
          </div>
        </div>
      </header>

      {/* Instructions Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* AirPlay Card */}
        {protocols['AirPlay'] && (
          <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col">
            <CardHeader>
              <Airplay className="w-12 h-12 text-blue-400 mb-4" />
              <CardTitle className="text-2xl">Apple Devices</CardTitle>
              <CardDescription className="text-base">MacBook, iPad, iPhone</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ol className="list-decimal list-inside space-y-4 text-zinc-300 text-lg">
                <li>Connect to <strong>{network}</strong></li>
                <li>Open <strong>Control Center</strong></li>
                <li>Tap <strong>Screen Mirroring</strong></li>
                <li>Select <strong>{sbcName}</strong></li>
              </ol>
            </CardContent>
          </Card>
        )}
        
        {/* Google Cast Card */}
        {protocols['Google Cast'] && (
          <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col">
            <CardHeader>
              <Cast className="w-12 h-12 text-green-400 mb-4" />
              <CardTitle className="text-2xl">Chromebooks</CardTitle>
              <CardDescription className="text-base">Chrome OS & Chrome Browser</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ol className="list-decimal list-inside space-y-4 text-zinc-300 text-lg">
                <li>Connect to <strong>{network}</strong></li>
                <li>Open <strong>Chrome</strong></li>
                <li>Click the <strong>3 dots (⋮)</strong> menu</li>
                <li>Select <strong>Cast...</strong></li>
                <li>Select <strong>{sbcName}</strong></li>
              </ol>
            </CardContent>
          </Card>
        )}
        
        {/* Miracast Card */}
        {protocols['Miracast'] && (
          <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col">
            <CardHeader>
              <MonitorSmartphone className="w-12 h-12 text-purple-400 mb-4" />
              <CardTitle className="text-2xl">Windows Devices</CardTitle>
              <CardDescription className="text-base">Windows 10 & 11 Laptops</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ol className="list-decimal list-inside space-y-4 text-zinc-300 text-lg">
                <li>Press <strong>Windows Key + K</strong></li>
                <li>Wait for the Cast menu to open</li>
                <li>Select <strong>{sbcName}</strong> from the list</li>
                <li>Accept the connection prompt if asked</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer / Support */}
      <footer className="mt-12 flex justify-between items-center text-zinc-500 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
        <div className="flex items-center gap-3">
          <LifeBuoy size={24} />
          <span>Need help? IT Support can be contacted at pamlico.incidentiq.com</span>
        </div>
        <div className="font-mono text-sm">
          IP: {ipAddress}
        </div>
      </footer>

      {/* Developer simulation controls */}
      <div className="mt-8 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">Simulation Controls</p>
        <div className="flex gap-4">
          {Object.entries(protocols).map(([protocol, enabled]) => (
            enabled && (
              <Button key={protocol} variant="outline" size="sm" onClick={() => simulateCast(protocol as any)}>
                Simulate {protocol}
              </Button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function ActiveCastingView() {
  const { state, sbcName, playPause, setVolume, stopCasting, seek } = useCast();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col relative bg-zinc-950">
      {/* Background blurred art */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        {state.mediaArt && (
          <Image
            src={state.mediaArt}
            alt="Background"
            fill
            className="object-cover blur-3xl scale-110"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-800">
            <Cast size={20} className="text-yellow-400" />
            <span className="font-medium text-lg">{state.protocol}</span>
            <span className="text-zinc-500">from</span>
            <span className="font-medium text-lg">{state.deviceName}</span>
            <span className="text-zinc-500">to</span>
            <span className="font-medium text-lg">{sbcName}</span>
          </div>

          <Button
            variant="destructive"
            size="lg"
            onClick={stopCasting}
            className="rounded-full gap-2"
          >
            <X size={24} />
            Stop Casting
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center gap-16">
          {/* Album Art */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-96 h-96 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 relative shrink-0 bg-zinc-900"
          >
            {state.mediaArt ? (
              <Image
                src={state.mediaArt}
                alt="Album Art"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MonitorPlay size={64} className="text-zinc-700" />
              </div>
            )}
          </motion.div>

          {/* Controls & Info */}
          <div className="flex-1 max-w-2xl flex flex-col justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-6xl font-bold tracking-tight mb-4 line-clamp-2">
                {state.mediaTitle || "Unknown Title"}
              </h2>
              <p className="text-3xl text-zinc-400 mb-12">
                {state.mediaArtist || "Unknown Artist"}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-12">
              <Slider
                value={[state.currentTime]}
                max={state.duration || 100}
                step={1}
                onValueChange={([val]) => seek(val)}
                className="mb-4"
              />
              <div className="flex justify-between text-zinc-400 font-mono text-lg">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button className="p-4 text-zinc-400 hover:text-white transition-colors">
                  <SkipBack size={48} />
                </button>
                <button
                  onClick={playPause}
                  className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  {state.isPlaying ? (
                    <Pause size={40} className="fill-current" />
                  ) : (
                    <Play size={40} className="fill-current ml-2" />
                  )}
                </button>
                <button className="p-4 text-zinc-400 hover:text-white transition-colors">
                  <SkipForward size={48} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-4 w-64 bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800">
                <Volume2 size={24} className="text-zinc-400 shrink-0" />
                <Slider
                  value={[state.volume]}
                  max={100}
                  step={1}
                  onValueChange={([val]) => setVolume(val)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const { sbcName, network, ipAddress, protocols, toggleProtocol, setSbcName, updateNetwork, appPin, setAppPin } = useCast();
  const [isWifiWizardOpen, setIsWifiWizardOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto relative">
      <h1 className="text-4xl font-semibold mb-12">Device Settings</h1>

      <div className="grid gap-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Protect device settings with a PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex justify-between items-center py-4 border-b border-zinc-800">
              <span className="text-zinc-400 text-lg">App Lock PIN</span>
              <Input 
                type="password"
                value={appPin} 
                onChange={(e) => setAppPin(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                className="w-40 bg-zinc-950 border-zinc-800 text-lg text-center tracking-widest"
                placeholder="123456"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Network Information</CardTitle>
            <CardDescription>
              Current connection details for the SBC
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex justify-between items-center py-4 border-b border-zinc-800">
              <span className="text-zinc-400 text-lg">Device Name</span>
              <Input 
                value={sbcName} 
                onChange={(e) => setSbcName(e.target.value)} 
                className="w-64 bg-zinc-950 border-zinc-800 text-lg"
              />
            </div>
            <div className="flex justify-between items-center py-4 border-b border-zinc-800">
              <span className="text-zinc-400 text-lg">Wi-Fi Network</span>
              <div className="flex items-center gap-4">
                <span className="text-xl font-medium">{network}</span>
                <Button variant="outline" size="sm" onClick={() => setIsWifiWizardOpen(true)}>
                  Change
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-zinc-400 text-lg">IP Address</span>
              <span className="text-xl font-mono">{ipAddress}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Casting Protocols</CardTitle>
            <CardDescription>
              Enable or disable receiver services
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {Object.entries(protocols).map(([protocol, enabled]) => (
              <div
                key={protocol}
                className="flex justify-between items-center py-6 border-b border-zinc-800 last:border-0"
              >
                <div>
                  <h3 className="text-xl font-medium mb-1">{protocol}</h3>
                  <p className="text-zinc-400">
                    Allow devices to cast using {protocol}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => toggleProtocol(protocol as any)}
                  className="scale-125 mr-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {isWifiWizardOpen && (
          <WifiWizard 
            onClose={() => setIsWifiWizardOpen(false)} 
            onConnect={(net) => {
              updateNetwork(net);
              setIsWifiWizardOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WifiWizard({ onClose, onConnect }: { onClose: () => void, onConnect: (network: string) => void }) {
  const [step, setStep] = useState<'scan' | 'select' | 'password' | 'connecting' | 'success'>('scan');
  const [networks, setNetworks] = useState<{ ssid: string, secure: boolean }[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (step === 'scan') {
      const timer = setTimeout(() => {
        setNetworks([
          { ssid: 'Pamlico_Staff_WiFi', secure: true },
          { ssid: 'Pamlico_Student_WiFi', secure: true },
          { ssid: 'Pamlico_Guest', secure: false },
          { ssid: 'IT_Setup_Net', secure: true },
        ]);
        setStep('select');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleConnect = () => {
    setStep('connecting');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onConnect(selectedNetwork);
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Connect to Wi-Fi</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 min-h-[300px] flex flex-col">
          {step === 'scan' && (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 size={48} className="animate-spin mb-6 text-yellow-400" />
              <p className="text-lg">Scanning for networks...</p>
            </div>
          )}

          {step === 'select' && (
            <div className="flex-1 flex flex-col">
              <p className="text-zinc-400 mb-4">Select a network to connect to:</p>
              <div className="flex-1 overflow-y-auto space-y-2">
                {networks.map((net) => (
                  <button
                    key={net.ssid}
                    onClick={() => {
                      setSelectedNetwork(net.ssid);
                      setStep(net.secure ? 'password' : 'connecting');
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-yellow-400 hover:bg-yellow-400/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Wifi size={20} className="text-zinc-400" />
                      <span className="font-medium">{net.ssid}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      {net.secure && <Lock size={16} />}
                      <ChevronRight size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setStep('select')} className="text-zinc-400 hover:text-white">
                  <SkipBack size={24} />
                </button>
                <h3 className="text-xl font-medium">{selectedNetwork}</h3>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm text-zinc-400">Password</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter network password"
                  className="bg-zinc-950 border-zinc-800 text-lg py-6"
                  autoFocus
                />
              </div>

              <div className="mt-auto pt-8 flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setStep('select')}>Cancel</Button>
                <Button onClick={handleConnect} disabled={password.length < 8} className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-semibold">
                  Connect
                </Button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 size={48} className="animate-spin mb-6 text-yellow-400" />
              <p className="text-lg">Connecting to {selectedNetwork}...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center text-emerald-400">
              <CheckCircle2 size={64} className="mb-6" />
              <p className="text-2xl font-medium text-white mb-2">Connected</p>
              <p className="text-zinc-400 text-center">Successfully joined {selectedNetwork}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function UnlockModal({ onClose }: { onClose: () => void }) {
  const { appPin, setIsLocked } = useCast();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin.length === 6) {
        if (newPin === appPin) {
          setIsLocked(false);
          onClose();
        } else {
          setError(true);
          setTimeout(() => setPin(""), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Enter PIN</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 ${
                error ? "border-red-500 bg-red-500" :
                i < pin.length ? "border-yellow-400 bg-yellow-400" : "border-zinc-700 bg-transparent"
              } transition-colors`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-2xl font-medium transition-colors"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePress("0")}
            className="h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-2xl font-medium transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <Delete size={28} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
