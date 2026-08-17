"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, Download, Trash2, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFRotateTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState('90');
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('rotation', rotation);

      const res = await fetch('http://localhost:3001/api/pdf/rotate', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rotated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'Your rotated PDF has been downloaded.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to process PDF.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          <RotateCw className="h-10 w-10 text-indigo-600" />
          Rotate PDF Pages
        </h1>
        <p className="text-slate-600 text-lg">Easily rotate all pages in your PDF by 90, 180, or 270 degrees.</p>
      </div>

      <Card className="max-w-xl mx-auto shadow-xl border-0 bg-white/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Select PDF & Rotation</CardTitle>
          <CardDescription>Upload a PDF document to rotate its pages.</CardDescription>
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
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
            </div>
          )}

          {file && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label className="text-slate-700">Rotation Angle</Label>
                <Select value={rotation} onValueChange={(val) => setRotation(val || '90')}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select rotation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 Degrees (Clockwise)</SelectItem>
                    <SelectItem value="180">180 Degrees</SelectItem>
                    <SelectItem value="270">270 Degrees (Counter-clockwise)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleProcess} disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg rounded-xl">
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RotateCw className="mr-2 h-5 w-5" />}
                Rotate PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
