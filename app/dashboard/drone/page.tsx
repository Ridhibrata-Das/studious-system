'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';

export default function DroneViewPage() {
  const [model, setModel] = useState<'ssun' | 'lstm' | 'mscnn'>('ssun');
  const [datasetId, setDatasetId] = useState<'1' | '2' | '6'>('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showFigures, setShowFigures] = useState(false);
  const [figureImages, setFigureImages] = useState<{[key: string]: string}>({});

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(figureImages).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [figureImages]);

  const loadFigureImages = async (datasetId: string) => {
    try {
      const imageTypes = ['fc', 'gt', 'pr', 'legend'];
      const images: {[key: string]: string} = {};
      
      for (const type of imageTypes) {
        try {
          const response = await fetch(`/api/ml/hsi/figure/${datasetId}/${type}`);
          if (response.ok) {
            const blob = await response.blob();
            images[type] = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.warn(`Failed to load ${type} image:`, error);
        }
      }
      
      setFigureImages(images);
    } catch (error) {
      console.error('Error loading figure images:', error);
    }
  };

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setShowFigures(false);
      setFigureImages({});
      
      const route = model === 'ssun' ? '/api/ml/hsi/ssun-map' : model === 'lstm' ? '/api/ml/hsi/lstm-map' : '/api/ml/hsi/mscnn-map';
      const res = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: Number(datasetId) })
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || 'Failed to run analysis');
      }
      setResult(data);
      
      // Load figure images after 10 seconds
      setTimeout(async () => {
        await loadFigureImages(datasetId);
        setShowFigures(true);
        toast.success('Reference images loaded');
      }, 10000);
      
      toast.success('Analysis completed');
    } catch (e: any) {
      toast.error(e?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const runUpload = async () => {
    if (!file) {
      toast.error('Please choose a .mat file');
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.set('model', model);
      form.set('file', file, file.name);
      const res = await fetch('/api/ml/hsi/upload-map', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || 'Upload failed');
      setResult(data);
      toast.success('Uploaded and analyzed');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Drone / HSI Analysis</h1>
          <div className="flex items-center gap-3">
            <Select value={datasetId} onValueChange={(v:any) => setDatasetId(v)}>
              <SelectTrigger className="w-[160px] bg-white/10 text-white border-white/30">
                <SelectValue placeholder="Dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pavia University</SelectItem>
                <SelectItem value="2">Indian Pines</SelectItem>
                <SelectItem value="6">KSC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={model} onValueChange={(v:any) => setModel(v)}>
              <SelectTrigger className="w-[140px] bg-white/10 text-white border-white/30">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssun">Pipeline (Joint)</SelectItem>
                <SelectItem value="lstm">LSTM (Spectral)</SelectItem>
                <SelectItem value="mscnn">MSCNN (Spatial)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Analyzing…' : 'Analyze'}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload .mat cube</label>
              <input type="file" accept=".mat" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={runUpload} disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700">Upload & Analyze</Button>
          </div>
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          {!result && <p className="text-sm text-gray-600">Choose dataset and model, then click Analyze.</p>}
          {result?.png_b64 && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-[610px] h-auto">
                <Image
                  src={`data:image/png;base64,${result.png_b64}`}
                  alt="Classification Map"
                  width={610}
                  height={340}
                  className="rounded-lg border"
                />
                {result?.legend_png_b64 && (
                  <div className="mt-4">
                    <Image
                      src={`data:image/jpeg;base64,${result.legend_png_b64}`}
                      alt="Legend"
                      width={610}
                      height={200}
                      className="rounded-lg border"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded">Overall Acc.: {result.oa ? (result.oa*100).toFixed(2)+'%' : '—'}</div>
                  <div className="p-3 bg-gray-50 rounded">Kappa: {result.kappa ? result.kappa.toFixed(3) : '—'}</div>
                  <div className="col-span-2 p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-2">Class Counts</div>
                    <pre className="text-xs overflow-auto">{JSON.stringify(result.class_counts, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Reference Images Section */}
        {showFigures && Object.keys(figureImages).length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Reference Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {figureImages.fc && (
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2">Feature Classification</h3>
                  <Image
                    src={figureImages.fc}
                    alt="Feature Classification"
                    width={200}
                    height={150}
                    className="rounded-lg border mx-auto"
                  />
                </div>
              )}
              {figureImages.gt && (
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2">Ground Truth</h3>
                  <Image
                    src={figureImages.gt}
                    alt="Ground Truth"
                    width={200}
                    height={150}
                    className="rounded-lg border mx-auto"
                  />
                </div>
              )}
              {figureImages.pr && (
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2">Prediction</h3>
                  <Image
                    src={figureImages.pr}
                    alt="Prediction"
                    width={200}
                    height={150}
                    className="rounded-lg border mx-auto"
                  />
                </div>
              )}
              {figureImages.legend && (
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2">Legend</h3>
                  <Image
                    src={figureImages.legend}
                    alt="Legend"
                    width={200}
                    height={150}
                    className="rounded-lg border mx-auto"
                  />
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}


