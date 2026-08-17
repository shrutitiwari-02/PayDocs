"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

export default function PDFToImageTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        toast({ title: 'Invalid File', description: 'Only PDF files are allowed.', variant: 'destructive' });
        return;
      }
      setFile(f);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      toast({ title: 'No file', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const zip = new JSZip();
      
      const numPages = pdf.numPages;
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for high quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        
        if (blob) {
          zip.file(`page-${i}.jpg`, blob);
        }
        
        setProgress(Math.round((i / numPages) * 100));
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Extracted_Images_${file.name.replace('.pdf', '')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'Images extracted and downloaded as ZIP.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to extract images.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          <ImageIcon className="h-10 w-10 text-indigo-600" />
          PDF to Image Extractor
        </h1>
        <p className="text-slate-600 text-lg">Extract every page of your PDF as a high-quality JPG image.</p>
      </div>

      <Card className="max-w-xl mx-auto shadow-xl border-0 bg-white/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Select PDF</CardTitle>
          <CardDescription>Upload a PDF document to extract images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
              <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-12 w-12 text-indigo-400 mb-4" />
                <span className="text-lg font-semibold text-slate-700">Click to upload PDF</span>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-500" />
                <div>
                  <p className="font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 hover:bg-red-50" disabled={isProcessing}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )}

          {file && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <Button onClick={handleProcess} disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg rounded-xl relative overflow-hidden">
                {isProcessing && (
                  <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/50 transition-all duration-300" style={{ width: `${progress}%` }} />
                )}
                <span className="relative flex items-center justify-center">
                  {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ImageIcon className="mr-2 h-5 w-5" />}
                  {isProcessing ? `Extracting Images... ${progress}%` : 'Extract Images'}
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
