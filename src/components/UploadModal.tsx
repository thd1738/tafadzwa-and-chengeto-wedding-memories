import React, { useState, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { compressImage } from '../utils/compressor';
import { Memory, MemoryCategory } from '../types';
import { CloudUpload, X, CheckCircle, Camera, ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPhoto, setIsPhoto] = useState(true);

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<MemoryCategory>(MemoryCategory.CEREMONY);

  // States
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process the selected file (either via drop or filepicker)
  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const sizeInMB = selectedFile.size / (1024 * 1024);

    if (fileType.startsWith('image/')) {
      setIsPhoto(true);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorText('');
    } else if (fileType.startsWith('video/')) {
      setIsPhoto(false);
      // Hard check for videos to ensure they are short so they fit in Firestore
      if (sizeInMB > 4.5) {
        setErrorText('To ensure quick sharing, videos must be under 4.5MB. Please choose a shorter clip.');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorText('');
    } else {
      setErrorText('Only photos (.jpg, .png, .webp) and videos (.mp4, .mov) are supported.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'guestName') setGuestName(value);
    if (name === 'caption') setCaption(value);
    if (name === 'category') setCategory(value as MemoryCategory);
  };

  // Submit and Upload to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !guestName.trim()) {
      setErrorText('Guest name and a photo/video file are required.');
      return;
    }

    setIsUploading(true);
    setErrorText('');
    setUploadPercent(10);

    try {
      let finalDataUrl = '';
      
      if (isPhoto) {
        setIsCompressing(true);
        // Compress image using canvas
        finalDataUrl = await compressImage(file, 960, 960, 0.65);
        setIsCompressing(false);
      } else {
        // Video file raw base64 converter (requires short videos)
        finalDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      setUploadPercent(60);

      const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowISO = new Date().toISOString();

      const memoryPayload: Memory = {
        id: memoryId,
        type: isPhoto ? 'photo' : 'video',
        url: finalDataUrl,
        category,
        caption: caption.trim() || 'Sharing the love! ✨',
        guestName: guestName.trim(),
        likes: 0,
        createdAt: nowISO
      };

      setUploadPercent(85);

      // Save memory directly to firestore (complying with standard handles)
      const memoryPath = `memories/${memoryId}`;
      try {
        await setDoc(doc(db, 'memories', memoryId), memoryPayload);
      } catch (firestoreErr) {
        // Log detailed security rules reports of the failure using conforming helper
        handleFirestoreError(firestoreErr, OperationType.WRITE, memoryPath);
      }

      // Also cache user's own uploads locally in case offline
      try {
        const locallySaved = localStorage.getItem('wedding_custom_uploads');
        const list = locallySaved ? JSON.parse(locallySaved) : [];
        list.push(memoryPayload);
        localStorage.setItem('wedding_custom_uploads', JSON.stringify(list));
      } catch (err) {
        console.warn('LocalStorage caching of upload failed:', err);
      }

      setUploadPercent(100);
      setSuccess(true);
      
    } catch (err) {
      console.error('File Upload Failure:', err);
      setErrorText(err instanceof Error ? 'Upload denied. Please ensure your fields conform to memory boundaries.' : 'An unexpected error occurred during uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetUploadState = () => {
    setFile(null);
    setPreviewUrl('');
    setGuestName('');
    setCaption('');
    setCategory(MemoryCategory.CEREMONY);
    setSuccess(false);
    setErrorText('');
    setUploadPercent(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#2B2B2B]/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#E8DDD0] z-10 font-sans pointer-events-auto"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E8DDD0] bg-[#FFF9F2]">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2B2B2B] flex items-center gap-2">
                <CloudUpload className="h-5 w-5 text-[#D4AF37]" />
                <span>Share Luxury Memories</span>
              </h3>
              <p className="text-[10px] text-[#2B2B2B]/50 uppercase tracking-widest mt-0.5">
                Anonymous Fast Upload Portal
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors pointer-events-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {success ? (
              
              /* SUCCESS MESSAGE ANIMATION */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 space-y-5"
              >
                <div className="relative inline-block">
                  <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                  {/* Glowing halo rings */}
                  <span className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-ping scale-110" />
                </div>
                
                <h4 className="font-serif text-2xl text-[#2B2B2B]">
                  Shared Perfectly!
                </h4>
                
                <p className="text-sm text-[#2B2B2B]/70 max-w-sm mx-auto leading-relaxed">
                  "Thank you for sharing your special memories with Tafadzwa & Chengeto."
                </p>
                
                <div className="p-4 bg-[#FFF9F2] rounded-xl border border-[#E8DDD0] text-[11px] text-[#2B2B2B]/60 max-w-xs mx-auto italic">
                  Your upload has been processed and is now broadcasting live on the wedding board gallery.
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={resetUploadState}
                    className="px-5 py-2 rounded-full border border-[#E8DDD0] bg-white hover:bg-neutral-50 text-xs font-semibold tracking-wider uppercase transition-colors text-[#2B2B2B]"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-full bg-[#2B2B2B] hover:bg-[#D4AF37] text-white hover:text-[#2B2B2B] text-xs font-semibold tracking-wider uppercase transition-colors"
                  >
                    View Gallery
                  </button>
                </div>
              </motion.div>
              
            ) : (
              
              /* FILE UPLOADER & FORM PANEL */
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Upload drag drop container */}
                {!previewUrl ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300 relative group min-h-[160px] ${
                      dragActive
                        ? 'border-[#D4AF37] bg-[#FFF9F2]'
                        : 'border-[#E8DDD0] bg-neutral-50 hover:bg-white hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files && processFile(e.target.files[0])}
                      className="hidden"
                      accept="image/*,video/*"
                      capture="environment" // open camera directly on smartphones
                    />

                    <div className="h-12 w-12 rounded-full bg-white border border-[#E8DDD0] flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#D4AF37] transition-all mb-3">
                      <CloudUpload className="h-6 w-6" />
                    </div>

                    <p className="text-sm font-medium text-[#2B2B2B] leading-none">
                      Tap to open Photo Library or Camera
                    </p>
                    <p className="text-xs text-[#2B2B2B]/50 mt-2">
                      Supports high-res wedding photos and short clips
                    </p>
                  </div>
                ) : (
                  /* File selected thumbnail preview */
                  <div className="relative rounded-xl overflow-hidden border border-[#E8DDD0] bg-neutral-900 group aspect-video flex items-center justify-center">
                    {isPhoto ? (
                      <img
                        src={previewUrl}
                        alt="Upload Preview"
                        className="max-h-[220px] object-contain w-full"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        className="max-h-[220px] object-contain w-full"
                        muted
                        controls
                      />
                    )}
                    
                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl('');
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#2B2B2B] h-8 w-8 rounded-full flex items-center justify-center transition-colors shadow-md border border-[#E8DDD0] pointer-events-auto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-white flex items-center gap-1">
                      {isPhoto ? <ImageIcon className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                      <span>Ready for compression & upload</span>
                    </div>
                  </div>
                )}

                {/* Main Fields Form */}
                <div className="space-y-4">
                  
                  {/* Guest Name input */}
                  <div>
                    <label className="text-xs font-semibold text-[#2B2B2B]/85 block mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="guestName"
                      required
                      placeholder="e.g. Aunt Chipo, Cousin Simba, Uncle Farai..."
                      value={guestName}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FFF9F2]/20 text-[#2B2B2B]"
                    />
                  </div>

                  {/* Category dropdown selector */}
                  <div>
                    <label className="text-xs font-semibold text-[#2B2B2B]/85 block mb-1.5 uppercase tracking-wider">
                      Wedding Event Category
                    </label>
                    <select
                      name="category"
                      value={category}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FFF9F2]/20 text-[#2B2B2B]"
                    >
                      {Object.values(MemoryCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Caption box */}
                  <div>
                    <label className="text-xs font-semibold text-[#2B2B2B]/85 block mb-1.5 uppercase tracking-wider">
                      Caption / Message
                    </label>
                    <textarea
                      name="caption"
                      rows={2}
                      placeholder="Write a sweet, romantic, or celebratory note..."
                      value={caption}
                      onChange={handleFieldChange}
                      maxLength={300}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FFF9F2]/20 text-[#2B2B2B] resize-none"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorText && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                    <span className="leading-relaxed font-medium">{errorText}</span>
                  </div>
                )}

                {/* Submitting Status indicator loading view */}
                {isUploading ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#2B2B2B] font-sans">
                      <span className="flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="h-3.5 w-3.5 text-[#D4AF37] animate-spin" />
                        <span>{isCompressing ? 'Compressing high-res asset...' : 'Uploading secure payload...'}</span>
                      </span>
                      <span>{uploadPercent}%</span>
                    </div>
                    {/* Elegant Gold Progress slide bar */}
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full gold-gradient-bg"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadPercent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                ) : (
                  /* Action submit buttons */
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/3 py-3 rounded-full border border-[#E8DDD0] bg-white hover:bg-neutral-50 text-xs font-medium text-[#2B2B2B] uppercase tracking-wider transition-colors pointer-events-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 rounded-full bg-[#2B2B2B] hover:bg-[#D4AF37] text-white hover:text-[#2B2B2B] text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg pointer-events-auto"
                    >
                      Share Story
                    </button>
                  </div>
                )}

              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
