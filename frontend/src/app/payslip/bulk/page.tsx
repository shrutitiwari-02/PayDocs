"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Template1 } from '@/components/templates/payslip/Template1';
import { calculatePayslip, PayslipInput } from '@paydocs/shared';
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GuestSaveNotice } from '@/components/GuestSaveNotice';
import Papa from 'papaparse';
import { z } from 'zod';

const payslipRowSchema = z.object({
  EmployeeName: z.string().min(1, 'Employee Name is required'),
  EmployeeID: z.string().min(1, 'Employee ID is required'),
  BasicSalary: z.coerce.number().min(1, 'Basic Salary must be greater than 0'),
  HRA: z.coerce.number().min(0, 'HRA cannot be negative'),
  TransportAllowance: z.coerce.number().min(0).optional().default(0),
  MedicalAllowance: z.coerce.number().min(0).optional().default(0),
  PF: z.coerce.number().min(0).optional().default(0),
  TDS: z.coerce.number().min(0).optional().default(0),
});

interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  resultUrl?: string;
  error?: string;
}

export default function BulkPayslipGenerator() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [payPeriod, setPayPeriod] = useState('July 2026');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  const downloadSampleCSV = () => {
    const csvContent = "EmployeeName,EmployeeID,Designation,Department,BasicSalary,HRA,TransportAllowance,MedicalAllowance,PF,TDS\nJohn Doe,EMP-001,Software Engineer,Engineering,50000,20000,5000,2000,3000,2000\nJane Smith,EMP-002,Product Manager,Product,70000,25000,6000,3000,4000,5000";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "payslip_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({ title: 'Invalid File', description: 'Please upload a valid CSV file.', type: 'error' });
      return;
    }

    setValidationErrors([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const errors: string[] = [];
        
        data.forEach((row, index) => {
          const parsed = payslipRowSchema.safeParse(row);
          if (!parsed.success) {
            const rowErrors = parsed.error.issues.map(issue => issue.message).join(', ');
            errors.push(`Row ${index + 2}: ${rowErrors}`);
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
          setParsedData([]);
          toast({ title: 'Validation Failed', description: `Found ${errors.length} row errors. Please fix them.`, type: 'error' });
        } else {
          setParsedData(data);
          toast({ title: 'CSV Validated', description: `Successfully loaded and validated ${data.length} records.` });
        }
      },
      error: (error) => {
        toast({ title: 'Parse Error', description: error.message, type: 'error' });
      }
    });
  };

  const generateBulk = async () => {
    if (parsedData.length === 0) {
      toast({ title: 'No Data', description: 'Please upload a valid CSV file first.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setJobStatus(null);
    
    try {
      const ReactDOMServer = (await import('react-dom/server')).default;
      
      const items = parsedData.map(row => {
        const input: PayslipInput = {
          basic: parseFloat(row.BasicSalary) || 0,
          hra: parseFloat(row.HRA) || 0,
          allowances: [
            { id: '1', name: 'Transport', amount: parseFloat(row.TransportAllowance) || 0 },
            { id: '2', name: 'Medical', amount: parseFloat(row.MedicalAllowance) || 0 }
          ].filter(a => a.amount > 0),
          deductions: [
            { id: '1', name: 'PF', amount: parseFloat(row.PF) || 0 },
            { id: '2', name: 'TDS', amount: parseFloat(row.TDS) || 0 }
          ].filter(d => d.amount > 0)
        };
        
        const result = calculatePayslip(input);
        
        const element = (
          <Template1 
            input={input} 
            result={result} 
            companyName={companyName}
            employeeName={row.EmployeeName || 'Unknown'}
            employeeId={row.EmployeeID || 'N/A'}
            designation={row.Designation || 'N/A'}
            department={row.Department || 'N/A'}
            payPeriod={payPeriod}
          />
        );
        
        const htmlString = ReactDOMServer.renderToString(element);
        const fullHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            ${htmlString}
          </body>
          </html>
        `;
        
        return {
          employeeName: row.EmployeeName || 'Unknown',
          employeeId: row.EmployeeID || 'NA',
          html: fullHtml
        };
      });

      const response = await fetch('http://localhost:3001/api/pdf/payslip/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) throw new Error('Failed to start job');
      const data = await response.json();
      
      pollJobStatus(data.jobId);

    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to initiate bulk generation.', type: 'error' });
      setIsProcessing(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/jobs/${jobId}`);
        const status = await response.json();
        
        setJobStatus(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setIsProcessing(false);
          if (status.status === 'completed') {
            toast({ title: 'Job Completed!', description: 'Your ZIP file is ready.' });
          } else {
            toast({ title: 'Job Failed', description: status.error, type: 'error' });
          }
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <GuestSaveNotice documentType="batch of payslips" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bulk Payslip Generator</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Generate hundreds of payslips in seconds via CSV upload.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>These details apply to all generated payslips.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pay Period</Label>
              <Input value={payPeriod} onChange={e => setPayPeriod(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
              <div>
                <p className="font-semibold text-sm">Need the template?</p>
                <p className="text-xs text-slate-500">Download our sample CSV to see the required format.</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Sample CSV
              </Button>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" />
              <h3 className="font-semibold mb-1">Click or drag CSV file</h3>
              <p className="text-sm text-slate-500 mb-4">Ensure columns match the sample template.</p>
              <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-bold flex items-center mb-2"><AlertCircle className="w-4 h-4 mr-2"/> Validation Errors</h4>
                <ul className="list-disc pl-5 text-sm space-y-1 max-h-40 overflow-y-auto">
                  {validationErrors?.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedData.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex items-center justify-between">
                <span className="font-medium">✅ {parsedData.length} records loaded successfully</span>
                <Button onClick={generateBulk} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Generate Bulk PDFs'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {jobStatus && (
          <Card className="border-blue-200 shadow-md">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                {jobStatus.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> : 
                 jobStatus.status === 'failed' ? <AlertCircle className="w-5 h-5 text-red-500 mr-2" /> :
                 <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />}
                Job Status: {jobStatus.status.toUpperCase()}
              </h3>
              
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 dark:bg-slate-700 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(jobStatus.progress / jobStatus.total) * 100}%` }}></div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-4">{jobStatus.progress} of {jobStatus.total} processed</p>

              {jobStatus.status === 'completed' && jobStatus.resultUrl && (
                <a href={`http://localhost:3001${jobStatus.resultUrl}`} download className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" /> Download ZIP Archive
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
