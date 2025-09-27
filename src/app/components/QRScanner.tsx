'use client';
import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Scan, Video, Image, 
  AlertCircle, CheckCircle, Play, Square, Copy,
  ChevronDown, QrCode
} from 'lucide-react';

export default function QRScanner() {
  const [scanningMode, setScanningMode] = useState<'camera' | 'image'>('camera');
  const [isDragActive, setIsDragActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    codeReaderRef.current = new BrowserMultiFormatReader();
    checkCameraPermission();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      stopScanning();
      stopVideo();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);
      if (scanningMode !== 'image') return;
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          handleImageFileDrop(file);
        }
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      if (scanningMode === 'image') setIsDragActive(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      setIsDragActive(false);
    };

    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
    };
  }, [scanningMode]);

  const checkCameraPermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setVideoInputDevices(videoDevices);
      const hasPermission = videoDevices.length > 0 && videoDevices[0].label !== '';
      setCameraPermission(hasPermission ? 'granted' : 'prompt');
      
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch {
      setCameraPermission('denied');
    }
  };

  const requestCameraPermission = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined } 
      });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setVideoInputDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch {
      setCameraPermission('denied');
      setError('Camera access was denied.');
    }
  };

  const startVideo = async () => {
    if (!selectedDeviceId && videoInputDevices.length > 0) {
      setSelectedDeviceId(videoInputDevices[0].deviceId);
    }
    
    if (!selectedDeviceId) return;
    
    try {
      setError('');
      stopVideo();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setIsVideoActive(true);
        setCameraPermission('granted');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setError('Failed to start camera. Trying next available camera...');
      setCameraPermission('denied');
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsVideoActive(false);
  };

  const startCameraScan = async () => {
    if (!codeReaderRef.current || !selectedDeviceId || !isVideoActive) return;
    try {
      setIsScanning(true);
      setScanResult('');
      setError('');
      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            setScanResult(result.getText());
            stopScanning();
          }
          if (err && err.name !== 'NotFoundException') console.error('Scan error:', err);
        }
      );
    } catch {
      setError('Failed to start scanning.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      try {
        (codeReaderRef.current as any).reset();
      } catch {}
    }
    setIsScanning(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !codeReaderRef.current) return;
    try {
      setIsScanning(true);
      setScanResult('');
      setError('');
      const result = await codeReaderRef.current.decodeFromImageUrl(URL.createObjectURL(file));
      setScanResult(result.getText());
    } catch {
      setError('No QR code found in the image. Try another image.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageFileDrop = (file: File) => {
    if (!file || !codeReaderRef.current) return;
    setIsScanning(true);
    setScanResult('');
    setError('');
    codeReaderRef.current.decodeFromImageUrl(URL.createObjectURL(file))
      .then(result => setScanResult(result.getText()))
      .catch(() => {
        setError('No QR code found in the image. Please try with a different image.');
        setTimeout(() => setError(''), 3000);
      })
      .finally(() => setIsScanning(false));
  };

  const triggerImageUpload = () => fileInputRef.current?.click();
  const clearResult = () => { setScanResult(''); setError(''); setCopied(false); };
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy text.');
    }
  };

  const handleModeChange = (mode: 'camera' | 'image') => {
    setScanningMode(mode);
    clearResult();
    if (mode === 'camera') {
      stopScanning();
      stopVideo();
    }
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsDropdownOpen(false);
    stopVideo();
    stopScanning();
  };

  const selectedDevice = videoInputDevices.find(device => device.deviceId === selectedDeviceId);

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl p-8 md:p-12 bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h2><QrCode className="w-8 h-8 text-green-400" /></h2>
          <h2 className="text-3xl font-bold text-white">QR Code Scanner</h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleModeChange('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              scanningMode === 'camera'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Camera className="w-5 h-5" />
            Camera
          </button>
          <button
            onClick={() => handleModeChange('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              scanningMode === 'image'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Image className="w-5 h-5" />
            Upload
          </button>
        </div>

        {/* Camera or Upload Section */}
        <AnimatePresence mode="wait">
          {scanningMode === 'camera' ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Camera Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white/5 text-white/80 py-3 px-4 rounded-xl flex items-center justify-between"
                >
                  <span>{selectedDevice?.label || 'Select Camera'}</span>
                  <ChevronDown className="w-5 h-5 text-white/60" />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 mt-2 w-full bg-slate-800/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg max-h-60 overflow-auto"
                    >
                      {videoInputDevices.map((device) => (
                        <li
                          key={device.deviceId}
                          onClick={() => handleDeviceSelect(device.deviceId)}
                          className="px-4 py-2 text-white/80 hover:bg-green-600/20 cursor-pointer"
                        >
                          {device.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Video */}
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <video ref={videoRef} className="w-full rounded-xl" />
                {isScanning && (
                  <>
                    <div className="absolute inset-0 border-2 border-green-400 rounded-xl animate-pulse" />
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
                  </>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex flex-wrap gap-4 justify-center">
                {!isVideoActive ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startVideo}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 text-lg"
                  >
                    <Play className="w-5 h-5" />
                    Start Camera
                  </motion.button>
                ) : !isScanning ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCameraScan}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 text-lg"
                  >
                    <Scan className="w-5 h-5" />
                    Start Scan
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopScanning}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 text-lg"
                  >
                    <Square className="w-5 h-5" />
                    Stop Scan
                  </motion.button>
                )}
                {isVideoActive && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopVideo}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 text-lg"
                  >
                    <Video className="w-5 h-5" />
                    Stop Camera
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Upload Area */}
              <div
                onClick={triggerImageUpload}
                className={`border-2 border-dashed rounded-2xl max-w-2xl mx-auto h-64 flex items-center justify-center cursor-pointer transition-colors duration-300 ${
                  isDragActive ? 'border-green-400 bg-green-500/10' : 'border-white/20 hover:border-green-400'
                }`}
              >
                <div className="text-center px-6">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <p className="text-lg font-semibold text-white">
                    {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-white/70 text-sm mt-1">Supports PNG, JPG, JPEG</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        {(scanResult || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 rounded-xl bg-white/10 border border-white/20 shadow-lg"
          >
            {scanResult && (
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">Scan Result:</p>
                  <p className="text-white font-medium break-words">{scanResult}</p>
                  <div className="flex gap-3 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyResult}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearResult}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Clear
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
