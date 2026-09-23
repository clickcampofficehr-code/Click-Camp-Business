import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Camera,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Move
} from 'lucide-react';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  userId?: string;
  onAvatarChange?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRemoveButton?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatarUrl,
  userName,
  userId,
  onAvatarChange,
  size = 'lg',
  showRemoveButton = true
}) => {
  const { currentUser, updateProfilePicture, removeProfilePicture } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active avatar URL
  const effectiveAvatar = currentAvatarUrl !== undefined ? currentAvatarUrl : currentUser.avatarUrl;
  const effectiveName = userName || currentUser.name || 'Employee';
  const effectiveId = userId || currentUser.id;

  // Local state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Crop & Adjust State
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate Initials (e.g. "Adnan Malik" -> "AM")
  const getInitials = (name: string): string => {
    if (!name) return 'CC';
    const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CC';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(effectiveName);

  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-xl',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-40 h-40 text-3xl'
  }[size];

  // Handle native gallery / file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setErrorMessage(null);

    // Validate type: must be image
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid format. Please select a PNG, JPG, or WEBP image.');
      return;
    }

    // Validate size (max 8MB)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('Image size exceeds 8MB. Please choose a smaller photo.');
      return;
    }

    setSelectedFile(file);

    // Use FileReader to generate instant raw image preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedRawImage(result);
        // Reset crop adjustments
        setZoom(1);
        setRotation(0);
        setPanOffset({ x: 0, y: 0 });
        // Open the crop & adjust modal
        setIsCropModalOpen(true);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if cancelled
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & Drop handlers on avatar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please drop an image file (PNG, JPG, or WEBP).');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) {
        setSelectedRawImage(res);
        setZoom(1);
        setRotation(0);
        setPanOffset({ x: 0, y: 0 });
        setIsCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Interactive Pan / Drag within crop modal
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Render cropped image to HTML5 Canvas and generate compressed 200x200 avatar
  const generateCroppedCanvasDataUrl = (targetSize: number = 200): string | null => {
    const img = imageElementRef.current;
    if (!img) return selectedRawImage;

    const canvas = document.createElement('canvas');
    // Compress and standardize dimension to 200x200px for lightning-fast directory loading
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return selectedRawImage;

    // Enable high-quality smoothing for downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear background
    ctx.clearRect(0, 0, targetSize, targetSize);

    // Save context for transform operations
    ctx.save();

    // Move to center of canvas
    ctx.translate(targetSize / 2, targetSize / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply user pan offset (scaled to targetSize canvas from 260px preview container)
    const scaleFactor = targetSize / 260;
    ctx.translate(panOffset.x * scaleFactor, panOffset.y * scaleFactor);

    // Apply user zoom
    ctx.scale(zoom, zoom);

    // Calculate source aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = targetSize;
    let drawHeight = targetSize;

    if (imgAspect > 1) {
      drawWidth = targetSize * imgAspect;
      drawHeight = targetSize;
    } else {
      drawWidth = targetSize;
      drawHeight = targetSize / imgAspect;
    }

    // Draw centered
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    ctx.restore();

    // Compress to efficient WebP/JPEG format at 85% quality (~15-25 KB output)
    try {
      return canvas.toDataURL('image/webp', 0.85);
    } catch {
      return canvas.toDataURL('image/jpeg', 0.85);
    }
  };

  // Convert Data URL to Blob for mock backend upload
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // =========================================================================
  // BACKEND UPLOAD & COMPRESSION LOGIC (200x200 server-side pipeline mock)
  // =========================================================================
  const handleUpload = async (imageBlob: Blob, dataUrl: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(15);

    /*
     * PRODUCTION BACKEND COMPRESSION PIPELINE (e.g. Node.js + Sharp / Cloudinary / AWS S3):
     *
     * 1. Multi-part form receipt:
     *    const form = formidable();
     *    const [fields, files] = await form.parse(req);
     *    const rawFile = files.profilePicture[0];
     *
     * 2. High-performance server-side compression & thumbnailing (Sharp):
     *    const compressedBuffer = await sharp(rawFile.filepath)
     *      .resize(200, 200, { fit: 'cover', position: 'center' })
     *      .webp({ quality: 82, effort: 4 })
     *      .toBuffer();
     *
     * 3. Cloud CDN Storage:
     *    await s3Client.send(new PutObjectCommand({
     *      Bucket: 'clickcamp-corporate-avatars',
     *      Key: `avatars/${effectiveId}_200x200.webp`,
     *      Body: compressedBuffer,
     *      ContentType: 'image/webp',
     *      CacheControl: 'public, max-age=31536000, immutable'
     *    }));
     */

    // Simulated network and backend image processing delay
    await new Promise((resolve) => setTimeout(resolve, 120));
    setUploadProgress(45);
    await new Promise((resolve) => setTimeout(resolve, 140));
    setUploadProgress(80);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setUploadProgress(100);

    return dataUrl;
  };

  // Confirm crop & initiate upload
  const handleConfirmCrop = async () => {
    try {
      // Generate 200x200 compressed thumbnail
      const croppedDataUrl = generateCroppedCanvasDataUrl(200);
      if (!croppedDataUrl) return;

      // Close modal immediately and show instant local preview
      setIsCropModalOpen(false);
      setPreviewUrl(croppedDataUrl);

      // Convert to blob and trigger mock backend upload with 200x200 compression
      const blob = dataURLtoBlob(croppedDataUrl);
      const finalUrl = await handleUpload(blob, croppedDataUrl);

      // Save to WorkspaceContext and notify parent
      await updateProfilePicture(finalUrl, effectiveId);
      if (onAvatarChange) {
        onAvatarChange(finalUrl);
      }

      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    }
  };

  // Revert / Remove photo -> Revert to Initials
  const handleRemovePhoto = async () => {
    if (confirm('Are you sure you want to remove your profile picture and revert to your corporate initials?')) {
      setPreviewUrl(null);
      setSelectedRawImage(null);
      setSelectedFile(null);
      await removeProfilePicture(effectiveId);
      if (onAvatarChange) {
        onAvatarChange('');
      }
      setUploadSuccess(false);
    }
  };

  // Display URL precedence: local preview -> effective avatar -> null
  const displayAvatar = previewUrl || effectiveAvatar;

  return (
    <div className="flex flex-col items-center">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        id="profile-picture-native-input"
      />

      {/* Circular Avatar Container with Hover/Edit State */}
      <div className="relative group cursor-pointer" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`${sizeClasses} rounded-full overflow-hidden relative border-3 border-white shadow-md ring-2 ring-neutral-200 transition-all duration-300 group-hover:ring-emerald-500 group-hover:shadow-lg select-none bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center`}
          title="Click or tap to upload a custom profile picture"
        >
          {/* Avatar Image or Initials Fallback */}
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={effectiveName}
              className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white font-black tracking-wider uppercase select-none">
              {initials}
            </div>
          )}

          {/* Hover / Edit State: Dark overlay with camera icon & "Change Photo" */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-1 text-center">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-emerald-400 drop-shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight drop-shadow-xs leading-tight">
              Change Photo
            </span>
          </div>

          {/* Uploading Progress Spinner Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
              <span className="text-[10px] font-mono font-bold text-emerald-300">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* Mobile-Friendly Quick Camera Badge Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full shadow-md border-2 border-white transition cursor-pointer"
          title="Choose photo from device gallery"
          aria-label="Upload profile picture"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Success / Feedback Indicator */}
      {uploadSuccess && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Profile picture updated</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-2 text-center text-xs text-rose-600 font-medium flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Helper Text & Remove Photo Button */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <p className="text-[11px] text-neutral-400 text-center">
          Tap avatar to upload photo (Auto-compressed to 200×200 WebP)
        </p>

        {showRemoveButton && displayAvatar && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="text-[11px] text-neutral-500 hover:text-rose-600 font-medium inline-flex items-center gap-1 mt-0.5 hover:underline cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3 text-neutral-400 hover:text-rose-500" />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BONUS: INTERACTIVE CROP & POSITION ADJUSTMENT MODAL                       */}
      {/* ========================================================================= */}
      {isCropModalOpen && selectedRawImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs sm:text-sm">Adjust & Position Profile Photo</h3>
              </div>
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crop Canvas & Framing Viewport */}
            <div className="p-5 flex flex-col items-center">
              <div
                className="relative w-64 h-64 bg-neutral-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center border border-neutral-300 shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Source Image with dynamic Zoom, Pan, and Rotation */}
                <img
                  ref={imageElementRef}
                  src={selectedRawImage}
                  alt="Crop preview"
                  draggable={false}
                  className="max-w-none absolute pointer-events-none transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                />

                {/* Circular Framing Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Outer Dimmed Layer with Circular Cutout */}
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="circle-cutout">
                        <rect width="100%" height="100%" fill="white" />
                        <circle cx="128" cy="128" r="100" fill="black" />
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="rgba(0, 0, 0, 0.65)"
                      mask="url(#circle-cutout)"
                    />
                    {/* Circle Boundary Guide */}
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  </svg>
                </div>

                {/* Drag Hint */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded-full text-[9.5px] text-white/90 font-medium flex items-center gap-1 pointer-events-none">
                  <Move className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Drag image to position</span>
                </div>
              </div>

              {/* Zoom & Rotation Controls */}
              <div className="w-full mt-4 space-y-3">
                {/* Zoom Slider */}
                <div className="flex items-center gap-2.5">
                  <ZoomOut className="w-4 h-4 text-neutral-400 shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="text-[11px] font-mono font-semibold text-neutral-600 w-8 text-right">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                {/* Rotation & Reset Buttons */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-2.5 py-1 text-neutral-700 hover:bg-neutral-100 rounded-lg flex items-center gap-1 font-medium transition cursor-pointer border border-neutral-200"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer"
                  >
                    Reset Framing
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  className="px-4 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Set Profile Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
