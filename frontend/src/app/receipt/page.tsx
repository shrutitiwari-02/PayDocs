"use client";

import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReceiptTemplate } from '@/components/templates/receipt/ReceiptTemplate';
import { Download, FileText, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { GuestSaveNotice } from '@/components/GuestSaveNotice';
import { CurrencySelect } from '@/components/CurrencySelect';

export default function ReceiptGenerator() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [receiptNumber, setReceiptNumber] = useState('REC-0001');
  const [date, setDate] = useState('2026-08-01');
  const [receivedFrom, setReceivedFrom] = useState('John Doe');
  const [amount, setAmount] = useState<number>(5000);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [description, setDescription] = useState('Consulting Services');
  const [clientEmail, setClientEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const receiptProps = {
    receiptNumber,
    date,
    receivedFrom,
    amount,
    paymentMode,
    description,
    companyName,
    currencySymbol
  };

  const handleDownload = async () => {
    toast({ title: 'Generating Receipt...', description: 'Please wait a moment.' });
    setIsGenerating(true);
    
    try {
      const ReactDOMServer = (await import('react-dom/server')).default;
      
      const element = <ReceiptTemplate {...receiptProps} />;
      const htmlString = ReactDOMServer.renderToString(element);
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body class="bg-white">
          ${htmlString}
        </body>
        </html>
      `;

      const res = await fetch('http://localhost:3001/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml })
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Success!', description: 'Receipt downloaded successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate receipt.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReceipt = async () => {
    if (!clientEmail) {
      toast({ title: 'Error', description: 'Please enter a client email address.', variant: 'destructive' });
      return;
    }
    
    setIsEmailing(true);
    try {
      const element = <ReceiptTemplate companyName={companyName} receiptNumber={receiptNumber} date={date} receivedFrom={receivedFrom} amount={amount} paymentMode={paymentMode} description={description} />;
      
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
      const response = await fetch('http://localhost:3001/api/pdf/email-receipt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          html: fullHtml,
          clientEmail,
          clientName: receivedFrom || 'Unknown Client',
          receiptNumber,
          totalAmount: amount
        }),
      });
      
      if (!response.ok) throw new Error('Failed to email receipt');
      
      toast({ title: 'Success', description: 'Receipt emailed successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to email receipt.', variant: 'destructive' });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <GuestSaveNotice documentType="receipt" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            Receipt Generator
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Generate professional payment receipts instantly.</p>
        </div>
        <div className="flex items-center gap-4">
          <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} />
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 transition-all text-base px-6 h-12 rounded-xl"
          >
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            Download
          </Button>
          <Button 
            onClick={handleEmailReceipt} 
            disabled={isEmailing}
            size="lg"
            variant="outline"
            className="shadow-sm hover:shadow-md transition-all text-base px-6 h-12 rounded-xl bg-white border-slate-200"
          >
            {isEmailing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5 text-indigo-600" />}
            Email Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-bold text-slate-800">Receipt Details</CardTitle>
              <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} />
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium">Company Name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Receipt #</Label>
                  <Input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} className="bg-slate-50/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-slate-50/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium">Received From (Client Name)</Label>
                <Input value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)} className="bg-slate-50/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium">Client Email</Label>
                <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="bg-slate-50/50" placeholder="client@example.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium">Amount Received ({currencySymbol})</Label>
                <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-slate-50/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={(val) => setPaymentMode(val || '')}>
                  <SelectTrigger className="bg-slate-50/50">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI / Online">UPI / Online</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium">Description / For</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-slate-50/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <div className="sticky top-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50 bg-white">
              <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-4 text-xs font-medium text-slate-500 uppercase tracking-widest">Live Preview</span>
              </div>
              <div className="p-8 max-h-[800px] overflow-auto">
                <div className="origin-top transform scale-[0.85] sm:scale-100 transition-transform">
                  <ReceiptTemplate {...receiptProps} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
