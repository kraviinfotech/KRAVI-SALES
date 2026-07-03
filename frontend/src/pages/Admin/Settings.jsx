import React, { useEffect, useState } from 'react';
import { Save, Globe, Mail, Bell, ShieldCheck, CreditCard, Filter } from 'lucide-react';
import API from '../../api/axios';

const SettingSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
      <div className="p-2 bg-purple-50 text-[#6C3EF4] rounded-lg">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);




const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    appName: 'KRAVI SaaS',
    trialDays: 14,
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    paymentKeyId: '',
    paymentKeySecret: '',
    notifications: {
      subscriptionExpiring: true,
      newPaymentReceived: true,
      trialPeriodEnding: true
    }
  });

  

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get('/settings');
        setForm((f) => ({ ...f, ...res.data }));
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (path, value) => {
    setForm((prev) => {
      const copy = { ...prev };
      if (path.startsWith('notifications.')) {
        const key = path.split('.')[1];
        copy.notifications = { ...copy.notifications, [key]: value };
      } else {
        copy[path] = value;
      }
      return copy;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await API.put('/settings', form);
      setForm((f) => ({ ...f, ...res.data }));
      window.alert('Settings saved');
    } catch (err) {
      console.error('Failed to save settings', err);
      window.alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
            <button type="button" onClick={handleSave} disabled={loading} className="bg-[#6C3EF4] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#5a32cc] transition-all shadow-lg shadow-purple-100 disabled:opacity-60">
              <Save size={18} /> {loading ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/* Right: Settings sections grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SettingSection title="General Settings" icon={Globe}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="settings-app-name" className="text-xs font-bold text-gray-500">App Name</label>
                    <input id="settings-app-name" value={form.appName} onChange={(e) => handleChange('appName', e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-trial-days" className="text-xs font-bold text-gray-500">Trial Days</label>
                    <input id="settings-trial-days" value={form.trialDays} onChange={(e) => handleChange('trialDays', Number(e.target.value))} type="number" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2" />
                  </div>
                </div>
              </SettingSection>

              <SettingSection title="SMTP Configuration" icon={Mail}>
              <div className="space-y-3">
                <label htmlFor="settings-smtp-host" className="sr-only">SMTP host</label>
                <input id="settings-smtp-host" value={form.smtpHost} onChange={(e) => handleChange('smtpHost', e.target.value)} type="text" placeholder="SMTP Host" aria-label="SMTP host" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2" />
                <div className="grid grid-cols-3 gap-4">
                  <label htmlFor="settings-smtp-port" className="sr-only">SMTP port</label>
                  <input id="settings-smtp-port" value={form.smtpPort} onChange={(e) => handleChange('smtpPort', e.target.value)} type="text" placeholder="Port" aria-label="SMTP port" className="bg-gray-50 border-none rounded-xl px-4 py-2" />
                  <label htmlFor="settings-smtp-user" className="sr-only">SMTP user</label>
                  <input id="settings-smtp-user" value={form.smtpUser} onChange={(e) => handleChange('smtpUser', e.target.value)} type="text" placeholder="User" aria-label="SMTP user" className="col-span-2 bg-gray-50 border-none rounded-xl px-4 py-2" />
                </div>
              </div>
              </SettingSection>

              <SettingSection title="Payment Gateway (Razorpay)" icon={CreditCard}>
                <div className="space-y-3">
                  <label htmlFor="settings-payment-key-id" className="sr-only">Razorpay key ID</label>
                  <input id="settings-payment-key-id" value={form.paymentKeyId} onChange={(e) => handleChange('paymentKeyId', e.target.value)} type="password" placeholder="Key ID" aria-label="Razorpay key ID" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2" />
                  <label htmlFor="settings-payment-key-secret" className="sr-only">Razorpay key secret</label>
                  <input id="settings-payment-key-secret" value={form.paymentKeySecret} onChange={(e) => handleChange('paymentKeySecret', e.target.value)} type="password" placeholder="Key Secret" aria-label="Razorpay key secret" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2" />
                </div>
              </SettingSection>

              <SettingSection title="Notifications" icon={Bell}>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Subscription Expiring Soon</span>
                  <input type="checkbox" aria-label="Subscription expiring soon" checked={form.notifications.subscriptionExpiring} onChange={(e) => handleChange('notifications.subscriptionExpiring', e.target.checked)} />
                </label>
                <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">New Payment Received</span>
                  <input type="checkbox" aria-label="New payment received" checked={form.notifications.newPaymentReceived} onChange={(e) => handleChange('notifications.newPaymentReceived', e.target.checked)} />
                </label>
                <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Trial Period Ending</span>
                  <input type="checkbox" aria-label="Trial period ending" checked={form.notifications.trialPeriodEnding} onChange={(e) => handleChange('notifications.trialPeriodEnding', e.target.checked)} />
                </label>
              </div>
              </SettingSection>
            </div>
          </div>
    </div>
  );
};

export default Settings;