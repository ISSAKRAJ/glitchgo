"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, CheckCircle2, AlertCircle, FileText, Download, Clock, 
  ArrowLeft, Upload, Loader2, ArrowRight, ShieldCheck, Zap 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function PayPage() {
  const params = useParams();
  const ticketId = params?.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  
  // Payment states
  const [uploadMode, setUploadMode] = useState("scan"); // "scan" | "manual"
  const [file, setFile] = useState(null);
  const [manualUtr, setManualUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("client_requests")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setFetchError("Ticket not found or database connection error.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 3 * 1024 * 1024) {
        setPayError("File size exceeds 3MB limit.");
        return;
      }
      setFile(selectedFile);
      setPayError("");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setPayError("");
    setPaySuccess("");
    setSubmitting(true);

    try {
      const payload = { ticket_id: ticketId };

      if (uploadMode === "manual") {
        if (!manualUtr.trim() || manualUtr.trim().length !== 12 || isNaN(Number(manualUtr))) {
          throw new Error("UTR must be a 12-digit number.");
        }
        payload.manual_utr = manualUtr.trim();
      } else {
        if (!file) {
          throw new Error("Please upload your payment receipt screenshot first.");
        }

        // Convert file to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().replace("data:", "").replace(/^.+,/, "");
            resolve(base64String);
          };
          reader.onerror = (error) => reject(error);
        });

        payload.image = base64Data;
        payload.mime_type = file.type;
      }

      // Call API
      const res = await fetch("/api/adminzero/services/verify-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Please try again.");
      }

      setPaySuccess(data.message || "Payment verified successfully!");
      setFile(null);
      setManualUtr("");
      // Refresh ticket state
      await fetchTicket();
    } catch (err) {
      setPayError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
          <p className="text-gray-400">Loading ticket checkout details...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !ticket) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
        <div className="glass max-w-md w-full p-8 rounded-3xl text-center border border-white/10">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Checkout Error</h2>
          <p className="text-gray-400 mb-6">{fetchError || "The pay link you followed does not exist."}</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Parse quoted price
  const quotedPriceRaw = ticket.quoted_price || "";
  const numericPrice = parseFloat(quotedPriceRaw.replace(/[^0-9.]/g, ""));
  
  // UPI Configuration
  const targetUpiId = "7013017818@naviaxis";
  const upiUrl = `upi://pay?pa=${targetUpiId}&pn=GlitchGo&am=${numericPrice}&tn=Ticket_${ticket.id.slice(0,8)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  const isPaid = ticket.status === "Paid" || ticket.status === "Completed" || !!ticket.delivery_link;
  const isCreditTopup = ticket.problem?.startsWith('[CREDIT_TOPUP]');
  const backUrl = isCreditTopup ? '/portal' : '/status';
  const backLabel = isCreditTopup ? 'Back to Developer Portal' : 'Back to Ticket Tracker';

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-20 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.href = backUrl}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={14} /> {backLabel}
        </button>

        {/* Ticket Header Card */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
            <div>
              <div className="text-xs text-brand-orange font-mono uppercase tracking-wider mb-2">
                {isCreditTopup ? "Order Reference" : "Ticket Reference"}: #{ticket.id.slice(0, 8)}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                {isCreditTopup ? "GlitchGo Compute Credits Top-Up" : ticket.problem}
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-1.5 font-mono">
                <Clock size={14} /> {isCreditTopup ? "Order Created on" : "Requested on"} {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                isPaid 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-brand-orange/10 border-brand-orange/20 text-brand-orange"
              }`}>
                {isPaid ? "✅ Paid / Active" : `📥 Status: ${ticket.status || "Received"}`}
              </span>
              <p className="text-xs text-gray-500 font-mono">Client: {ticket.name}</p>
            </div>
          </div>
        </div>

        {/* Conditional Layout based on Price & Payment Status */}
        {!ticket.quoted_price ? (
          /* Case 1: NOT Quoted */
          <div className="glass p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center py-16">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-6 text-brand-orange">
              <Clock size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Estimation in Progress</h2>
            <p className="text-gray-400 max-w-lg mb-6 leading-relaxed">
              Our engineers are currently reviewing your code issue to estimate the complexity, workload, and final price. 
              Once the cost is set, this page will update automatically with UPI payment checkout options.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-md w-full text-left text-sm text-gray-400">
              <p className="font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-blue" /> What happens next?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>You will receive an email quote when the review is done.</li>
                <li>Bookmark this page URL to check back directly.</li>
                <li>If you need immediate support, email us at <a href="mailto:teamglitchgo@gmail.com" className="text-brand-blue underline">teamglitchgo@gmail.com</a>.</li>
              </ul>
            </div>
          </div>
        ) : isPaid ? (
          /* Case 2: Paid or Completed (Show downloads / delivery) */
          <div className="space-y-6">
            {isCreditTopup ? (
              <div className="glass p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center py-12">
                <CheckCircle2 className="text-emerald-500 mb-4" size={56} />
                <h2 className="text-2xl font-extrabold text-white mb-2">Credits Successfully Credited!</h2>
                <p className="text-gray-300 max-w-md mb-6 text-sm">
                  Your payment reference has been verified successfully. We have added the query credits directly to your active license key: <strong className="text-white font-mono">{ticket.referral_code}</strong>.
                </p>
                <button 
                  onClick={() => window.location.href = "/portal"}
                  className="bg-brand-orange hover:bg-opacity-90 text-black font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer text-xs font-mono border-none"
                >
                  Back to Portal Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="glass p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center py-12">
                  <CheckCircle2 className="text-emerald-500 mb-4" size={56} />
                  <h2 className="text-2xl font-extrabold text-white mb-2">Payment Confirmed</h2>
                  <p className="text-gray-300 max-w-md mb-4 text-sm">
                    Your payment reference has been verified successfully. Your ticket status is now updated.
                  </p>
                  {ticket.payment_link && (
                    <span className="bg-dark-bg/60 border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-mono text-gray-400 mb-2">
                      UTR: {ticket.payment_link}
                    </span>
                  )}
                </div>

                {ticket.delivery_link ? (
                  <div className="glass p-8 rounded-3xl border border-brand-blue/20 bg-brand-blue/5 text-center flex flex-col items-center py-12">
                    <Zap className="text-brand-blue mb-4 animate-bounce" size={48} />
                    <h3 className="text-2xl font-bold text-white mb-2">Your Delivery is Ready!</h3>
                    <p className="text-gray-400 max-w-md mb-6 text-sm">
                      The debugged files/resumed project is complete. Please download the final bundle below.
                    </p>
                    <a 
                      href={ticket.delivery_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all mb-4"
                    >
                      <Download size={18} /> Download Code Assets
                    </a>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-lg text-left text-xs text-red-400 font-mono mt-4">
                      <strong>⚠️ RETENTION WARNING:</strong> For security and confidentiality, we do not store customer code permanently. 
                      These delivery files are scheduled for automatic server deletion in 7 days. Download your backups immediately.
                    </div>
                  </div>
                ) : (
                  <div className="glass p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center py-12 text-gray-400">
                    <Clock className="mb-4 text-brand-orange animate-spin" size={40} />
                    <h3 className="text-xl font-bold text-white mb-2">Engineers Coding</h3>
                    <p className="text-sm max-w-md leading-relaxed">
                      We have verified your deposit/payment! Our debuggers are working on rescuing your codebase now. 
                      Once done, the download link will appear right here on this page. Thank you for your patience!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Case 3: Price Quoted, Awaiting Payment (Show UPI checkout UI) */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: UPI Scan Info */}
            <div className="lg:col-span-3 glass p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-between min-h-[450px]">
              <div className="text-center w-full">
                <h2 className="text-xl font-bold text-white mb-2">
                  {isCreditTopup ? "Scan to Top-Up Credits" : "Scan to Pay via UPI"}
                </h2>
                <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto">
                  {isCreditTopup 
                    ? "Scan this QR code with GPay, PhonePe, Paytm, or BHIM to pay instantly. Your credits will be added once verified." 
                    : "Scan this QR code with any UPI application (GPay, PhonePe, Paytm, BHIM) to pay instantly."}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3.5 rounded-2xl shadow-xl flex flex-col items-center justify-center mb-6">
                <img 
                  src={isCreditTopup ? "/images/owner_qr.png" : qrCodeUrl} 
                  onError={(e) => {
                    // Fallback to dynamic QR Code if the static image is missing
                    e.currentTarget.src = qrCodeUrl;
                  }}
                  alt="UPI QR Code" 
                  className="w-[200px] h-[200px] object-contain"
                />
                {isCreditTopup && (
                  <span className="text-[9px] text-zinc-500 font-mono mt-1 text-center block">
                    (Prefilled amount fallback active)
                  </span>
                )}
              </div>

              <div className="text-center w-full bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="text-sm text-gray-400 mb-1">Amount Due:</div>
                <div className="text-3xl font-extrabold text-emerald-400 mb-1">{ticket.quoted_price}</div>
                <div className="text-[10px] text-gray-500 font-mono break-all select-all">
                  UPI ID: {targetUpiId}
                </div>
                {isCreditTopup && (
                  <p className="text-[9px] text-zinc-500 leading-normal mt-2.5 max-w-[260px] mx-auto font-sans">
                    💡 <strong>Note:</strong> During our public beta, payments are processed directly to our founder's verified UPI account. You may see their personal name upon scanning.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Verification Form */}
            <div className="lg:col-span-2 glass p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Verify Payment</h2>
                <p className="text-gray-400 text-xs mb-6">
                  {isCreditTopup 
                    ? "Submit proof to instantly credit query allowance to your active license key."
                    : "Submit proof to unlock code assets and start ticket execution."}
                </p>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 bg-dark-bg p-1 rounded-xl border border-white/5 mb-6 text-xs">
                  <button 
                    onClick={() => { setUploadMode("scan"); setPayError(""); }}
                    className={`py-2 rounded-lg font-semibold transition-colors ${
                      uploadMode === "scan" ? "bg-brand-blue text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    AI Receipt Scan
                  </button>
                  <button 
                    onClick={() => { setUploadMode("manual"); setPayError(""); }}
                    className={`py-2 rounded-lg font-semibold transition-colors ${
                      uploadMode === "manual" ? "bg-brand-blue text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Manual UTR
                  </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  {payError && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-1.5">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      <span>{payError}</span>
                    </div>
                  )}

                  {paySuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="flex-shrink-0" />
                      <span>{paySuccess}</span>
                    </div>
                  )}

                  {uploadMode === "scan" ? (
                    /* AI Scanner File Uploader */
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-gray-300">
                        Upload Receipt Screenshot *
                      </label>
                      <div className="border border-white/10 hover:border-brand-blue/40 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                          disabled={submitting}
                        />
                        <Upload size={24} className="text-gray-500 mx-auto mb-2" />
                        <span className="text-xs text-gray-400 block font-medium">
                          {file ? file.name : "Select Receipt Screenshot"}
                        </span>
                        <span className="text-[10px] text-gray-600 block mt-1">
                          PNG, JPG (Max 3MB)
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Manual UTR Input */
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-300">
                        12-Digit Transaction ID / UTR *
                      </label>
                      <input 
                        type="text"
                        maxLength={12}
                        placeholder="e.g. 123456789012"
                        className="w-full bg-dark-surface border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue font-mono text-center tracking-widest"
                        value={manualUtr}
                        onChange={(e) => setManualUtr(e.target.value.replace(/[^0-9]/g, ""))}
                        disabled={submitting}
                      />
                      <span className="text-[10px] text-gray-500 block leading-tight">
                        Check your bank transaction SMS or UPI app details for the 12-digit Ref No.
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-orange hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] flex items-center justify-center gap-2 text-xs mt-4"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Verifying Proof...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Verification</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 text-[10px] text-gray-500 flex items-center gap-1">
                <ShieldCheck size={12} className="text-brand-blue" />
                <span>Automatic UPI validation powered by Gemini AI audit checks.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
