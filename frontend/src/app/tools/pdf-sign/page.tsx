"use client";
import { API_BASE_URL } from "@/config/api";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, PenTool, Trash2, Eraser } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SignatureCanvas from 'react-signature-canvas';

export default function PDFSignTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

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

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleProcess = async () => {
    if (!file) {
      toast({ title: 'No file', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }
    
    if (sigCanvas.current?.isEmpty()) {
      toast({ title: 'No signature', description: 'Please draw your signature first.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    
    try {
      const signatureBase64 = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
      
      const formData = new FormData();
      formData.append('file', file);
      if (signatureBase64) formData.append('signature', signatureBase64);

      const res = await fetch(`${API_BASE_URL}/api/pdf/sign`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Signed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'Your signed PDF has been downloaded.' });
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
          <PenTool className="h-10 w-10 text-indigo-600" />
          Sign PDF Document
        </h1>
        <p className="text-slate-600 text-lg">Draw your signature and automatically stamp it onto your PDF.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>1. Select PDF</CardTitle>
            <CardDescription>Upload the PDF document you want to sign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!file ? (
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors h-64 flex flex-col items-center justify-center">
                <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-12 w-12 text-indigo-400 mb-4" />
                  <span className="text-lg font-semibold text-slate-700">Click to upload PDF</span>
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                <FileText className="h-16 w-16 text-indigo-500 mb-4" />
                <p className="font-medium text-slate-700 text-center mb-1 truncate max-w-[250px]">{file.name}</p>
                <p className="text-xs text-slate-400 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="outline" onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>2. Draw Signature</CardTitle>
            <CardDescription>Use your mouse or touch screen to draw.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-inner relative">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: 'w-full h-48 cursor-crosshair' }}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearSignature} 
                className="absolute bottom-2 right-2 text-slate-500 hover:text-slate-800"
              >
                <Eraser className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            
            <Button onClick={handleProcess} disabled={isProcessing || !file} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg rounded-xl">
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PenTool className="mr-2 h-5 w-5" />}
              Sign and Download PDF
            </Button>
            
            <p className="text-xs text-slate-400 text-center">
              Your signature will be placed on the first page of the document.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
