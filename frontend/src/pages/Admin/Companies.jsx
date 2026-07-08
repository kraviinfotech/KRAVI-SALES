import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Building, Calendar, Edit2, Eye, Filter, Search, Trash2, X } from 'lucide-react';
import API from '../../api/axios';

const COMPANIES_QUERY_KEY = ['admin', 'companies'];

const fetchCompanies = async () => {
  const res = await API.get('/companies');
  return Array.isArray(res.data) ? res.data : [];
};

const getStatusColor = (status) => {
  if (status === 'Active') return 'bg-green-100 text-green-700';
  if (status === 'Expired') return 'bg-red-100 text-red-700';
  if (status === 'Trial') return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-700';
};

const COMPANY_TABS = ['All', 'Active', 'Expired', 'Trial'];

const CompanyHeader = ({ onAdd }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{t('admin.company_management')}</h1>
      <button type="button" onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-[#6C3EF4] px-4 py-2 font-semibold text-white transition-all hover:bg-[#5a32cc]">
        {t('admin.add_company')}
      </button>
    </div>
  );
};

const CompanyFilters = ({ searchTerm, onSearch, activeTab, onTabChange }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex min-w-[300px] flex-1 items-center gap-2">
        <div className="relative flex-1">
          <label htmlFor="company-search" className="sr-only">{t('admin.search_companies')}</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="company-search"
            type="text"
            placeholder={t('admin.search_companies_placeholder')}
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
            aria-label={t('admin.search_companies')}
            className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-10 pr-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#6C3EF4]"
          />
        </div>
        <button type="button" aria-label={t('admin.filter_by_date')} className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-gray-600 hover:bg-gray-100">
          <Filter size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <label htmlFor="company-date-filter" className="sr-only">{t('admin.filter_by_date')}</label>
          <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input id="company-date-filter" type="date" aria-label={t('admin.filter_by_date')} className="rounded-lg border border-gray-100 bg-gray-50 py-2 pl-10 pr-3 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#6C3EF4]" />
        </div>
        <button type="button" className="rounded-lg bg-[#6C3EF4] px-3 py-2 text-sm font-medium text-white transition-all hover:bg-[#5a32cc]">
          {t('admin.apply')}
        </button>
      </div>

      <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-[#6C3EF4] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'All' && t('admin.all')}
            {tab !== 'All' && tab}
          </button>
        ))}
      </div>
    </div>
  );
};

const CompanyLogo = ({ company, size = 'small' }) => {
  const imageClass = size === 'large' ? 'w-24 h-24 mx-auto mb-4' : 'w-10 h-10';
  const iconSize = size === 'large' ? 48 : 20;

  return company.logo ? (
    <img src={company.logo} alt={company.name} className={`${imageClass} rounded-lg object-cover`} />
  ) : (
    <div className={`${imageClass} flex items-center justify-center rounded-lg bg-purple-100`}>
      <Building size={iconSize} className="text-purple-600" />
    </div>
  );
};

const CompanyActions = ({ company, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={() => onView(company)} aria-label={t('admin.view')} className="rounded-lg p-2 text-[#6C3EF4] transition-colors hover:bg-purple-50" title="View">
        <Eye size={18} />
      </button>
      <button type="button" onClick={() => onEdit(company)} aria-label={t('admin.edit')} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50" title={t('admin.edit')}>
        <Edit2 size={18} />
      </button>
      <button type="button" onClick={() => onDelete(company)} aria-label={t('admin.delete')} className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50" title="Delete">
        <Trash2 size={18} />
      </button>
    </div>
  );
};

const CompaniesTable = ({ loading, companies, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">{t('admin.company_logo')}</th>
              <th className="px-6 py-4">{t('admin.company_name')}</th>
              <th className="px-6 py-4">{t('admin.owner_name')}</th>
              <th className="px-6 py-4">{t('admin.email')} / {t('admin.phone')}</th>
              <th className="px-6 py-4">{t('admin.plan')}</th>
              <th className="px-6 py-4">{t('admin.manager')}</th>
              <th className="px-6 py-4">{t('admin.expiry_date')}</th>
              <th className="px-6 py-4">{t('admin.status')}</th>
              <th className="px-6 py-4 text-right">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">{t('admin.loading')}</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">{t('admin.no_companies_found')}</td></tr>
            ) : companies.map((company) => (
              <tr key={company._id || company.id} className="group transition-colors hover:bg-gray-50">
                <td className="px-6 py-4"><CompanyLogo company={company} /></td>
                <td className="px-6 py-4 font-semibold text-gray-800">{company.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{company.ownerName || '-'}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-800">{company.email || '-'}</div>
                  <div className="text-xs text-gray-500">{company.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-[#6C3EF4]">{company.plan}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{company.managerCount || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {company.expiryDate ? new Date(company.expiryDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(company.status)}`}>{company.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <CompanyActions company={company} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
    <p className="font-semibold text-gray-800">{value || '-'}</p>
  </div>
);

const CompanyDrawer = ({ company, onClose }) => {
  const { t } = useTranslation();
  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between bg-gradient-to-r from-[#6C3EF4] to-purple-600 p-6 text-white">
          <div>
            <h2 className="text-2xl font-bold">{t('admin.company_details')}</h2>
            <p className="text-sm text-purple-100">{company.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('admin.close')} className="rounded-lg p-2 text-white transition-all hover:bg-white hover:text-[#6C3EF4]">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
            <CompanyLogo company={company} size="large" />
            <p className="text-sm text-gray-500">{t('admin.company_logo')}</p>
          </div>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">{t('admin.company_information')}</h3>
            <div className="space-y-3">
              <DetailItem label={t('admin.company_name')} value={company.name} />
              <DetailItem label={t('admin.owner_name')} value={company.ownerName} />
              <DetailItem label={t('admin.gst_number')} value={company.gstNumber} />
              <DetailItem label={t('admin.address')} value={company.address} />
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label={t('admin.email')} value={company.email} />
                <DetailItem label={t('admin.phone')} value={company.phone} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">{t('admin.subscription_details')}</h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-medium uppercase text-blue-600">{t('admin.plan_type')}</p>
                <p className="text-lg font-semibold text-blue-900">{company.plan}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label={t('admin.start_date')} value={company.startDate ? new Date(company.startDate).toLocaleDateString() : '-'} />
                <DetailItem label={t('admin.expiry_date')} value={company.expiryDate ? new Date(company.expiryDate).toLocaleDateString() : '-'} />
              </div>
              <DetailItem label={t('admin.total_users')} value={company.subscriptionDetails?.users || 0} />
              <DetailItem label={t('admin.active_users')} value={company.subscriptionDetails?.activeUsers || 0} />
              <DetailItem label={t('admin.storage_used')} value={company.subscriptionDetails?.storage || '0 GB'} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">{t('admin.team_details')}</h3>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-medium uppercase text-green-600">{t('admin.manager_count')}</p>
              <p className="text-2xl font-semibold text-green-900">{company.managerCount || 0}</p>
            </div>
          </section>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-2 text-xs font-medium uppercase text-gray-500">{t('admin.status')}</p>
            <span className={`inline-block rounded-lg px-3 py-2 text-sm font-bold ${getStatusColor(company.status)}`}>
              {company.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCompanyPayload = (company = null) => {
  const name = window.prompt('Company name', company?.name || '');
  if (!name) return null;

  const ownerName = window.prompt('Owner name', company?.ownerName || '') || company?.ownerName || '';
  const email = window.prompt('Contact email', company?.email || '') || company?.email || '';
  const phone = window.prompt('Contact phone', company?.phone || '') || company?.phone || '';
  const gstNumber = window.prompt('GST Number', company?.gstNumber || '') || company?.gstNumber || '';
  const address = window.prompt('Address', company?.address || '') || company?.address || '';
  const plan = window.prompt(company ? 'Plan' : 'Plan (Basic/Professional/Enterprise)', company?.plan || 'Basic') || company?.plan || 'Basic';
  const managerCount = parseInt(window.prompt('Manager Count', String(company?.managerCount || 0)) || '0', 10);
  const expiryDefault = company?.expiryDate ? new Date(company.expiryDate).toISOString().slice(0, 10) : '';
  const expiry = window.prompt('Expiry date (YYYY-MM-DD)', expiryDefault) || '';

  return {
    name,
    ownerName,
    email,
    phone,
    gstNumber,
    address,
    plan,
    managerCount,
    expiryDate: expiry ? new Date(expiry) : undefined,
  };
};

const Companies = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: companies = [],
    isPending: loading,
  } = useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: fetchCompanies,
  });

  const filteredCompanies = useMemo(() => companies.filter((company) => {
    const matchesSearch = (company.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || company.status === activeTab;
    return matchesSearch && matchesTab;
  }), [companies, searchTerm, activeTab]);

  const handleAddCompany = () => {
    const payload = getCompanyPayload();
    if (!payload) return;

    API.post('/companies', {
      ...payload,
      status: 'Active',
      subscriptionDetails: { users: 0, activeUsers: 0, storage: '0 GB', features: [] },
    })
      .then((res) =>
        queryClient.setQueryData(COMPANIES_QUERY_KEY, (prev = []) => [
          res.data,
          ...prev,
        ])
      )
      .catch((err) => {
        console.error(err);
        window.alert('Failed to create company');
      });
  };

  const handleEdit = (company) => {
    if (!window.confirm(`${t('admin.edit')} ${company.name}?`)) return;
    const payload = getCompanyPayload(company);
    if (!payload) return;

    API.patch(`/companies/${company._id || company.id}`, payload)
      .then((res) => {
        queryClient.setQueryData(COMPANIES_QUERY_KEY, (prev = []) =>
          prev.map((item) =>
            (item._id || item.id) === (res.data._id || res.data.id) ? res.data : item
          )
        );
        setSelectedCompany((current) =>
          current && (current._id || current.id) === (res.data._id || res.data.id) ? res.data : current
        );
      })
      .catch((err) => {
        console.error(err);
        window.alert('Failed to update company');
      });
  };

  const handleDelete = (company) => {
    if (!window.confirm(`Delete ${company.name}? This cannot be undone.`)) return;

    API.delete(`/companies/${company._id || company.id}`)
      .then(() => {
        queryClient.setQueryData(COMPANIES_QUERY_KEY, (prev = []) =>
          prev.filter((item) =>
            (item._id || item.id) !== (company._id || company.id)
          )
        );
        if ((selectedCompany?._id || selectedCompany?.id) === (company._id || company.id)) {
          setSelectedCompany(null);
        }
      })
      .catch((err) => {
        console.error(err);
        window.alert('Failed to delete company');
      });
  };

  return (
    <div className="space-y-6">
      <CompanyHeader onAdd={handleAddCompany} />
      <CompanyFilters
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <CompaniesTable
        loading={loading}
        companies={filteredCompanies}
        onView={setSelectedCompany}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <CompanyDrawer company={selectedCompany} onClose={() => setSelectedCompany(null)} />
    </div>
  );
};

export default Companies;
