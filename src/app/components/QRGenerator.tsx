'use client';
import { useState, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  QrCode, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Link, 
  Palette,
  X
} from 'lucide-react';

type QRConfig = {
  width: number;
  height: number;
  margin: number;
  qrOptions: {
    typeNumber: number;
    mode: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
  };
  dotsOptions: {
    type: 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    color: string;
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    type: 'dot' | 'square' | 'extra-rounded';
    color: string;
  };
  cornersDotOptions: {
    type: 'dot' | 'square';
    color: string;
  };
};

export default function QRGenerator() {
  const [errorMsg, setErrorMsg] = useState('');
  const [text, setText] = useState('https://example.com');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'image'>('content');
  const [logoImage, setLogoImage] = useState<string>('');

  const [config, setConfig] = useState<QRConfig>({
    width: 300,
    height: 300,
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'Q',
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
    },
    dotsOptions: {
      type: 'rounded',
      color: '#000000',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
      color: '#000000',
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#000000',
    },
  });

  const qrRef = useRef<QRCodeStyling | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { typeNumber, mode, errorCorrectionLevel } = config.qrOptions;
      const qrOptions: any = {
        mode: 'Byte',
        errorCorrectionLevel,
      };
      if (typeNumber && typeNumber > 0) {
        qrOptions.typeNumber = typeNumber;
      }
      
      qrRef.current = new QRCodeStyling({
        width: Math.max(100, config.width),
        height: Math.max(100, config.height),
        margin: Math.max(0, config.margin),
        data: text,
        image: logoImage,
        qrOptions,
        imageOptions: config.imageOptions,
        dotsOptions: config.dotsOptions,
        backgroundOptions: config.backgroundOptions,
        cornersSquareOptions: config.cornersSquareOptions,
        cornersDotOptions: config.cornersDotOptions,
      });

      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
        qrRef.current.append(canvasRef.current);
      }
    }
  }, [config, text, logoImage]);

  useEffect(() => {
    // Force dark background on entire page
    const originalStyle = document.body.style.background;
    const originalHtmlStyle = document.documentElement.style.background;
    
    document.body.style.background = '#111827';
    document.documentElement.style.background = '#111827';
    document.body.classList.add('bg-gray-900');
    document.documentElement.classList.add('bg-gray-900');
    
    return () => {
      document.body.style.background = originalStyle;
      document.documentElement.style.background = originalHtmlStyle;
      document.body.classList.remove('bg-gray-900');
      document.documentElement.classList.remove('bg-gray-900');
    };
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload an image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoImage('');
  };

  const downloadQR = () => {
    if (!qrRef.current || !text.trim()) {
      setErrorMsg('Nothing to download. Please enter content to generate a QR code.');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }
    qrRef.current.download({
      name: `qr-code-${Date.now()}`,
      extension: 'png'
    });
  };

  const copyToClipboard = async () => {
    if (!text.trim()) {
      setErrorMsg('Nothing to copy. Please enter content first.');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setErrorMsg('Failed to copy text.');
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const updateConfig = <K extends keyof QRConfig, V extends QRConfig[K]>(key: K, value: V) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedConfig = <K extends keyof QRConfig, CK extends keyof QRConfig[K], V extends QRConfig[K][CK]>(parentKey: K, childKey: CK, value: V) => {
    setConfig(prev => ({
      ...prev,
      [parentKey]: {
        ...(typeof prev[parentKey] === 'object' && prev[parentKey] !== null ? prev[parentKey] : {}),
        [childKey]: value
      }
    }));
  };

  const colorSchemes = [
    { name: 'Classic', dot: '#000000', bg: '#ffffff' },
    { name: 'Emerald', dot: '#10b981', bg: '#ecfdf5' },
    { name: 'Forest', dot: '#059669', bg: '#f0fdf4' },
    { name: 'Ocean', dot: '#0ea5e9', bg: '#f0f9ff' },
    { name: 'Sunset', dot: '#f59e0b', bg: '#fffbeb' },
    { name: 'Dark', dot: '#10b981', bg: '#1f2937' },
  ];

  const dotTypes = [
    { value: 'dots', label: 'Dots' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'classy', label: 'Classy' },
    { value: 'classy-rounded', label: 'Classy Rounded' },
    { value: 'square', label: 'Square' },
    { value: 'extra-rounded', label: 'Extra Rounded' },
  ];

  return (
    <div className="min-h-screen bg-gray-900" style={{ background: '#111827' }}>
      <div className="absolute inset-0 bg-gray-900 -z-10"></div>
      <div className="relative w-full max-w-6xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-6 md:p-8 lg:p-12 bg-gray-800/90 backdrop-blur-xl border border-gray-700 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <QrCode className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Advanced QR Generator
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              <div className="flex bg-gray-700/50 rounded-xl p-1">
                {[
                  { id: 'content' as const, icon: Link, label: 'Content' },
                  { id: 'design' as const, icon: Palette, label: 'Design' },
                  { id: 'image' as const, icon: ImageIcon, label: 'Logo' }
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content to encode
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter URL, text, email, phone number, etc..."
                      className="w-full h-32 p-4 bg-gray-700/50 border border-gray-600 rounded-xl resize-none placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-white"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-400">
                        {text.length} characters
                      </span>
                      <button
                        onClick={copyToClipboard}
                        disabled={!text.trim()}
                        className={`flex items-center gap-1 text-sm ${!text.trim() ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-300 hover:text-white'}`}
                        title={!text.trim() ? 'Enter content to enable copy' : ''}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setText('https://your-website.com')}
                      className="text-left p-3 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-colors bg-gray-700/50 text-gray-300 hover:text-white"
                    >
                      <div className="font-medium">Website URL</div>
                      <div className="text-sm text-gray-400">https://...</div>
                    </button>
                    
                    <button
                      onClick={() => setText('mailto:email@example.com')}
                      className="text-left p-3 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-colors bg-gray-700/50 text-gray-300 hover:text-white"
                    >
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-400">mailto:...</div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Design Tab */}
              {activeTab === 'design' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Color Schemes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.name}
                          onClick={() => {
                            updateNestedConfig('dotsOptions', 'color', scheme.dot);
                            updateNestedConfig('backgroundOptions', 'color', scheme.bg);
                          }}
                          className="p-2 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-colors bg-gray-700/50"
                        >
                          <div 
                            className="w-full h-8 rounded mb-1 border border-gray-500"
                            style={{ 
                              background: `linear-gradient(45deg, ${scheme.dot} 50%, ${scheme.bg} 50%)` 
                            }}
                          />
                          <div className="text-xs text-gray-300">{scheme.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Dot Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.dotsOptions.color}
                          onChange={(e) => updateNestedConfig('dotsOptions', 'color', e.target.value)}
                          className="w-12 h-10 rounded border border-gray-600 cursor-pointer bg-gray-700"
                        />
                        <input
                          type="text"
                          value={config.dotsOptions.color}
                          onChange={(e) => updateNestedConfig('dotsOptions', 'color', e.target.value)}
                          className="flex-1 p-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.backgroundOptions.color}
                          onChange={(e) => updateNestedConfig('backgroundOptions', 'color', e.target.value)}
                          className="w-12 h-10 rounded border border-gray-600 cursor-pointer bg-gray-700"
                        />
                        <input
                          type="text"
                          value={config.backgroundOptions.color}
                          onChange={(e) => updateNestedConfig('backgroundOptions', 'color', e.target.value)}
                          className="flex-1 p-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dot Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dot Style
                    </label>
                    <select
                      value={config.dotsOptions.type}
                      onChange={(e) => updateNestedConfig('dotsOptions', 'type', e.target.value as QRConfig['dotsOptions']['type'])}
                      className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                    >
                      {dotTypes.map(type => (
                        <option key={type.value} value={type.value} className="bg-gray-800 text-white">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Error Correction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Error Correction
                    </label>
                    <select
                      value={config.qrOptions.errorCorrectionLevel}
                      onChange={(e) => updateNestedConfig('qrOptions', 'errorCorrectionLevel', e.target.value as 'L' | 'M' | 'Q' | 'H')}
                      className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                    <p className="text-sm text-gray-400 mt-1">
                      Higher correction allows more damage but increases QR size
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Image Tab */}
              {activeTab === 'image' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {!logoImage ? (
                    <div className="text-center">
                      <div
                        className="border-2 border-dashed border-gray-600 rounded-2xl p-8 bg-gray-700/50"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleLogoUpload({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                        }}
                      >
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">Add a logo to your QR code</p>
                        <p className="text-sm text-gray-400 mb-4">Recommended: 100x100px PNG with transparent background</p>
                        <input
                          type="file"
                          id="logo-upload"
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:opacity-90 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Upload Logo
                        </label>
                        <p className="text-xs text-purple-400 mt-2">Or drag and drop an image here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="relative inline-block">
                          <img
                            src={logoImage}
                            alt="Logo"
                            className="w-32 h-32 object-contain mx-auto border border-gray-600 rounded-lg"
                          />
                          <button
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors w-6 h-6 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Logo Size
                        </label>
                        <input
                          type="range"
                          min="0.2"
                          max="0.6"
                          step="0.1"
                          value={config.imageOptions.imageSize}
                          onChange={(e) => updateNestedConfig('imageOptions', 'imageSize', parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={config.imageOptions.hideBackgroundDots}
                            onChange={(e) => updateNestedConfig('imageOptions', 'hideBackgroundDots', e.target.checked)}
                            className="rounded border-gray-600 bg-gray-700"
                          />
                          <span className="text-sm">Hide dots behind logo</span>
                        </label>
                      </div>

                      <button
                        onClick={removeLogo}
                        className="w-full bg-gray-700/50 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-white mb-2 text-xl">QR Code Preview</h3>
                  <p className="text-sm text-gray-400">Scan this code to test</p>
                </div>
                
                <div className="flex justify-center mb-4">
                  <div 
                    ref={canvasRef}
                    className="bg-gray-900 p-4 rounded-xl shadow-lg flex justify-center items-center border border-gray-600"
                    style={{ 
                      backgroundColor: config.backgroundOptions.color,
                    }}
                  />
                </div>

                <div className="text-center">
                  <motion.button
                    onClick={downloadQR}
                    disabled={!text.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-95 transition-all duration-300 ${!text.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={!text.trim() ? 'Enter content to enable download' : ''}
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </motion.button>
                </div>
              </div>

              {/* QR Code Details */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <h4 className="font-medium text-white mb-3">QR Code Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Size:</span>
                    <span className="font-mono text-white">{config.width}×{config.height}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Error Correction:</span>
                    <span className="font-mono text-white">{config.qrOptions.errorCorrectionLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Dot Style:</span>
                    <span className="font-mono text-white capitalize">{config.dotsOptions.type.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Has Logo:</span>
                    <span className="font-mono text-white">{logoImage ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 px-6 py-3 bg-red-600 text-white rounded-xl shadow-lg max-w-sm text-center"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}