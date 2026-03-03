"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import QRCodeStyling, { Mode } from "qr-code-styling";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  QrCode,
  Copy,
  Check,
  Image as ImageIcon,
  Link,
  Palette,
  X,
  Video,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Wifi,
  User,
  CreditCard,
  Facebook,
  Twitter,
  Linkedin,
  Upload,
  Film,
  Instagram,
} from "lucide-react";

type QRConfig = {
  width: number;
  height: number;
  margin: number;
  qrOptions: {
    typeNumber: number | undefined;
    mode: string;
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
  };

  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
  };
  dotsOptions: {
    type:
      | "dots"
      | "rounded"
      | "classy"
      | "classy-rounded"
      | "square"
      | "extra-rounded";
    color: string;
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    type: "dot" | "square" | "extra-rounded";
    color: string;
  };
  cornersDotOptions: {
    type: "dot" | "square";
    color: string;
  };
};

type ContentType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "event"
  | "location"
  | "video"
  | "gallery"
  | "social"
  | "payment";

interface VideoData {
  id: string;
  url: string;
  thumbnail: string;
  file: File | null;
  uploadedVideo: string;
  expiresAt: string;
  retentionDays: number | null;
}

interface BlobUploadResponse {
  id: string;
  url: string;
  pathname: string;
  expiresAt: string;
  retentionDays: number;
  thumbnailUrl: string | null;
}

interface StoredVideo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string | null;
  expiresAt: string;
  daysLeft: number;
  size: number;
  retentionDays: number;
}

interface StoredVideoListResponse {
  videos: StoredVideo[];
  retentionDays: number;
}

const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoUrl;
    video.currentTime = 1;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL("image/jpeg");
        URL.revokeObjectURL(videoUrl);
        resolve(thumbnail);
      }
    };

    video.load();
  });
};

export default function QRGenerator() {
  const [errorMsg, setErrorMsg] = useState("");
  const [text, setText] = useState("https://example.com");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "image">(
    "content",
  );
  const [logoImage, setLogoImage] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [contentType, setContentType] = useState<ContentType>("url");
  const [isDragging, setIsDragging] = useState(false);
  const [emailData, setEmailData] = useState({
    address: "",
    subject: "",
    body: "",
  });
  const [phoneData, setPhoneData] = useState({ number: "" });
  const [smsData, setSmsData] = useState({ number: "", message: "" });
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [vcardData, setVcardData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    title: "",
  });
  const [eventData, setEventData] = useState({
    title: "",
    location: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
  });
  const [videoData, setVideoData] = useState<VideoData>({
    id: "",
    url: "",
    thumbnail: "",
    file: null,
    uploadedVideo: "",
    expiresAt: "",
    retentionDays: null,
  });
  const [showMyVideosModal, setShowMyVideosModal] = useState(false);
  const [storedVideos, setStoredVideos] = useState<StoredVideo[]>([]);
  const [loadingStoredVideos, setLoadingStoredVideos] = useState(false);
  const [storedVideosError, setStoredVideosError] = useState("");
  const [deletingVideoId, setDeletingVideoId] = useState<string>("");
  const [galleryData, setGalleryData] = useState<string[]>([]);
  const [socialData, setSocialData] = useState({
    platform: "instagram",
    username: "",
  });
  const [paymentData, setPaymentData] = useState({
    type: "paypal",
    address: "",
    amount: "",
  });

  const [config, setConfig] = useState<QRConfig>({
    width: 300,
    height: 300,
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
    },
    dotsOptions: {
      type: "rounded",
      color: "#000000",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#000000",
    },
    cornersDotOptions: {
      type: "dot",
      color: "#000000",
    },
  });

  const qrRef = useRef<QRCodeStyling | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const generateContent = useCallback(() => {
    switch (contentType) {
      case "email":
        return `mailto:${emailData.address}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;

      case "phone":
        return `tel:${phoneData.number}`;

      case "sms":
        return `sms:${smsData.number}?body=${encodeURIComponent(smsData.message)}`;

      case "wifi":
        return `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;

      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.firstName} ${vcardData.lastName}\nTEL:${vcardData.phone}\nEMAIL:${vcardData.email}\nORG:${vcardData.company}\nTITLE:${vcardData.title}\nEND:VCARD`;

      case "event":
        return `BEGIN:VEVENT\nSUMMARY:${eventData.title}\nLOCATION:${eventData.location}\nDTSTART:${eventData.startTime}\nDTEND:${eventData.endTime}\nDESCRIPTION:${eventData.description}\nEND:VEVENT`;

      case "location":
        return `geo:${locationData.latitude},${locationData.longitude}`;

      case "video":
        if (contentType === "video" && videoData.uploadedVideo) {
          return videoData.uploadedVideo;
        }
        return videoData.url;

      case "social":
        const socialUrls = {
          instagram: `https://instagram.com/${socialData.username}`,
          facebook: `https://facebook.com/${socialData.username}`,
          twitter: `https://twitter.com/${socialData.username}`,
          youtube: `https://youtube.com/${socialData.username}`,
          linkedin: `https://linkedin.com/in/${socialData.username}`,
        };
        return (
          socialUrls[socialData.platform as keyof typeof socialUrls] ||
          socialData.username
        );

      case "payment":
        const paymentUrls = {
          paypal: `https://paypal.me/${paymentData.address}${paymentData.amount ? `?amount=${paymentData.amount}` : ""}`,
          venmo: `venmo://paycharge?txn=pay&recipients=${paymentData.address}${paymentData.amount ? `&amount=${paymentData.amount}` : ""}`,
        };
        return (
          paymentUrls[paymentData.type as keyof typeof paymentUrls] ||
          paymentData.address
        );

      default:
        return text;
    }
  }, [
    contentType,
    emailData,
    phoneData,
    smsData,
    wifiData,
    vcardData,
    eventData,
    locationData,
    videoData,
    socialData,
    paymentData,
    text,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { typeNumber, errorCorrectionLevel } = config.qrOptions;
      const qrOptions: {
        mode?: Mode;
        errorCorrectionLevel?: "L" | "M" | "Q" | "H";
        typeNumber?: number;
      } = {
        mode: "Byte" as Mode,
        errorCorrectionLevel,
      };

      if (typeNumber !== undefined && typeNumber > 0) {
        qrOptions.typeNumber = typeNumber;
      }

      const content = generateContent();

      qrRef.current = new QRCodeStyling({
        width: Math.max(100, config.width),
        height: Math.max(100, config.height),
        margin: Math.max(0, config.margin),
        data: content,
        image: logoImage,
        qrOptions: {
          typeNumber: 0,
          mode: qrOptions.mode as Mode,
          errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        },
        imageOptions: {
          hideBackgroundDots: config.imageOptions.hideBackgroundDots,
          imageSize: config.imageOptions.imageSize,
          margin: config.imageOptions.margin,
        },
        dotsOptions: config.dotsOptions,
        backgroundOptions: config.backgroundOptions,
        cornersSquareOptions: config.cornersSquareOptions,
        cornersDotOptions: config.cornersDotOptions,
      });

      if (canvasRef.current) {
        canvasRef.current.innerHTML = "";
        qrRef.current.append(canvasRef.current);
      }
    }
  }, [config, logoImage, generateContent]);

  useEffect(() => {
    const originalStyle = document.body.style.background;
    const originalHtmlStyle = document.documentElement.style.background;

    document.body.style.background = "#111827";
    document.documentElement.style.background = "#111827";
    document.body.classList.add("bg-gray-900");
    document.documentElement.classList.add("bg-gray-900");

    return () => {
      document.body.style.background = originalStyle;
      document.documentElement.style.background = originalHtmlStyle;
      document.body.classList.remove("bg-gray-900");
      document.documentElement.classList.remove("bg-gray-900");
    };
  }, []);

  const uploadToVercelBlob = async (
    file: File,
    type: "image" | "video",
    thumbnailFile?: File,
    onProgress?: (progress: number) => void,
  ): Promise<BlobUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }
        const progress = Math.min(
          100,
          Math.max(0, Math.round((event.loaded / event.total) * 100)),
        );
        onProgress?.(progress);
      };

      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error("Upload failed"));
          return;
        }

        try {
          const data = JSON.parse(xhr.responseText) as BlobUploadResponse;
          resolve(data);
        } catch {
          reject(new Error("Invalid upload response"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.onabort = () => reject(new Error("Upload cancelled"));
      xhr.send(formData);
    });
  };

  const dataUrlToFile = async (
    dataUrl: string,
    fileName: string,
  ): Promise<File | null> => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return new File([blob], fileName, {
        type: blob.type || "image/jpeg",
      });
    } catch (error) {
      console.error("Thumbnail conversion error:", error);
      return null;
    }
  };

  const formatExpiryDate = (value: string) => {
    if (!value) return "30 days after upload";

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "30 days after upload";
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (size: number) => {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const fetchStoredVideos = async () => {
    setLoadingStoredVideos(true);
    setStoredVideosError("");

    try {
      const response = await fetch("/api/videos");
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = (await response.json()) as StoredVideoListResponse;
      setStoredVideos(data.videos);
    } catch (error) {
      console.error("Fetch videos error:", error);
      setStoredVideosError("Failed to load videos");
    } finally {
      setLoadingStoredVideos(false);
    }
  };

  const openMyVideosModal = async () => {
    setShowMyVideosModal(true);
    await fetchStoredVideos();
  };

  const selectStoredVideo = (video: StoredVideo) => {
    setVideoData({
      id: video.id,
      url: video.url,
      thumbnail: video.thumbnailUrl || "",
      file: null,
      uploadedVideo: video.url,
      expiresAt: video.expiresAt,
      retentionDays: video.retentionDays,
    });
    setContentType("video");
    setShowMyVideosModal(false);
  };

  const deleteStoredVideo = async (videoId: string) => {
    setDeletingVideoId(videoId);
    setStoredVideosError("");

    try {
      const response = await fetch("/api/videos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: videoId }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      if (videoData.id === videoId) {
        removeVideo();
      }

      await fetchStoredVideos();
    } catch (error) {
      console.error("Delete stored video error:", error);
      setStoredVideosError("Failed to delete video");
    } finally {
      setDeletingVideoId("");
    }
  };

  const triggerUploadMore = () => {
    setShowMyVideosModal(false);
    setTimeout(() => {
      videoInputRef.current?.click();
    }, 0);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image smaller than 2MB");
      return;
    }

    setIsUploadingLogo(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 50);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        clearInterval(progressInterval);
        setUploadProgress(100);
        const imageDataUrl = e.target?.result as string;
        setTimeout(() => {
          setLogoImage(imageDataUrl);
          setIsUploadingLogo(false);
          setUploadProgress(0);
        }, 300);
      } catch (error) {
        clearInterval(progressInterval);
        console.error("Error reading image:", error);
        setErrorMsg("Failed to read image");
        setIsUploadingLogo(false);
        setUploadProgress(0);
      }
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setErrorMsg("Failed to read image");
      setIsUploadingLogo(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Please upload a video smaller than 50MB");
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      const thumbnail = await generateVideoThumbnail(file);
      const thumbnailFile = await dataUrlToFile(
        thumbnail,
        `${file.name.replace(/\.[^.]+$/, "") || "thumbnail"}.jpg`,
      );
      const uploadResult = await uploadToVercelBlob(
        file,
        "video",
        thumbnailFile || undefined,
        setVideoUploadProgress,
      );

      setVideoData({
        id: uploadResult.id,
        url: uploadResult.url,
        thumbnail: uploadResult.thumbnailUrl || thumbnail,
        file,
        uploadedVideo: uploadResult.url,
        expiresAt: uploadResult.expiresAt,
        retentionDays: uploadResult.retentionDays,
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video file");
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploadingVideo) {
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        const syntheticEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleVideoUpload(syntheticEvent);
      } else if (file.type.startsWith("image/")) {
        const syntheticEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleLogoUpload(syntheticEvent);
      } else {
        alert("Please upload only video or image files");
      }
    }
  };

  const removeLogo = () => {
    setLogoImage("");
  };

  const removeVideo = () => {
    if (videoData.uploadedVideo.startsWith("blob:")) {
      URL.revokeObjectURL(videoData.uploadedVideo);
    }
    setVideoData({
      id: "",
      url: "",
      thumbnail: "",
      file: null,
      uploadedVideo: "",
      expiresAt: "",
      retentionDays: null,
    });
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 2 * 1024 * 1024,
    );

    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped. Please upload image files smaller than 2MB each.",
      );
    }

    const readers = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setGalleryData((prev) => [...prev, ...images]);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryData((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadQR = () => {
    if (!qrRef.current || !generateContent().trim()) {
      setErrorMsg(
        "Nothing to download. Please enter content to generate a QR code.",
      );
      setTimeout(() => setErrorMsg(""), 2500);
      return;
    }
    qrRef.current.download({
      name: `qr-code-${Date.now()}`,
      extension: "png",
    });
  };

  const copyToClipboard = async () => {
    const content = generateContent();
    if (!content.trim()) {
      setErrorMsg("Nothing to copy. Please enter content first.");
      setTimeout(() => setErrorMsg(""), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg("Failed to copy text.");
      setTimeout(() => setErrorMsg(""), 2500);
    }
  };

  const updateNestedConfig = <
    K extends keyof QRConfig,
    CK extends keyof QRConfig[K],
    V extends QRConfig[K][CK],
  >(
    parentKey: K,
    childKey: CK,
    value: V,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [parentKey]: {
        ...(typeof prev[parentKey] === "object" && prev[parentKey] !== null
          ? prev[parentKey]
          : {}),
        [childKey]: value,
      },
    }));
  };

  const contentTypes = [
    {
      value: "url",
      icon: Link,
      label: "Website URL",
      description: "Link to any website",
    },
    {
      value: "text",
      icon: FileText,
      label: "Plain Text",
      description: "Any text message",
    },
    {
      value: "email",
      icon: Mail,
      label: "Email",
      description: "Send email with subject and body",
    },
    {
      value: "phone",
      icon: Phone,
      label: "Phone",
      description: "Make phone call",
    },
    {
      value: "sms",
      icon: MessageCircle,
      label: "SMS",
      description: "Send text message",
    },
    {
      value: "wifi",
      icon: Wifi,
      label: "WiFi",
      description: "Share WiFi credentials",
    },
    {
      value: "vcard",
      icon: User,
      label: "Contact",
      description: "Share contact information",
    },
    {
      value: "event",
      icon: Calendar,
      label: "Event",
      description: "Add to calendar",
    },
    {
      value: "location",
      icon: MapPin,
      label: "Location",
      description: "GPS coordinates",
    },
    {
      value: "video",
      icon: Video,
      label: "Video",
      description: "Video content or files",
    },
    {
      value: "social",
      icon: Instagram,
      label: "Social Media",
      description: "Social profiles",
    },
    {
      value: "payment",
      icon: CreditCard,
      label: "Payment",
      description: "Payment links",
    },
  ];

  const colorSchemes = [
    { name: "Classic", dot: "#000000", bg: "#ffffff" },
    { name: "Emerald", dot: "#8b5cf6", bg: "#f5f3ff" },
    { name: "Forest", dot: "#7c3aed", bg: "#f8f3ff" },
    { name: "Ocean", dot: "#0ea5e9", bg: "#f0f9ff" },
    { name: "Sunset", dot: "#f59e0b", bg: "#fffbeb" },
    { name: "Dark", dot: "#7c3aed", bg: "#1f2937" },
  ];

  const dotTypes = [
    { value: "dots", label: "Dots" },
    { value: "rounded", label: "Rounded" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy Rounded" },
    { value: "square", label: "Square" },
    { value: "extra-rounded", label: "Extra Rounded" },
  ];

  const renderContentForm = () => {
    switch (contentType) {
      case "url":
      case "text":
        return (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              contentType === "url"
                ? "Enter website URL..."
                : "Enter any text..."
            }
            className="w-full h-32 p-4 bg-gray-700/50 border border-gray-600 rounded-xl resize-none placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white"
          />
        );
      case "email":
        return (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={emailData.address}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Subject (optional)"
              value={emailData.subject}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <textarea
              placeholder="Email body (optional)"
              value={emailData.body}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, body: e.target.value }))
              }
              className="w-full h-20 p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      case "phone":
        return (
          <input
            type="tel"
            placeholder="Phone number (e.g., +1234567890)"
            value={phoneData.number}
            onChange={(e) => setPhoneData({ number: e.target.value })}
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case "sms":
        return (
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="Phone number"
              value={smsData.number}
              onChange={(e) =>
                setSmsData((prev) => ({ ...prev, number: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <textarea
              placeholder="Message"
              value={smsData.message}
              onChange={(e) =>
                setSmsData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full h-20 p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      case "wifi":
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Network name (SSID)"
              value={wifiData.ssid}
              onChange={(e) =>
                setWifiData((prev) => ({ ...prev, ssid: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={wifiData.password}
              onChange={(e) =>
                setWifiData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <select
              value={wifiData.encryption}
              onChange={(e) =>
                setWifiData((prev) => ({ ...prev, encryption: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Encryption</option>
            </select>
          </div>
        );

      case "vcard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                value={vcardData.firstName}
                onChange={(e) =>
                  setVcardData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Last name"
                value={vcardData.lastName}
                onChange={(e) =>
                  setVcardData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone number"
              value={vcardData.phone}
              onChange={(e) =>
                setVcardData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={vcardData.email}
              onChange={(e) =>
                setVcardData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Company"
              value={vcardData.company}
              onChange={(e) =>
                setVcardData((prev) => ({ ...prev, company: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Job title"
              value={vcardData.title}
              onChange={(e) =>
                setVcardData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      case "video":
        return (
          <div className="space-y-6">
            {/* Video URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                placeholder="YouTube, Vimeo, or direct video URL"
                value={videoData.url}
                onChange={(e) =>
                  setVideoData((prev) => ({ ...prev, url: e.target.value }))
                }
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">OR</span>
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Upload Video File
                </label>
                <button
                  type="button"
                  onClick={openMyVideosModal}
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
                >
                  My Videos
                </button>
              </div>

              {!videoData.uploadedVideo ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-600 bg-gray-700/50 hover:border-purple-500/50 hover:bg-gray-700/70"
                  } ${isUploadingVideo ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isUploadingVideo) {
                      videoInputRef.current?.click();
                    }
                  }}
                >
                  <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    Drag and drop your video here
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    MP4, WebM, MOV up to 50MB
                  </p>
                  <p className="text-xs text-amber-300 mb-4">
                    Files uploaded here are stored on Vercel Blob and
                    automatically deleted after 30 days.
                  </p>
                  <button
                    type="button"
                    disabled={isUploadingVideo}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingVideo ? "Uploading..." : "Select Video File"}
                  </button>
                  <p className="text-xs text-purple-400 mt-2">
                    Click to browse files
                  </p>

                  {isUploadingVideo && (
                    <div className="mt-4 text-left">
                      <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                        <span>Uploading to Vercel Blob...</span>
                        <span>{videoUploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-600 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-150"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={isUploadingVideo}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      src={videoData.uploadedVideo}
                      controls
                      className="w-full rounded-lg border border-gray-600 max-h-64"
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">
                      Video Details
                    </h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>File: {videoData.file?.name || "Saved video"}</p>
                      {videoData.file && <p>Size: {formatFileSize(videoData.file.size)}</p>}
                      {videoData.file?.type && <p>Type: {videoData.file.type}</p>}
                      <p>
                        Expires:{" "}
                        {formatExpiryDate(videoData.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={removeVideo}
                    className="w-full bg-gray-700/50 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Remove Video
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-400 bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">How it works:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Enter a video URL for online platforms</li>
                <li>Upload video files for local hosting</li>
                <li>Open My Videos to reuse or delete previous uploads</li>
                <li>Uploaded files are auto-deleted from Blob after 30 days</li>
                <li>QR code will link to the video content</li>
                <li>Supported: MP4, WebM, MOV, AVI files</li>
              </ul>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-4">
            <select
              value={socialData.platform}
              onChange={(e) =>
                setSocialData((prev) => ({ ...prev, platform: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <input
              type="text"
              placeholder="Username"
              value={socialData.username}
              onChange={(e) =>
                setSocialData((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      case "payment":
        return (
          <div className="space-y-4">
            <select
              value={paymentData.type}
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="paypal">PayPal</option>
              <option value="venmo">Venmo</option>
            </select>
            <input
              type="text"
              placeholder="Username or address"
              value={paymentData.address}
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Amount (optional)"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    return () => {
      if (videoData.url && videoData.url.startsWith("blob:")) {
        URL.revokeObjectURL(videoData.url);
      }
    };
  }, [videoData.url]);

  return (
    <div className="min-h-screen bg-gray-900" style={{ background: "#111827" }}>
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
                  { id: "content" as const, icon: Link, label: "Content" },
                  { id: "design" as const, icon: Palette, label: "Design" },
                  { id: "image" as const, icon: ImageIcon, label: "Logo" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeTab === id
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content Tab */}
              {activeTab === "content" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Content Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Content Type
                    </label>
                    <div
                      className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#8b5cf6 #374151",
                      }}
                    >
                      {contentTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() =>
                            setContentType(type.value as ContentType)
                          }
                          className={`p-4 border-2 rounded-xl text-left transition-all duration-300 min-h-[100px] group ${
                            contentType === type.value
                              ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                              : "border-gray-600 bg-gray-700/50 hover:border-purple-500/50 hover:bg-gray-700/70 hover:shadow-lg hover:shadow-purple-500/10"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg transition-colors ${
                                contentType === type.value
                                  ? "bg-purple-500/20"
                                  : "bg-gray-600/50 group-hover:bg-purple-500/10"
                              }`}
                            >
                              <type.icon
                                className={`w-5 h-5 ${
                                  contentType === type.value
                                    ? "text-purple-400"
                                    : "text-gray-400 group-hover:text-purple-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div
                                className={`font-semibold text-sm mb-1 ${
                                  contentType === type.value
                                    ? "text-white"
                                    : "text-gray-300 group-hover:text-white"
                                }`}
                              >
                                {type.label}
                              </div>
                              <div
                                className={`text-xs ${
                                  contentType === type.value
                                    ? "text-purple-300"
                                    : "text-gray-400 group-hover:text-gray-300"
                                }`}
                              >
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Content Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {contentTypes.find((t) => t.value === contentType)?.label}{" "}
                      Details
                    </label>
                    {renderContentForm()}
                  </div>

                  {/* Copy Button */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      {generateContent().length} characters
                    </span>
                    <button
                      onClick={copyToClipboard}
                      disabled={!generateContent().trim()}
                      className={`flex items-center gap-2 text-sm ${!generateContent().trim() ? "opacity-50 cursor-not-allowed text-gray-500" : "text-gray-300 hover:text-white"}`}
                      title={
                        !generateContent().trim()
                          ? "Enter content to enable copy"
                          : ""
                      }
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copied ? "Copied!" : "Copy Content"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Design Tab */}
              {activeTab === "design" && (
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
                            updateNestedConfig(
                              "dotsOptions",
                              "color",
                              scheme.dot,
                            );
                            updateNestedConfig(
                              "backgroundOptions",
                              "color",
                              scheme.bg,
                            );
                          }}
                          className="p-2 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-colors bg-gray-700/50"
                        >
                          <div
                            className="w-full h-8 rounded mb-1 border border-gray-500"
                            style={{
                              background: `linear-gradient(45deg, ${scheme.dot} 50%, ${scheme.bg} 50%)`,
                            }}
                          />
                          <div className="text-xs text-gray-300">
                            {scheme.name}
                          </div>
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
                          onChange={(e) =>
                            updateNestedConfig(
                              "dotsOptions",
                              "color",
                              e.target.value,
                            )
                          }
                          className="w-12 h-10 rounded border border-gray-600 cursor-pointer bg-gray-700"
                        />
                        <input
                          type="text"
                          value={config.dotsOptions.color}
                          onChange={(e) =>
                            updateNestedConfig(
                              "dotsOptions",
                              "color",
                              e.target.value,
                            )
                          }
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
                          onChange={(e) =>
                            updateNestedConfig(
                              "backgroundOptions",
                              "color",
                              e.target.value,
                            )
                          }
                          className="w-12 h-10 rounded border border-gray-600 cursor-pointer bg-gray-700"
                        />
                        <input
                          type="text"
                          value={config.backgroundOptions.color}
                          onChange={(e) =>
                            updateNestedConfig(
                              "backgroundOptions",
                              "color",
                              e.target.value,
                            )
                          }
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
                      onChange={(e) =>
                        updateNestedConfig(
                          "dotsOptions",
                          "type",
                          e.target.value as QRConfig["dotsOptions"]["type"],
                        )
                      }
                      className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                    >
                      {dotTypes.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                          className="bg-gray-800 text-white"
                        >
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
                      onChange={(e) =>
                        updateNestedConfig(
                          "qrOptions",
                          "errorCorrectionLevel",
                          e.target.value as "L" | "M" | "Q" | "H",
                        )
                      }
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
              {activeTab === "image" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {!logoImage ? (
                    <div className="text-center">
                      <div
                        className="border-2 border-dashed border-gray-600 rounded-2xl p-8 bg-gray-700/50"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">
                          Add a logo to your QR code
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          Recommended: 100x100px PNG with transparent background
                        </p>
                        <input
                          type="file"
                          id="logo-upload"
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="logo-upload"
                          className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:opacity-90 transition-colors ${isUploadingLogo ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                          {isUploadingLogo ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4" />
                              Upload Logo
                            </>
                          )}
                        </label>
                        <p className="text-xs text-purple-400 mt-2">
                          Or drag and drop an image here
                        </p>
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
                          onChange={(e) =>
                            updateNestedConfig(
                              "imageOptions",
                              "imageSize",
                              parseFloat(e.target.value),
                            )
                          }
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
                            onChange={(e) =>
                              updateNestedConfig(
                                "imageOptions",
                                "hideBackgroundDots",
                                e.target.checked,
                              )
                            }
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
                  <h3 className="font-semibold text-white mb-2 text-xl">
                    QR Code Preview
                  </h3>
                  <p className="text-sm text-gray-400">
                    Scan this code to test
                  </p>
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
                    disabled={!generateContent().trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-95 transition-all duration-300 ${!generateContent().trim() ? "opacity-40 cursor-not-allowed" : ""}`}
                    title={
                      !generateContent().trim()
                        ? "Enter content to enable download"
                        : ""
                    }
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
                    <span className="text-gray-300">Content Type:</span>
                    <span className="font-mono text-white capitalize">
                      {contentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Size:</span>
                    <span className="font-mono text-white">
                      {config.width}×{config.height}px
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Error Correction:</span>
                    <span className="font-mono text-white">
                      {config.qrOptions.errorCorrectionLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Dot Style:</span>
                    <span className="font-mono text-white capitalize">
                      {config.dotsOptions.type.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Has Logo:</span>
                    <span className="font-mono text-white">
                      {logoImage ? "Yes" : "No"}
                    </span>
                  </div>
                  {contentType === "video" && videoData.uploadedVideo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Video Uploaded:</span>
                        <span className="font-mono text-white">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Blob Retention:</span>
                        <span className="font-mono text-white">
                          {videoData.retentionDays ?? 30} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Blob Expires:</span>
                        <span className="font-mono text-white">
                          {formatExpiryDate(videoData.expiresAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showMyVideosModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowMyVideosModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-3xl max-h-[80vh] bg-gray-800 border border-gray-600 rounded-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-600">
                    <div>
                      <h3 className="text-lg font-semibold text-white">My Videos</h3>
                      <p className="text-xs text-gray-400">
                        Uploaded videos are auto-deleted after 30 days.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={triggerUploadMore}
                        className="px-3 py-1.5 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                      >
                        Upload More
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMyVideosModal(false)}
                        className="p-2 rounded-md bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 overflow-y-auto max-h-[65vh]">
                    {loadingStoredVideos && (
                      <p className="text-sm text-gray-300">Loading videos...</p>
                    )}

                    {!loadingStoredVideos && storedVideosError && (
                      <p className="text-sm text-red-400">{storedVideosError}</p>
                    )}

                    {!loadingStoredVideos &&
                      !storedVideosError &&
                      storedVideos.length === 0 && (
                        <p className="text-sm text-gray-300">
                          No videos found yet. Upload one to get started.
                        </p>
                      )}

                    {!loadingStoredVideos &&
                      !storedVideosError &&
                      storedVideos.length > 0 && (
                        <div className="space-y-3">
                          {storedVideos.map((video) => (
                            <div
                              key={video.id}
                              className="bg-gray-700/50 border border-gray-600 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                            >
                              <div className="w-full sm:w-40 h-24 rounded-lg overflow-hidden bg-gray-900 border border-gray-600 flex items-center justify-center">
                                {video.thumbnailUrl ? (
                                  <img
                                    src={video.thumbnailUrl}
                                    alt={`${video.name} thumbnail`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Film className="w-6 h-6 text-gray-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                  {video.name}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">
                                  {formatFileSize(video.size)}
                                </p>
                                <p className="text-xs text-amber-300 mt-1">
                                  {video.daysLeft} day{video.daysLeft === 1 ? "" : "s"} left
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => selectStoredVideo(video)}
                                  className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs hover:bg-purple-500 transition-colors"
                                >
                                  Use
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteStoredVideo(video.id)}
                                  disabled={deletingVideoId === video.id}
                                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs hover:bg-red-500 disabled:opacity-60 transition-colors"
                                >
                                  {deletingVideoId === video.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>
    </div>
  );
}
