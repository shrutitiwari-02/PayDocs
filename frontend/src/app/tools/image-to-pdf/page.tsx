"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, Loader2, Download, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageToPDFTool() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (newFiles.length !== e.target.files.length) {
        toast({ title: 'Invalid Files', description: 'Only image files (JPG/PNG) are allowed.', variant: 'destructive' });
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index - 1];
    newFiles[index - 1] = newFiles[index];
    newFiles[index] = temp;
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index + 1];
    newFiles[index + 1] = newFiles[index];
    newFiles[index] = temp;
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({ title: 'No files', description: 'Please select at least one image file.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const res = await fetch('http://localhost:3001/api/pdf/image-to-pdf', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Images_to_PDF_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'Your PDF has been downloaded.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to convert images.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          <FileImage className="h-10 w-10 text-indigo-600" />
          Image to PDF Converter
        </h1>
        <p className="text-slate-600 text-lg">Convert your JPG and PNG images into a single PDF document.</p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-xl border-0 bg-white/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Select Images</CardTitle>
          <CardDescription>Upload your images and arrange them in the desired order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
            <input type="file" multiple accept="image/jpeg, image/png" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-12 w-12 text-indigo-400 mb-4" />
              <span className="text-lg font-semibold text-slate-700">Click to upload images</span>
              <span className="text-sm text-slate-500 mt-2">Supports JPG, PNG</span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-3 mt-8">
              {files?.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileImage className="h-6 w-6 text-indigo-500" />
                    <div>
                      <p className="font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === files.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              
              <Button onClick={handleConvert} disabled={isProcessing} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 h-12 text-lg rounded-xl">
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                Convert to PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
