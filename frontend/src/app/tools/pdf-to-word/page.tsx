"use client";
import { API_BASE_URL } from "@/config/api";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, FileType, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFToWordTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
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
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/pdf-to-word`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '.docx');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'PDF converted to Word document successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to process document.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          <FileType className="h-10 w-10 text-indigo-600" />
          PDF to Word Converter
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Extract text from your PDF files into easy-to-edit DOCX documents.
        </p>
      </div>

      <Card className="shadow-2xl border-0 bg-white/60 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle>Select PDF Document</CardTitle>
          <CardDescription>Upload your .pdf file to extract its text to Word.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {!file ? (
            <div className="border-2 border-dashed border-indigo-200 rounded-3xl p-16 text-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
              <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="bg-indigo-100 p-4 rounded-full mb-4">
                  <Upload className="h-10 w-10 text-indigo-600" />
                </div>
                <span className="text-xl font-semibold text-slate-700 mb-2">Click to select PDF file</span>
                <span className="text-sm text-slate-500">Supports .pdf files</span>
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500" 
                onClick={() => setFile(null)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <FileText className="h-10 w-10 text-indigo-600" />
              </div>
              <p className="font-semibold text-slate-800 text-lg mb-1 text-center">{file.name}</p>
              <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              <Button 
                onClick={handleProcess} 
                disabled={isProcessing} 
                className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg rounded-xl shadow-lg shadow-indigo-200 w-full max-w-sm"
              >
                {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <FileType className="mr-2 h-6 w-6" />}
                Convert to Word
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
