"use client";
import { API_BASE_URL } from "@/config/api";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, Loader2, Download, Trash2, CheckCircle2, Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFSplitTool() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        toast({ title: 'Invalid File', description: 'Please select a valid PDF file.', type: 'error' });
        return;
      }
      setFile(selectedFile);
      setResultUrl(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResultUrl(null);
  };

  const handleSplit = async () => {
    if (!file) {
      toast({ title: 'No file', description: 'Please select a PDF file first.', type: 'error' });
      return;
    }
    
    if (startPage < 1 || endPage < startPage) {
      toast({ title: 'Invalid Range', description: 'End page must be greater than or equal to start page (and min 1).', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('startPage', startPage.toString());
      formData.append('endPage', endPage.toString());

      const response = await fetch(`${API_BASE_URL}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'PDF split failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
      
      toast({ title: 'Success', description: 'PDF split successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to split PDF.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Split PDF</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Extract a specific range of pages from a PDF document.</p>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <File className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{file.name}</h4>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={removeFile}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {!resultUrl && (
                <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-800 p-6 rounded-lg border">
                  <div>
                    <Label className="mb-2 block">Extract from page</Label>
                    <Input type="number" min="1" value={startPage} onChange={(e) => setStartPage(parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <Label className="mb-2 block">to page</Label>
                    <Input type="number" min="1" value={endPage} onChange={(e) => setEndPage(parseInt(e.target.value) || 1)} />
                  </div>
                </div>
              )}
            </div>
          )}

          {resultUrl ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-6 rounded-lg">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-4">Your split PDF is ready!</h3>
              <div className="flex justify-center gap-4">
                <a href={resultUrl} download={`Split_${file?.name || 'Document.pdf'}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-green-600 text-white hover:bg-green-700">
                  <Download className="w-5 h-5 mr-2" /> Download Extracted Pages
                </a>
                <Button variant="outline" size="lg" onClick={removeFile}>
                  Split Another File
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-12 bg-rose-600 hover:bg-rose-700 text-white" 
              onClick={handleSplit}
              disabled={!file || isProcessing}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <><Scissors className="w-5 h-5 mr-2" /> Split PDF</>}
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
