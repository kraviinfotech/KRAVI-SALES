import React, { useState, useEffect } from 'react';
import { QrCode, X, Eye, EyeOff, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const AddManagerForm = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [qrMessage, setQrMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    designation: '',
    status: 'Active'
  });

  // Initialize QR Scanner when modal opens
  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      });

      scanner.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            company: data.company || prev.company,
            designation: data.designation || prev.designation
          }));
          setQrMessage(`Successfully scanned: ${data.name}`);
          setShowScanner(false);
          scanner.clear();
          setTimeout(() => setQrMessage(null), 5000);
        } catch (e) {
          console.error("Invalid QR format", e);
        }
      }, (error) => {
        // Silent fail for scanning frames
      });
    }
    return () => {
      if (scanner) scanner.clear();
    };
  }, [showScanner]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Manager Added!</h2>
        <p className="text-gray-500 mt-2"><strong>{formData.name}</strong> has been successfully registered.</p>
        <button
          type="button"
          onClick={() => { setIsSubmitted(false); setFormData({ ...formData, name: '', email: '' }); }}
          className="mt-8 w-full bg-[#6C3EF4] text-white py-3 rounded-xl font-bold hover:bg-[#5a32cc] transition-colors"
        >
          Add Another Manager
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add New Manager</h2>
          <p className="text-sm text-gray-500">Enter details manually or use a registration QR code</p>
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 bg-[#6C3EF4] text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all"
        >
          <QrCode size={18} />
          Scan QR to Auto-Fill
        </button>
      </div>

      {qrMessage && (
        <div className="mx-8 mt-6 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={18} /> {qrMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Fields */}
        <div className="space-y-1">
          <label htmlFor="manager-name" className="text-sm font-semibold text-gray-700">Manager Name</label>
          <input 
            id="manager-name"
            type="text" required value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6C3EF4] focus:border-transparent outline-none transition-all"
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="manager-email" className="text-sm font-semibold text-gray-700">Email Address</label>
          <input 
            id="manager-email"
            type="email" required value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6C3EF4] outline-none"
            placeholder="email@company.com"
          />
        </div>

        <div className="space-y-1 relative">
          <label htmlFor="manager-password" className="text-sm font-semibold text-gray-700">Password</label>
          <input 
            id="manager-password"
            type={showPassword ? "text" : "password"} required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6C3EF4] outline-none"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-gray-400">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="space-y-1">
          <label htmlFor="manager-phone" className="text-sm font-semibold text-gray-700">Phone Number</label>
          <input 
            id="manager-phone"
            type="tel" required value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6C3EF4] outline-none"
            placeholder="+91 00000 00000"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="manager-company" className="text-sm font-semibold text-gray-700">Assign Company</label>
          <select 
            id="manager-company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6C3EF4] outline-none appearance-none bg-white"
          >
            <option value="">Select Company</option>
            <option value="ABC Pvt Ltd">ABC Pvt Ltd</option>
            <option value="KRAVI Corp">KRAVI Corp</option>
          </select>
        </div>

        <fieldset className="space-y-1">
          <legend className="text-sm font-semibold text-gray-700">Status</legend>
          <div className="flex gap-4 p-1">
            <label htmlFor="manager-status-active" className="flex items-center gap-2 cursor-pointer">
              <input id="manager-status-active" type="radio" name="status" checked={formData.status === 'Active'} onChange={() => setFormData({...formData, status: 'Active'})} className="accent-[#6C3EF4]" />
              <span className="text-sm">Active</span>
            </label>
            <label htmlFor="manager-status-inactive" className="flex items-center gap-2 cursor-pointer">
              <input id="manager-status-inactive" type="radio" name="status" checked={formData.status === 'Inactive'} onChange={() => setFormData({...formData, status: 'Inactive'})} className="accent-[#6C3EF4]" />
              <span className="text-sm">Inactive</span>
            </label>
          </div>
        </fieldset>

        <button type="submit" className="md:col-span-2 mt-4 bg-[#6C3EF4] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-100 transition-all">
          Register Manager
        </button>
      </form>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Scan Manager QR</h3>
              <button type="button" onClick={() => setShowScanner(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            <div id="reader" className="w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddManagerForm;