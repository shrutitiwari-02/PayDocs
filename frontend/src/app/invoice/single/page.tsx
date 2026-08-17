"use client";

import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InvoiceTemplate1 } from '@/components/templates/invoice/InvoiceTemplate1';
import { InvoiceTemplate2 } from '@/components/templates/invoice/InvoiceTemplate2';
import { InvoiceTemplate3 } from '@/components/templates/invoice/InvoiceTemplate3';
import { calculateInvoice, InvoiceInput } from '@paydocs/shared';
import { Download, FileText, Loader2, LayoutTemplate, Plus, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { GuestSaveNotice, SaveStatusBadge } from '@/components/GuestSaveNotice';
import { VisualTemplateSelector, TemplateId } from '@/components/VisualTemplateSelector';

export default function SingleInvoiceGenerator() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [clientName, setClientName] = useState('Client Name');
  const [clientEmail, setClientEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-0001');
  const [issueDate, setIssueDate] = useState('2026-07-01');
  const [dueDate, setDueDate] = useState('2026-07-15');
  const [selectedTemplate, setSelectedTemplate] = useState<'1' | '2' | '3'>('1');
  const [isEmailing, setIsEmailing] = useState(false);

  const [input, setInput] = useState<InvoiceInput>({
    items: [
      { id: '1', description: 'Web Development Services', quantity: 1, rate: 150000 },
      { id: '2', description: 'Hosting (1 Year)', quantity: 1, rate: 15000 }
    ],
    taxPercentage: 18,
    discountAmount: 5000
  });

  const result = calculateInvoice(input);

  const handleAddItem = () => {
    setInput({
      ...input,
      items: [...input.items, { id: Date.now().toString(), description: 'New Item', quantity: 1, rate: 0 }]
    });
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'rate', value: string | number) => {
    setInput({
      ...input,
      items: input.items?.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleRemoveItem = (id: string) => {
    setInput({ ...input, items: input.items.filter(item => item.id !== id) });
  };

  const handleDownload = async () => {
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
    
    try {
      const ReactDOMServer = (await import('react-dom/server')).default;
      
      const commonProps = {
        input, 
        result, 
        companyName,
        clientName,
        invoiceNumber,
        issueDate,
        dueDate
      };
      
      const element = selectedTemplate === '1' ? <InvoiceTemplate1 {...commonProps} /> :
                      selectedTemplate === '2' ? <InvoiceTemplate2 {...commonProps} /> :
                                                 <InvoiceTemplate3 {...commonProps} />;
      
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

      // We can reuse the payslip pdf generator route, or create a generic one. Let's reuse it since it just takes HTML.
      const token = (session?.user as any)?.token;
      const response = await fetch('http://localhost:3001/api/pdf/payslip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          html: fullHtml,
          type: 'INVOICE',
          entityName: clientName || 'Unknown Client',
          totalAmount: result.grandTotal
        }),
      });
      
      if (!response.ok) throw new Error('PDF generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'PDF downloaded successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate PDF.', type: 'error' });
    }
  };

  const handleEmailInvoice = async () => {
    if (!clientEmail) {
      toast({ title: 'Error', description: 'Please enter a client email address.', type: 'error' });
      return;
    }
    
    setIsEmailing(true);
    try {
      const element = selectedTemplate === '1' ? <InvoiceTemplate1 input={input} result={result} companyName={companyName} clientName={clientName} invoiceNumber={invoiceNumber} issueDate={issueDate} dueDate={dueDate} /> : 
                      selectedTemplate === '2' ? <InvoiceTemplate2 input={input} result={result} companyName={companyName} clientName={clientName} invoiceNumber={invoiceNumber} issueDate={issueDate} dueDate={dueDate} /> :
                      <InvoiceTemplate3 input={input} result={result} companyName={companyName} clientName={clientName} invoiceNumber={invoiceNumber} issueDate={issueDate} dueDate={dueDate} />;
      
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
      const response = await fetch('http://localhost:3001/api/pdf/email-invoice', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          html: fullHtml,
          clientEmail,
          clientName: clientName || 'Unknown Client',
          invoiceNumber,
          totalAmount: result.grandTotal
        }),
      });
      
      if (!response.ok) throw new Error('Failed to email invoice');
      
      toast({ title: 'Success', description: 'Invoice emailed successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to email invoice.', type: 'error' });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <GuestSaveNotice documentType="invoice" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Single Invoice Generator</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Generate a professional invoice instantly with automatic tax calculations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form */}
        <div className="w-full lg:w-[45%] space-y-6">
          <Card>
            <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Company Name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {input.items?.map((item) => (
                <div key={item.id} className="flex gap-2 mb-3 items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <Input className="flex-[2]" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} placeholder="Description" />
                  <Input type="number" min="0" className="flex-1" value={item.quantity || ''} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qty" />
                  <Input type="number" min="0" className="flex-1" value={item.rate || ''} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} placeholder="Price" />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full"><Plus className="w-4 h-4 mr-2"/> Add Item</Button>
              
              <div className="pt-4 border-t grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" min="0" value={input.taxPercentage || ''} onChange={e => setInput({...input, taxPercentage: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Discount Amount (₹)</Label>
                  <Input type="number" min="0" value={input.discountAmount || ''} onChange={e => setInput({...input, discountAmount: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview & Actions */}
        <div className="w-full lg:w-[55%] flex flex-col">
          <div className="sticky top-24 space-y-4">
            <VisualTemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={(id) => setSelectedTemplate(id)}
              brandAccent="indigo"
            />

            <div>
              <div className="flex gap-4 mb-2">
                <Button onClick={handleDownload} className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button onClick={handleEmailInvoice} disabled={isEmailing} variant="outline" className="flex-1 font-semibold">
                  {isEmailing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {isEmailing ? 'Sending...' : 'Email Invoice'}
                </Button>
              </div>
              <div className="flex justify-center mt-2">
                <SaveStatusBadge documentType="invoice" />
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-900 border rounded-xl overflow-hidden p-4 sm:p-8 flex justify-center lg:justify-start items-start shadow-inner overflow-x-auto">
              <div className="w-[800px] origin-top md:origin-top-left scale-[0.45] xs:scale-[0.55] sm:scale-[0.65] md:scale-75 xl:scale-90 2xl:scale-100 transition-transform shadow-xl">
                {selectedTemplate === '1' && <InvoiceTemplate1 input={input} result={result} companyName={companyName} clientName={clientName} invoiceNumber={invoiceNumber} issueDate={issueDate} dueDate={dueDate} />}
                {selectedTemplate === '2' && <InvoiceTemplate2 input={input} result={result} companyName={companyName} clientName={clientName} invoiceNumber={invoiceNumber} issueDate={issueDate} dueDate={dueDate} />}
                {selectedTemplate === '3' && <InvoiceTemplate3 input={input} result={result} companyName={companyName} clientName={clientName} invoiceNumber={invoiceNumber} issueDate={issueDate} dueDate={dueDate} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
