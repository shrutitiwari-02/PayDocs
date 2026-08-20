"use client";
import { API_BASE_URL } from "@/config/api";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Template1 } from '@/components/templates/payslip/Template1';
import { Template2 } from '@/components/templates/payslip/Template2';
import { Template3 } from '@/components/templates/payslip/Template3';
import { calculatePayslip, PayslipInput } from '@/lib/shared';
import { Plus, Trash2, Download, Send, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { GuestSaveNotice, SaveStatusBadge } from '@/components/GuestSaveNotice';
import { VisualTemplateSelector, TemplateId } from '@/components/VisualTemplateSelector';
import { CurrencySelect } from '@/components/CurrencySelect';

export default function SinglePayslipGenerator() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [employeeName, setEmployeeName] = useState('John Doe');
  const [employeeId, setEmployeeId] = useState('EMP-001');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [designation, setDesignation] = useState('Software Engineer');
  const [department, setDepartment] = useState('Engineering');
  const [payPeriod, setPayPeriod] = useState('July 2026');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [selectedTemplate, setSelectedTemplate] = useState<'1' | '2' | '3'>('1');

  const [input, setInput] = useState<PayslipInput>({
    basic: 50000,
    hra: 20000,
    allowances: [{ id: '1', name: 'Transport Allowance', amount: 5000 }],
    deductions: [{ id: '1', name: 'PF', amount: 3000 }, { id: '2', name: 'TDS', amount: 2000 }],
  });

  const result = calculatePayslip(input);

  const handleAddAllowance = () => {
    setInput({
      ...input,
      allowances: [...input.allowances, { id: Date.now().toString(), name: 'New Allowance', amount: 0 }]
    });
  };

  const handleAddDeduction = () => {
    setInput({
      ...input,
      deductions: [...input.deductions, { id: Date.now().toString(), name: 'New Deduction', amount: 0 }]
    });
  };

  const handleAllowanceChange = (id: string, field: 'name' | 'amount', value: string | number) => {
    setInput({
      ...input,
      allowances: input.allowances?.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const handleDeductionChange = (id: string, field: 'name' | 'amount', value: string | number) => {
    setInput({
      ...input,
      deductions: input.deductions?.map(d => d.id === id ? { ...d, [field]: value } : d)
    });
  };

  const handleRemoveAllowance = (id: string) => {
    setInput({ ...input, allowances: input.allowances.filter(a => a.id !== id) });
  };

  const handleRemoveDeduction = (id: string) => {
    setInput({ ...input, deductions: input.deductions.filter(d => d.id !== id) });
  };

  const handleDownload = async () => {
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
    
    try {
      // Dynamically import ReactDOMServer to avoid client-side bundling issues if any
      const ReactDOMServer = (await import('react-dom/server')).default;
      
      const commonProps = {
        input, 
        result, 
        companyName,
        employeeName,
        employeeId,
        designation,
        department,
        payPeriod,
        currencySymbol
      };
      
      const element = selectedTemplate === '1' ? <Template1 {...commonProps} /> :
                      selectedTemplate === '2' ? <Template2 {...commonProps} /> :
                                                 <Template3 {...commonProps} />;
      
      const htmlString = ReactDOMServer.renderToString(element);
      
      // Inject Tailwind CDN for the backend puppeteer renderer
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

      const token = (session?.user as any)?.token;
      const response = await fetch(`${API_BASE_URL}/api/pdf/payslip`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          html: fullHtml,
          type: 'PAYSLIP',
          entityName: employeeName,
          totalAmount: result.netPay
        }),
      });
      
      if (!response.ok) throw new Error('PDF generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${employeeName.replace(/\s+/g, '_')}_${payPeriod.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'PDF downloaded successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
    }
  };

  const handleEmailEmployee = async () => {
    if (!employeeEmail) {
      toast({ title: 'Error', description: 'Please enter an employee email address.', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Sending Email...', description: 'Generating PDF and dispatching email.' });
    
    try {
      const ReactDOMServer = (await import('react-dom/server')).default;
      
      const commonProps = {
        input, 
        result, 
        companyName,
        employeeName,
        employeeId,
        designation,
        department,
        payPeriod,
        currencySymbol
      };
      
      const element = selectedTemplate === '1' ? <Template1 {...commonProps} /> :
                      selectedTemplate === '2' ? <Template2 {...commonProps} /> :
                                                 <Template3 {...commonProps} />;
      
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

      const token = (session?.user as any)?.token;
      const response = await fetch(`${API_BASE_URL}/api/pdf/email-payslip`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          html: fullHtml,
          employeeEmail,
          employeeName,
          payPeriod,
          totalAmount: result.netPay
        }),
      });
      
      if (!response.ok) throw new Error('Email sending failed');
      
      toast({ title: 'Success', description: 'Payslip emailed successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to send email.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <GuestSaveNotice documentType="payslip" />

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Single Payslip Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Generate a professional payslip instantly. Your changes preview live on the right.</p>
        </div>
        <div className="shrink-0 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Select Currency:</span>
          <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} label="" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form */}
        <div className="w-full lg:w-[45%] space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Company & Employee Details</CardTitle>
              <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee Name</Label>
                  <Input value={employeeName} onChange={e => setEmployeeName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Employee Email</Label>
                <Input type="email" placeholder="Optional for emailing" value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={designation} onChange={e => setDesignation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pay Period (e.g. July 2026)</Label>
                <Input value={payPeriod} onChange={e => setPayPeriod(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Earnings ({currencySymbol})</CardTitle>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Active: {currencySymbol}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Basic Salary ({currencySymbol})</Label>
                  <Input type="number" min="0" value={input.basic || ''} onChange={e => setInput({...input, basic: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>HRA ({currencySymbol})</Label>
                  <Input type="number" min="0" value={input.hra || ''} onChange={e => setInput({...input, hra: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <Label>Additional Allowances ({currencySymbol})</Label>
                  <Button variant="outline" size="sm" onClick={handleAddAllowance}><Plus className="w-4 h-4 mr-2"/> Add</Button>
                </div>
                {input.allowances?.map((item) => (
                  <div key={item.id} className="flex gap-4 mb-3">
                    <Input className="flex-1" value={item.name} onChange={e => handleAllowanceChange(item.id, 'name', e.target.value)} placeholder="Allowance Name" />
                    <Input type="number" min="0" className="w-32" value={item.amount || ''} onChange={e => handleAllowanceChange(item.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAllowance(item.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Deductions ({currencySymbol})</CardTitle>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                Active: {currencySymbol}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Label>Deductions (PF, Tax, etc.) ({currencySymbol})</Label>
                <Button variant="outline" size="sm" onClick={handleAddDeduction}><Plus className="w-4 h-4 mr-2"/> Add</Button>
              </div>
              {input.deductions?.map((item) => (
                <div key={item.id} className="flex gap-4 mb-3">
                  <Input className="flex-1" value={item.name} onChange={e => handleDeductionChange(item.id, 'name', e.target.value)} placeholder="Deduction Name" />
                  <Input type="number" min="0" className="w-32" value={item.amount || ''} onChange={e => handleDeductionChange(item.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveDeduction(item.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview & Actions */}
        <div className="w-full lg:w-[55%] flex flex-col">
          <div className="sticky top-24 space-y-4">
            <VisualTemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={(id) => setSelectedTemplate(id)}
              brandAccent="blue"
            />

            <div>
              <div className="flex gap-4 mb-2">
                <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button variant="outline" className="flex-1 font-semibold" onClick={handleEmailEmployee}>
                  <Send className="w-4 h-4 mr-2" /> Email Employee
                </Button>
              </div>
              <div className="flex justify-center mt-2">
                <SaveStatusBadge documentType="payslip" />
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-900 border rounded-xl overflow-hidden p-4 sm:p-8 flex justify-center lg:justify-start items-start shadow-inner overflow-x-auto">
              <div className="w-[800px] origin-top md:origin-top-left scale-[0.45] xs:scale-[0.55] sm:scale-[0.65] md:scale-75 xl:scale-90 2xl:scale-100 transition-transform shadow-xl">
                {selectedTemplate === '1' && <Template1 input={input} result={result} companyName={companyName} employeeName={employeeName} employeeId={employeeId} designation={designation} department={department} payPeriod={payPeriod} currencySymbol={currencySymbol} />}
                {selectedTemplate === '2' && <Template2 input={input} result={result} companyName={companyName} employeeName={employeeName} employeeId={employeeId} designation={designation} department={department} payPeriod={payPeriod} currencySymbol={currencySymbol} />}
                {selectedTemplate === '3' && <Template3 input={input} result={result} companyName={companyName} employeeName={employeeName} employeeId={employeeId} designation={designation} department={department} payPeriod={payPeriod} currencySymbol={currencySymbol} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
