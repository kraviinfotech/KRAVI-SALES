import React from 'react';
import { Link } from 'react-router-dom';
import videoSrc from '../assets/landing-page.mp4';

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-cyan-200">KRAVI SALES</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Field sales tracking made effortless.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            One platform for managers, sellers, and admins to monitor field performance, manage subscriptions, and keep compliance aligned with easy onboarding.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/login" className="inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400">
              Login
            </Link>
            <Link to="/register?role=manager" className="inline-flex rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              Register as Manager
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
