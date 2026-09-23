import React, { useEffect, useState } from 'react';
import type {
  Contact,
  Interaction,
  InteractionChannel,
  InteractionDirection,
  Organisation,
  OrganisationTier,
  PipelineStage,
  Sector,
  TeamRole,
} from '../../../types';
import {
  getOrganisationById,
  updateOrganisation,
  addOrganisationContact,
  logOrganisationInteraction,
} from '../../../lib/data-access';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Plus,
  Save,
  CheckCircle,
  ExternalLink,
  Activity,
  UserCheck,
  Send,
  MessageSquare,
  Copy,
  FileText,
  X,
} from 'lucide-react';
import { loopsConfig } from '../../../config/loops.config.ts';
import { OutreachDraftModal } from './OutreachDraftModal';
import { offlineQueue } from '../../../lib/offline-queue';

interface ConsoleOrganisationDetailProps {
  orgId: string;
  onNavigate: (path: string) => void;
  currentRole: TeamRole;
}

type TabType = 'overview' | 'contacts' | 'timeline' | 'kpis';

export const ConsoleOrganisationDetail: React.FC<ConsoleOrganisationDetailProps> = ({
  orgId,
  onNavigate,
  currentRole,
}) => {
  const [org, setOrg] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Overview form edit state
  const [formData, setFormData] = useState<Partial<Organisation>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add Contact Form State
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  // Log Interaction State
  const [interactionChannel, setInteractionChannel] = useState<InteractionChannel>('Email');
  const [interactionDirection, setInteractionDirection] = useState<InteractionDirection>('Outbound');
  const [interactionSummary, setInteractionSummary] = useState('');
  const [interactionDate, setInteractionDate] = useState(() => new Date().toISOString().slice(0, 16));

  // Outreach Draft Modal State
  const [showOutreachModal, setShowOutreachModal] = useState(false);

  const stages: PipelineStage[] = [
    'Lead',
    'Contacted',
    'Engaged',
    'Partnered',
    'Champion',
    'Inactive',
  ];
  const tiers: OrganisationTier[] = ['Tier 1', 'Tier 2', 'Tier 3'];
  const sectors: Sector[] = [
    'Artificial Intelligence',
    'Fintech',
    'HealthTech',
    'GovTech',
    'EdTech',
    'AgriTech',
    'Creative Tech',
  ];

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getOrganisationById(orgId);
        if (data) {
          setOrg(data);
          setFormData(data);
        }
      } catch (err) {
        console.error('Failed to load organisation:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[#78716C]">
        Loading organisation dossier…
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onNavigate('/console/pipeline')}
          className="inline-flex items-center gap-1.5 text-xs text-[#1D4ED8] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pipeline</span>
        </button>
        <div className="bg-white border border-[#E7E5E4] rounded p-8 text-center text-xs font-mono text-[#78716C]">
          Organisation not found with ID {orgId}.
        </div>
      </div>
    );
  }

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Viewer') return;
    setIsSaving(true);
    try {
      const updated = await updateOrganisation(org.id, formData);
      setOrg(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update organisation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Viewer' || !contactName.trim() || !contactEmail.trim()) return;

    const contactPayload = {
      name: contactName.trim(),
      title: contactTitle.trim() || 'Representative',
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      isPrimary: contactIsPrimary,
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('addOrganisationContact', { orgId: org.id, data: contactPayload });
      const optimisticContact = { ...contactPayload, id: `offline-c-${Date.now()}` };
      setOrg((prev) =>
        prev
          ? {
              ...prev,
              contacts: prev.contacts ? [...prev.contacts, optimisticContact] : [optimisticContact],
            }
          : prev
      );
      setContactName('');
      setContactTitle('');
      setContactEmail('');
      setContactPhone('');
      setContactIsPrimary(false);
      setShowAddContact(false);
      return;
    }

    try {
      const newContact = await addOrganisationContact(org.id, contactPayload);

      setOrg((prev) =>
        prev
          ? {
              ...prev,
              contacts: prev.contacts ? [...prev.contacts, newContact] : [newContact],
            }
          : prev
      );

      // Reset form
      setContactName('');
      setContactTitle('');
      setContactEmail('');
      setContactPhone('');
      setContactIsPrimary(false);
      setShowAddContact(false);
    } catch (err) {
      console.warn('Network issue adding contact, saving to offline queue:', err);
      offlineQueue.enqueue('addOrganisationContact', { orgId: org.id, data: contactPayload });
    }
  };

  const handleLogInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Viewer' || !interactionSummary.trim()) return;

    const interactionPayload = {
      date: new Date(interactionDate).toISOString(),
      channel: interactionChannel,
      direction: interactionDirection,
      summary: interactionSummary.trim(),
      loggedBy: currentRole === 'Lead' ? 'Tolu Adebayo' : 'Console User',
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('logOrganisationInteraction', { orgId: org.id, data: interactionPayload });
      const optimisticInt = { ...interactionPayload, id: `offline-int-${Date.now()}` };
      setOrg((prev) =>
        prev
          ? {
              ...prev,
              interactions: prev.interactions ? [optimisticInt, ...prev.interactions] : [optimisticInt],
            }
          : prev
      );
      setInteractionSummary('');
      return;
    }

    try {
      const newInt = await logOrganisationInteraction(org.id, interactionPayload);

      setOrg((prev) =>
        prev
          ? {
              ...prev,
              interactions: prev.interactions ? [newInt, ...prev.interactions] : [newInt],
            }
          : prev
      );

      setInteractionSummary('');
    } catch (err) {
      console.warn('Network issue logging interaction, saving to offline queue:', err);
      offlineQueue.enqueue('logOrganisationInteraction', { orgId: org.id, data: interactionPayload });
    }
  };

  const isOverdue =
    Boolean(org.nextActionAt) &&
    org.stage !== 'Inactive' &&
    new Date(org.nextActionAt!).getTime() < new Date('2026-09-18T16:15:25Z').getTime();

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb Navigation */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('/console/pipeline')}
          className="inline-flex items-center gap-1.5 text-xs text-[#1D4ED8] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Partner Pipeline</span>
        </button>
      </div>

      {/* Header: Name, Tier, Stage, Owner */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-5 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-semibold text-[#1C1917] tracking-tight">{org.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]">
                {org.tier || 'Tier 2'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  org.stage === 'Partnered' || org.stage === 'Champion'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : org.stage === 'Inactive'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {org.stage || 'Lead'}
              </span>
            </div>
            <p className="text-xs text-[#78716C]">{org.sector}</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="text-right">
              <span className="text-[#78716C] block text-[10px] uppercase">Account Owner</span>
              <span className="font-semibold text-[#1C1917]">{org.owner || 'Unassigned'}</span>
            </div>
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 border border-[#E7E5E4] rounded hover:bg-[#F5F5F4] text-[#78716C] hover:text-[#1C1917]"
                title="Open Partner Website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setShowOutreachModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] text-white hover:bg-[#1E40AF] rounded text-xs font-medium transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Draft Outreach</span>
            </button>
          </div>
        </div>

        {/* Inactive Reason Banner if inactive */}
        {org.stage === 'Inactive' && org.inactiveReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-0.5">
            <span className="font-mono text-[10px] uppercase font-bold text-rose-700">
              Deactivation Reason Logged:
            </span>
            <p className="italic">“{org.inactiveReason}”</p>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-[#E7E5E4] flex gap-2">
        {(['overview', 'contacts', 'timeline', 'kpis'] as TabType[]).map((tab) => {
          const isSelected = activeTab === tab;
          const label =
            tab === 'overview'
              ? 'Overview'
              : tab === 'contacts'
              ? `Contacts (${org.contacts?.length || 0})`
              : tab === 'timeline'
              ? `Timeline (${org.interactions?.length || 0})`
              : 'KPIs';

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-mono font-medium uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                isSelected
                  ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold bg-[#FFFFFF]'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW (Fields, Editable) */}
      {activeTab === 'overview' && (
        <form
          onSubmit={handleSaveOverview}
          className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-5 space-y-4 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
              Organisation Parameters
            </h3>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Saved successfully</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Organisation Name
              </label>
              <input
                type="text"
                disabled={currentRole === 'Viewer'}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Sector
              </label>
              <select
                disabled={currentRole === 'Viewer'}
                value={formData.sector || 'Artificial Intelligence'}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:ring-1 focus:ring-[#1D4ED8]"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Partnership Tier
              </label>
              <select
                disabled={currentRole === 'Viewer'}
                value={formData.tier || 'Tier 2'}
                onChange={(e) =>
                  setFormData({ ...formData, tier: e.target.value as OrganisationTier })
                }
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:ring-1 focus:ring-[#1D4ED8]"
              >
                {tiers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Pipeline Stage
              </label>
              <select
                disabled={currentRole === 'Viewer'}
                value={formData.stage || 'Lead'}
                onChange={(e) =>
                  setFormData({ ...formData, stage: e.target.value as PipelineStage })
                }
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:ring-1 focus:ring-[#1D4ED8]"
              >
                {stages.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Account Owner
              </label>
              <input
                type="text"
                disabled={currentRole === 'Viewer'}
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Website
              </label>
              <input
                type="url"
                disabled={currentRole === 'Viewer'}
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Description & Ecosystem Alignment
              </label>
              <textarea
                rows={3}
                disabled={currentRole === 'Viewer'}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Next Action Item
              </label>
              <input
                type="text"
                disabled={currentRole === 'Viewer'}
                value={formData.nextAction || ''}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                Next Action Deadline
              </label>
              <input
                type="date"
                disabled={currentRole === 'Viewer'}
                value={formData.nextActionAt ? formData.nextActionAt.slice(0, 10) : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextActionAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          {currentRole !== 'Viewer' && (
            <div className="pt-3 border-t border-[#E7E5E4] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 2: CONTACTS (List + Add) */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
              Key Partner Liaisons
            </h3>
            {currentRole !== 'Viewer' && !showAddContact && (
              <button
                type="button"
                onClick={() => setShowAddContact(true)}
                className="px-3 py-1.5 bg-[#1D4ED8] text-white text-xs font-medium rounded inline-flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
          </div>

          {/* Add Contact Modal / Form */}
          {showAddContact && (
            <form
              onSubmit={handleAddContactSubmit}
              className="bg-[#FFFFFF] border border-[#1D4ED8]/40 rounded p-4 space-y-3 shadow-sm animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                <span className="font-semibold text-xs text-[#1C1917]">New Contact Record</span>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="text-xs text-[#78716C] hover:text-[#1C1917]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Kelechi Nwosu"
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
                    Title / Role
                  </label>
                  <input
                    type="text"
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="e.g. Lead Research Scientist"
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. contact@organisation.ng"
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={contactIsPrimary}
                    onChange={(e) => setContactIsPrimary(e.target.checked)}
                    className="rounded text-[#1D4ED8]"
                  />
                  <span>Mark as primary liaison</span>
                </label>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Contacts List */}
          {(!org.contacts || org.contacts.length === 0) ? (
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-8 text-center text-xs font-mono text-[#78716C]">
              No contacts registered for this organisation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {org.contacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-xs text-[#1C1917] block">{c.name}</span>
                      <span className="text-[11px] text-[#78716C]">{c.title}</span>
                    </div>
                    {c.isPrimary && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E7E5E4] space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#44403C]">
                      <Mail className="w-3 h-3 text-[#78716C]" />
                      <a href={`mailto:${c.email}`} className="hover:text-[#1D4ED8] truncate">
                        {c.email}
                      </a>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-2 text-[#44403C]">
                        <Phone className="w-3 h-3 text-[#78716C]" />
                        <a href={`tel:${c.phone}`} className="hover:text-[#1D4ED8]">
                          {c.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMELINE (Interactions + Log Composer) */}
      {activeTab === 'timeline' && (
        <div className="space-y-5">
          {/* Log Interaction Composer */}
          {currentRole !== 'Viewer' && (
            <form
              onSubmit={handleLogInteractionSubmit}
              className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-4 space-y-3 shadow-2xs"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
                Log Interaction Record
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-[#78716C] uppercase mb-1">
                    Channel
                  </label>
                  <select
                    value={interactionChannel}
                    onChange={(e) => setInteractionChannel(e.target.value as InteractionChannel)}
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  >
                    {(['Email', 'WhatsApp', 'Call', 'In-Person', 'Event'] as InteractionChannel[]).map(
                      (ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#78716C] uppercase mb-1">
                    Direction
                  </label>
                  <select
                    value={interactionDirection}
                    onChange={(e) =>
                      setInteractionDirection(e.target.value as InteractionDirection)
                    }
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  >
                    <option value="Outbound">Outbound (We initiated)</option>
                    <option value="Inbound">Inbound (They initiated)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#78716C] uppercase mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={interactionDate}
                    onChange={(e) => setInteractionDate(e.target.value)}
                    className="w-full p-1.5 border border-[#E7E5E4] rounded bg-[#FAFAF9] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#78716C] uppercase mb-1">
                  Discussion Summary & Action Points *
                </label>
                <textarea
                  rows={2}
                  required
                  value={interactionSummary}
                  onChange={(e) => setInteractionSummary(e.target.value)}
                  placeholder="e.g. Aligned on MoU GPU compute allocations; requested feedback on technical specs by Friday…"
                  className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!interactionSummary.trim()}
                  className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Log to Timeline</span>
                </button>
              </div>
            </form>
          )}

          {/* Timeline List (Newest first) */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
              Interaction Audit Trail
            </h3>

            {(!org.interactions || org.interactions.length === 0) ? (
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-8 text-center text-xs font-mono text-[#78716C]">
                No interactions logged yet.
              </div>
            ) : (
              <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E7E5E4]">
                {org.interactions.map((int) => (
                  <div
                    key={int.id}
                    className="relative pl-8 space-y-1.5 text-xs group"
                  >
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1D4ED8]" />
                    <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1C1917]">{int.channel}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] ${
                              int.direction === 'Inbound'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {int.direction}
                          </span>
                        </div>
                        <span className="text-[#78716C]">
                          {new Date(int.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#1C1917] leading-relaxed">{int.summary}</p>
                      <div className="text-[10px] font-mono text-[#A8A29E] pt-1">
                        Logged by {int.loggedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: KPIS (Read-only, scored server-side later) */}
      {activeTab === 'kpis' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-start gap-2">
            <Activity className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 font-mono text-[11px]">
              <span className="font-bold">Automated Engagement Index:</span>
              <p>
                Metrics are calculated periodically from public portal event contributions, community engagements, and bilateral MoU milestone completion. Scored server-side.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-4 space-y-1 shadow-2xs">
              <span className="text-[11px] font-mono text-[#78716C] uppercase">
                Period Health Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold text-[#1C1917] tabular-nums">
                  {org.kpis?.periodScore || 70}
                </span>
                <span className="text-xs text-[#78716C] font-mono">/ 100</span>
              </div>
              <p className="text-[10px] text-[#78716C]">
                Calculated on {org.kpis?.lastScoredAt ? new Date(org.kpis.lastScoredAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Q3 2026'}
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-4 space-y-1 shadow-2xs">
              <span className="text-[11px] font-mono text-[#78716C] uppercase">
                Portal Page Visits
              </span>
              <div className="font-mono text-3xl font-semibold text-[#1D4ED8] tabular-nums">
                {(org.kpis?.visits || 850).toLocaleString()}
              </div>
              <p className="text-[10px] text-[#78716C]">Unique developer impressions</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-4 space-y-1 shadow-2xs">
              <span className="text-[11px] font-mono text-[#78716C] uppercase">
                Event Contributions
              </span>
              <div className="font-mono text-3xl font-semibold text-emerald-700 tabular-nums">
                {org.kpis?.contributions || 2}
              </div>
              <p className="text-[10px] text-[#78716C]">Co-sponsored or hosted gatherings</p>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Draft Modal */}
      <OutreachDraftModal
        isOpen={showOutreachModal}
        onClose={() => setShowOutreachModal(false)}
        organisation={org}
        currentRole={currentRole}
        onInteractionLogged={async () => {
          const refreshed = await getOrganisationById(org.id);
          if (refreshed) setOrg(refreshed);
        }}
      />
    </div>
  );
};
