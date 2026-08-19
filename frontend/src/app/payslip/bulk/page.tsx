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
import { CurrencySelect } from '@/components/CurrencySelect';
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
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  
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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const validRows: any[] = [];

        results.data.forEach((row: any, index: number) => {
          const parseResult = payslipRowSchema.safeParse(row);
          if (!parseResult.success) {
            parseResult.error.issues.forEach(err => {
              errors.push(`Row ${index + 1}: ${err.message}`);
            });
          } else {
            validRows.push(row);
          }
        });

        setValidationErrors(errors);
        setParsedData(validRows);
        
        if (errors.length === 0) {
          toast({ title: 'CSV Parsed', description: `${validRows.length} valid employee records found.` });
        } else {
          toast({ title: 'Validation Warning', description: `Found ${errors.length} validation issues.`, type: 'error' });
        }
      }
    });
  };

  const handleGenerateBulk = async () => {
    if (parsedData.length === 0) return;
    
    setIsProcessing(true);
    toast({ title: 'Starting Batch Job...', description: 'Rendering payslips in the background queue.' });
    
    try {
      const ReactDOMServer = (await import('react-dom/server')).default;
      
      const items = parsedData.map(row => {
        const input: PayslipInput = {
          basic: Number(row.BasicSalary) || 0,
          hra: Number(row.HRA) || 0,
          allowances: [
            ...(Number(row.TransportAllowance) ? [{ id: '1', name: 'Transport', amount: Number(row.TransportAllowance) }] : []),
            ...(Number(row.MedicalAllowance) ? [{ id: '2', name: 'Medical', amount: Number(row.MedicalAllowance) }] : []),
          ],
          deductions: [
            ...(Number(row.PF) ? [{ id: '1', name: 'PF', amount: Number(row.PF) }] : []),
            ...(Number(row.TDS) ? [{ id: '2', name: 'TDS', amount: Number(row.TDS) }] : []),
          ]
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
            currencySymbol={currencySymbol}
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

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bulk Payslip Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Generate hundreds of payslips in seconds via CSV upload.</p>
        </div>
        <div className="shrink-0 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Select Currency:</span>
          <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} label="" />
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>These details apply to all generated payslips.</CardDescription>
            </div>
            <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} />
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
                <Button onClick={handleGenerateBulk} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
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
