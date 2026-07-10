import React from 'react';
import { useTranslation } from 'react-i18next';

const StatCards = ({ stats, loading }) => {
  const { t } = useTranslation();
  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="group overflow-hidden rounded-xl bg-white/70 backdrop-blur-lg border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="h-1 bg-slate-900" />
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className={`mt-3 truncate text-2xl font-black ${stat.accent}`}>
                  {loading ? '--' : stat.value}
                </p>
              </div>
              <div className={`rounded-md p-2 ${stat.iconBg} ${stat.accent}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default StatCards;
