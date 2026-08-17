"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, Loader2, Download, Trash2, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFMergeTool() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (newFiles.length !== e.target.files.length) {
        toast({ title: 'Invalid Files', description: 'Only PDF files are allowed.', type: 'error' });
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

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({ title: 'Not enough files', description: 'Please select at least 2 PDF files to merge.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:3001/api/pdf/merge', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'PDF merge failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
      
      toast({ title: 'Success', description: 'PDFs merged successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to merge PDFs.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Merge PDF Files</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Combine multiple PDF documents into one single file, in the exact order you want.</p>
      </div>

      <Card className="shadow-lg border-slate-200 dark:border-slate-800">
        <CardContent className="p-8">
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors mb-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" accept=".pdf" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Select PDF files</h3>
            <p className="text-sm text-slate-500">or drop PDFs here</p>
          </div>

          {files.length > 0 && (
            <div className="text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border mb-8">
              <h4 className="font-medium mb-4 text-slate-700 dark:text-slate-300">Files to merge ({files.length})</h4>
              <div className="space-y-2">
                {files?.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded shadow-sm border">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-red-500 mr-3" />
                      <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveUp(idx)} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveDown(idx)} disabled={idx === files.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeFile(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultUrl ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-6 rounded-lg">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-4">Your merged PDF is ready!</h3>
              <div className="flex justify-center gap-4">
                <a href={resultUrl} download="Merged_Document.pdf" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-green-600 text-white hover:bg-green-700">
                  <Download className="w-5 h-5 mr-2" /> Download Merged PDF
                </a>
                <Button variant="outline" size="lg" onClick={() => { setFiles([]); setResultUrl(null); }}>
                  Merge More Files
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-12 bg-blue-600 hover:bg-blue-700" 
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Merge PDFs'}
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

// Ensure the icon used exists, adding CheckCircle2 import manually if it was missing in the top block.
// Wait, I forgot to import CheckCircle2 at the top. Let's fix that.
