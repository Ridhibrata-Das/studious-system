'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Layers, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const MATLAB_IMAGES = [
  '/images/matlab/result_0.png',
  '/images/matlab/result_1.png',
  '/images/matlab/result_2.png',
  '/images/matlab/result_3.png',
  '/images/matlab/result_4.png',
  '/images/matlab/result_5.png',
  '/images/matlab/result_6.png',
  '/images/matlab/result_7.png',
  '/images/matlab/result_8.png',
  '/images/matlab/result_9.png',
];

const MULTISPECTRAL_FOLDERS = [
  'IMG_210204_095113_0000_RED',
  'IMG_210204_095115_0001_RED',
  'IMG_210204_095117_0002_RED',
  'IMG_210204_095119_0003_RED',
  'IMG_210204_095121_0004_RED',
  'IMG_210204_095123_0005_RED'
];

const MULTISPECTRAL_SUFFIXES = [
  '_NDVI.png',
  '_NDWI.png',
  '_SAVI.png',
  '_VARI.png',
  '_mask_NDVI.png',
  '_mask_NDWI.png',
  '_mask_SAVI.png',
  '_mask_VARI.png',
  '_overlay_annot.png'
];

export default function AnalyticsPage() {
  const [selectedImage, setSelectedImage] = useState(MATLAB_IMAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [raspiImages, setRaspiImages] = useState<{ url: string; timestamp: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [multispectralFolder, setMultispectralFolder] = useState(MULTISPECTRAL_FOLDERS[0]);

  useEffect(() => {
    // Pick a random image on mount
    const random = MATLAB_IMAGES[Math.floor(Math.random() * MATLAB_IMAGES.length)];
    setSelectedImage(random);

    // Pick random multispectral folder
    const randomFolder = MULTISPECTRAL_FOLDERS[Math.floor(Math.random() * MULTISPECTRAL_FOLDERS.length)];
    setMultispectralFolder(randomFolder);

    fetchRaspiImages();
  }, []);

  const fetchRaspiImages = async () => {
    try {
      setLoadingImages(true);

      // 1. List root folders (newest first)
      const { data: rootItems, error: rootError } = await supabase
        .storage
        .from('multispec-frames')
        .list('', { limit: 20, offset: 0, sortBy: { column: 'name', order: 'desc' } }); // Fetch top 20 to be safe

      if (rootError || !rootItems) {
        console.error('Error fetching root folders:', rootError);
        setLoadingImages(false);
        return;
      }

      // Filter for matching folders
      const frameFolders = rootItems.filter(item =>
        item.id === null &&
        item.name.match(/frame_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
      );

      if (frameFolders.length === 0) {
        console.log('No matching frame folders found');
        setRaspiImages([]);
        setLoadingImages(false);
        return;
      }

      // 2. Iterate to find the first folder with >= 9 images
      let selectedImages: { url: string; timestamp: string }[] = [];

      for (const folder of frameFolders) {
        // Extract timestamp
        const match = folder.name.match(/frame_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
        let folderTimestamp = '';
        if (match) {
          folderTimestamp = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
        }

        // List files in this folder
        const { data: folderItems, error: folderError } = await supabase
          .storage
          .from('multispec-frames')
          .list(folder.name, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });

        if (folderError || !folderItems) continue;

        const images: { url: string; timestamp: string }[] = [];

        for (const item of folderItems) {
          const isImage = item.metadata?.mimetype?.startsWith('image/') ||
            item.name.toLowerCase().endsWith('.jpg') ||
            item.name.toLowerCase().endsWith('.jpeg') ||
            item.name.toLowerCase().endsWith('.png');

          if (isImage) {
            const { data: { publicUrl } } = supabase.storage.from('multispec-frames').getPublicUrl(`${folder.name}/${item.name}`);
            images.push({ url: publicUrl, timestamp: folderTimestamp });
          }
        }

        // If we found a complete set (or close to it), use it and stop
        if (images.length >= 9) {
          selectedImages = images;
          break;
        }

        // Optional: If we haven't found a "good" folder yet, keep the "best so far" (e.g. the one with most images)?
        // For now, let's just stick to "first one with >= 9". 
        // If we loop through all and find none with >= 9, we might want to show the first one anyway?
        if (selectedImages.length === 0) {
          selectedImages = images; // Fallback to the newest one even if incomplete, initially
        } else if (images.length > selectedImages.length) {
          selectedImages = images; // Or upgrade to one with more images
        }
      }

      // 3. Set state
      setRaspiImages(selectedImages.slice(0, 9));

    } catch (e) {
      console.error('Exception fetching images:', e);
    } finally {
      setLoadingImages(false);
    }
  };

  const refreshAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      const random = MATLAB_IMAGES[Math.floor(Math.random() * MATLAB_IMAGES.length)];
      setSelectedImage(random);

      const randomFolder = MULTISPECTRAL_FOLDERS[Math.floor(Math.random() * MULTISPECTRAL_FOLDERS.length)];
      setMultispectralFolder(randomFolder);

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Analytics</h1>
          <p className="text-gray-500 mt-1">Advanced spectral analysis and raw data access</p>
        </div>
        <Button onClick={refreshAnalysis} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weed Detection Multispectral */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Weed Detection (Multispectral)</h2>
            </div>
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">MATLAB Output</span>
          </div>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={selectedImage}
              alt="Weed Detection Output"
              fill
              className="object-contain"
            />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>Analysis:</strong> Weed density map generated using multispectral indices. Red areas indicate high weed probability.
          </div>
        </Card>

        {/* Hyperspectral Output */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">Hyperspectral Output</h2>
            </div>
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">Spectral Cube</span>
          </div>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src="/images/hyperspectral.png"
              alt="Hyperspectral Output"
              fill
              className="object-contain"
            />
          </div>
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800">
            <strong>Spectral Signature:</strong> Analyzing 150 bands for precise crop health monitoring and disease detection.
          </div>
        </Card>
      </div>

      {/* Multispectral Outputs (New Section) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Multispectral Outputs</h2>
          </div>
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{multispectralFolder}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {MULTISPECTRAL_SUFFIXES.map((suffix, idx) => (
            <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
              <Image
                src={`/images/multispectral/${multispectralFolder}/${multispectralFolder}${suffix}`}
                alt={`Multispectral ${suffix}`}
                fill
                className="object-contain transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                {suffix.replace(/_/g, ' ').replace('.png', '').trim()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Raspi Cam Data (Supabase Images) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Raspi Cam Output (Supabase)</h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRaspiImages} disabled={loadingImages}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingImages ? 'animate-spin' : ''}`} />
            Refresh Images
          </Button>
        </div>

        {loadingImages ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : raspiImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {raspiImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                <Image
                  src={img.url}
                  alt={`Raspi Cam Capture ${idx + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                  {img.timestamp || `Image ${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            No images found in 'multispec-frames' bucket.
          </div>
        )}
      </Card>
    </div>
  );
}
