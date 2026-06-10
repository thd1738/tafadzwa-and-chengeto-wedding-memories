import React, { useState, useEffect } from 'react';
import { QrCode, Download, Printer, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function QRSection() {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://ais-pre-4dsh3f3n62bmrkaavfz6vp-494748040271.europe-west1.run.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(currentUrl)}&ecc=H&color=2B2B2B&bgcolor=FFF9F2`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Tafadzwa & Chengeto Memories QR Code</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              text-align: center;
              padding: 40px;
              background-color: #FFF9F2;
              color: #2B2B2B;
            }
            .container {
              border: 3px double #D4AF37;
              padding: 40px;
              max-width: 500px;
              margin: 0 auto;
              border-radius: 12px;
              background: #fff;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }
            h1 { font-family: 'Great Vibes', cursive; font-size: 48px; color: #D4AF37; margin-bottom: 5px; }
            h2 { font-size: 20px; font-weight: normal; margin-top: 0; margin-bottom: 25px; letter-spacing: 2px; }
            .qr-frame { margin: 25px auto; width: 250px; height: 250px; padding: 15px; border: 1px solid #E8DDD0; background: #FFF9F2; }
            .instructions { font-size: 14px; color: #777; margin-top: 25px; line-height: 1.6; }
            button { display: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Tafadzwa & Chengeto</h1>
            <h2>29 AUGUST 2026</h2>
            <p style="font-size: 16px; font-style: italic; margin-bottom: 20px;">Share Your Photos & Videos Instantly</p>
            <div class="qr-frame">
              <img src="${qrImageUrl}" style="width: 100%; height: 100%;" alt="QR Code" />
            </div>
            <p class="instructions">
              1. Scan this QR Code with your phone camera.<br/>
              2. Upload files from your camera roll instantly.<br/>
              3. View live memories and leave warm wishes!
            </p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section id="qr-code-section" className="py-20 px-4 bg-[#FFF9F2]/60 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header decoration */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2 font-sans">
            Scan & Connect
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#2B2B2B]">
            Print & Share Wedding Board
          </h2>
          <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4" />
          <p className="text-[#2B2B2B]/70 max-w-lg mx-auto mt-4 text-sm font-sans lead-relaxed">
            Generate and print this QR card. Put it on dining tables, invitations, banners, or reception portals so guest smartphones can access the portal with one click!
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-2 gap-8 items-center bg-white/70 backdrop-blur-md rounded-2xl border border-[#E8DDD0] p-6 md:p-10 shadow-xl max-w-3xl mx-auto"
        >
          
          {/* Printable Wedding QR Container Card */}
          <motion.div 
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="relative rounded-xl border-2 border-double border-[#D4AF37]/50 bg-[#FFF9F2] p-6 text-center shadow-md"
          >
            {/* Elegant Monogram Ring Elements */}
            <div className="absolute top-2 left-2 text-[#D4AF37]/35 text-xs font-serif italic">T & C</div>
            <div className="absolute top-2 right-2 text-[#D4AF37]/35 text-xs font-serif italic">2026</div>

            <h3 className="font-cursive text-3xl text-[#D4AF37] mb-1 select-none">Tafadzwa & Chengeto</h3>
            <p className="text-[10px] uppercase tracking-widest font-sans font-medium text-[#2B2B2B]/60 mb-4 select-none">
              Matrimonial Celebration • August 29, 2026
            </p>

            {/* QR Framework */}
            <div className="w-56 h-56 mx-auto bg-white p-3 rounded-lg border border-[#E8DDD0] flex items-center justify-center shadow-inner relative group select-none ring-4 ring-[#D4AF37]/10 animate-pulse">
              <img
                src={qrImageUrl}
                alt="Matrimonial QR Code Link"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <QrCode className="h-10 w-10 text-[#D4AF37] animate-pulse" />
                <span className="text-[11px] font-sans font-medium text-[#2B2B2B]">Works on iOS & Android</span>
              </div>
            </div>

            <p className="text-xs font-sans text-[#2B2B2B]/70 mt-4 italic select-none">
              "Scan this card with your phone camera to share your memories instantly."
            </p>
          </motion.div>

          {/* Controls Panel */}
          <div className="flex flex-col gap-5 justify-center">
            <h4 className="text-xl font-serif text-[#2B2B2B] font-medium">
              Create Table Flyers
            </h4>
            
            <p className="text-sm text-[#2B2B2B]/70 leading-relaxed font-sans">
              No long URLs to type. No apps to download. No account credentials. Sharing starts instantly! Use the quick action tools below to prepare this code card.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {/* Copy link */}
              <motion.button
                onClick={handleCopyLink}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E8DDD0] bg-white hover:bg-[#FFF9F2] text-sm text-[#2B2B2B] transition-all duration-300 font-sans shadow-sm cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#D4AF37]" />}
                  <span>{copied ? 'Link Copied To Clipboard!' : 'Copy Portal Live URL'}</span>
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {currentUrl.substring(0, 20)}...
                </span>
              </motion.button>

              {/* Print Code Card */}
              <motion.button
                onClick={handlePrint}
                whileHover={{ scale: 1.02, backgroundColor: '#D4AF37', color: '#2B2B2B' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#2B2B2B] text-white transition-all duration-300 text-sm font-sans shadow-md cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Table Placard flyers</span>
              </motion.button>

              {/* Direct Link download option */}
              <motion.a
                href={qrImageUrl}
                download="Tafadzwa-Chengeto-Wedding-Memory-QR.png"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02, borderColor: '#D4AF37' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#D4AF37]/30 bg-white hover:bg-[#FFF9F2] text-[#2B2B2B] transition-all duration-300 text-sm font-sans shadow-sm justify-center cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#D4AF37]" />
                <span>Download QR image (.PNG)</span>
              </motion.a>
            </div>

            <div className="mt-2 text-[11px] text-[#2B2B2B]/50 flex items-center gap-1.5 font-sans justify-center md:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Dynamic QR technology automatically aligns with deployment modifications.</span>
            </div>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
