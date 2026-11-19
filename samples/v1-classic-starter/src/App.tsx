import { useState } from 'react';
import Navbar from '@comify.art/thuli/layout/Navbar';
import Footer from '@comify.art/thuli/layout/Footer';
import { ConfirmationModal } from '@comify.art/thuli/ui/ConfirmationModal';
import Modal from '@comify.art/thuli/ui/Modal';
import ComingSoon from '@comify.art/thuli/ui/ComingSoon';
import { shareContent } from '@comify.art/thuli/utils/shareUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'modals' | 'coming-soon'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await shareContent(
      { title: 'comify.art', url: 'https://comify.art' },
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    );
  };

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Modals Demo', path: '/modals' },
    { name: 'Roadmap', path: '/roadmap' },
  ];

  const footerLinks = {
    quickLinks: [
      { name: 'Documentation', path: '/docs' },
      { name: 'Samples', path: '/samples' },
    ],
    community: [
      { name: 'GitHub', path: 'https://github.com' },
      { name: 'comify.art', path: 'https://comify.art' },
    ],
    legal: [
      { name: 'License (Apache-2.0)', path: '/license' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. Header / Navbar from @comify.art/thuli/layout */}
      <Navbar
        title="Thuli Sample"
        logo="https://placehold.co/120x40/0f172a/38bdf8?text=Thuli"
        links={navLinks}
        rightSlot={
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition"
          >
            Trigger Action
          </button>
        }
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-16 px-4 max-w-6xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-8 space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'overview'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Utilities
          </button>
          <button
            onClick={() => setActiveTab('modals')}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'modals'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Modals & Dialogs
          </button>
          <button
            onClick={() => setActiveTab('coming-soon')}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'coming-soon'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ComingSoon Stub
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                @comify.art/thuli Component Showcase
              </h1>
              <p className="text-slate-400 leading-relaxed mb-6">
                This simple demonstration app shows how a host application consumes components
                and utilities from <code>@comify.art/thuli</code> with native subpath imports and
                precompiled Tailwind CSS v4 styling.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-sm transition"
                >
                  {copied ? '✓ Copied URL!' : 'Copy Link via shareUtils'}
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Open Standard Modal
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Modals */}
        {activeTab === 'modals' && (
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Modal Primitives</h2>
              <p className="text-slate-400 mb-6">
                Interactive dialogs from <code>@comify.art/thuli/ui</code>.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Launch Modal
                </button>
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Launch Dangerous Confirmation
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Coming Soon */}
        {activeTab === 'coming-soon' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <ComingSoon
              title="Next-Gen Feature"
              description="This section is currently under development using @comify.art/thuli UI stubs."
            />
          </div>
        )}
      </main>

      {/* 2. Footer from @comify.art/thuli/layout */}
      <Footer
        skinny={false}
        logo="https://placehold.co/120x40/0f172a/38bdf8?text=Thuli"
        description="Shared UI and utilities library for comify.art applications."
        links={footerLinks}
        contact={{
          email: "support@comify.art",
          address: "San Francisco, CA",
          name: "comify.art",
        }}
        copyright={`© ${new Date().getFullYear()} comify.art. All rights reserved.`}
        version="v1.0.0"
      />

      {/* Standard Modal from @comify.art/thuli/ui */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Modal Dialog"
      >
        <div className="space-y-4 text-slate-300">
          <p>
            This modal is rendered directly using <code>@comify.art/thuli/ui/Modal</code>.
          </p>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal from @comify.art/thuli/ui */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Confirm Important Action"
        message="Are you sure you want to trigger this action? This demonstrates the ConfirmationModal component."
        confirmLabel="Proceed"
        cancelLabel="Dismiss"
        isDangerous={true}
        onConfirm={() => {
          alert('Action confirmed!');
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
