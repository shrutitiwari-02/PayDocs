"use client";
import { API_BASE_URL } from "@/config/api";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, Loader2, Download, Trash2, CheckCircle2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFCompressTool() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        toast({ title: 'Invalid File', description: 'Please select a valid PDF file.', type: 'error' });
        return;
      }
      setFile(selectedFile);
      setResultUrl(null);
      setResultSize(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResultUrl(null);
    setResultSize(null);
  };

  const handleCompress = async () => {
    if (!file) {
      toast({ title: 'No file', description: 'Please select a PDF file first.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);
    setResultSize(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/pdf/compress`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'PDF compress failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      
      toast({ title: 'Success', description: 'PDF compressed successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to compress PDF.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Compress PDF</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Reduce the file size of your PDF documents by removing unnecessary objects.</p>
      </div>

      <Card className="shadow-lg border-slate-200 dark:border-slate-800">
        <CardContent className="p-8">
          
          {!file ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors mb-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Select a PDF file</h3>
              <p className="text-sm text-slate-500">or drop a PDF here</p>
            </div>
          ) : (
            <div className="text-left bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-slate-500">Original Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={removeFile}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {resultUrl ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-xl font-bold mb-2">Your compressed PDF is ready!</h3>
              
              {resultSize && file && (
                <div className="flex justify-center gap-8 mb-6 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider mb-1">Old Size</p>
                    <p className="text-2xl font-bold text-slate-500 line-through">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider mb-1">New Size</p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{(resultSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <a href={resultUrl} download={`Compressed_${file?.name || 'Document.pdf'}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700">
                  <Download className="w-5 h-5 mr-2" /> Download Compressed PDF
                </a>
                <Button variant="outline" size="lg" onClick={removeFile}>
                  Compress Another File
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-12 bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={handleCompress}
              disabled={!file || isProcessing}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <><Minimize2 className="w-5 h-5 mr-2" /> Compress PDF</>}
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
