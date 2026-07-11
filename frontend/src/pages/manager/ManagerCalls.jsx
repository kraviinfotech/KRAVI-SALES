import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import CallButton from '../../components/CallButton';
import { Loader2, Phone, Video } from 'lucide-react';

const ManagerCalls = () => {
  const { t } = useTranslation();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callContactsBySellerId, setCallContactsBySellerId] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerRes, contactsRes] = await Promise.all([
          API.get('/sellers'),
          API.get('/calls/contacts')
        ]);

        const nextContacts = {};
        (contactsRes.data?.contacts || []).forEach((contact) => {
          if (contact.sellerId && contact.id) {
            nextContacts[contact.sellerId] = contact.id;
          }
        });

        setSellers(Array.isArray(sellerRes.data) ? sellerRes.data : []);
        setCallContactsBySellerId(nextContacts);
      } catch (error) {
        console.error('Error loading manager calls data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sellerList = useMemo(() => {
    return sellers.filter((seller) => seller?.userId || seller?.phone || seller?.email);
  }, [sellers]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t('manager.calls.title')}</p>
            <h1 className="text-2xl font-black text-slate-950">{t('manager.calls.heading')}</h1>
            <p className="mt-1 text-sm text-slate-600">{t('manager.calls.description')}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm font-semibold text-slate-500">
            <Loader2 className="animate-spin text-blue-700" size={18} />
            {t('manager.calls.loading')}
          </div>
        ) : sellerList.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm font-semibold text-slate-500">
            {t('manager.calls.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-600">{t('manager.calls.seller')}</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-600">{t('manager.calls.contact')}</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-600">{t('manager.calls.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sellerList.map((seller) => {
                  const contactId = callContactsBySellerId[seller.userId] || seller.userId;
                  return (
                    <tr key={seller._id || seller.userId || seller.email} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-black text-slate-900">{seller.name || seller.shopName || t('manager.calls.unnamed_seller')}</div>
                        <div className="text-sm text-slate-500">{seller.shopName || seller.role || t('manager.calls.seller')}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {seller.phone || seller.email || t('manager.calls.no_contact')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <CallButton targetUserId={contactId} type="voice" label={t('manager.calls.call')} />
                          <CallButton targetUserId={contactId} type="video" label={t('manager.calls.video')} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerCalls;
