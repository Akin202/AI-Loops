import React, { useState, useEffect } from 'react';
import type { Contact, Organisation, TeamRole } from '../../../types';
import { Copy, Check, Mail, ExternalLink, X, ShieldAlert, FileText } from 'lucide-react';
import { logOrganisationInteraction } from '../../../lib/data-access';

interface OutreachDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  organisation: Organisation;
  currentRole: TeamRole;
  onInteractionLogged?: () => void;
}

type TemplateType = 'intro' | 'event' | 'milestone';

export const OutreachDraftModal: React.FC<OutreachDraftModalProps> = ({
  isOpen,
  onClose,
  organisation,
  currentRole,
  onInteractionLogged,
}) => {
  if (!isOpen) return null;

  const contacts = organisation.contacts || [];
  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  const [selectedContactEmail, setSelectedContactEmail] = useState<string>(
    primaryContact?.email || ''
  );
  const [selectedContactName, setSelectedContactName] = useState<string>(
    primaryContact?.name || organisation.name
  );
  const [template, setTemplate] = useState<TemplateType>('intro');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Generate template content
  useEffect(() => {
    const ownerName = organisation.owner || 'UNILAG AI UniPod Partnerships Team';
    const recipientName = selectedContactName || 'Team';

    if (template === 'intro') {
      setSubject(`Partnership Introduction: UNILAG AI UniPod & ${organisation.name}`);
      setBody(
        `Dear ${recipientName},\n\nI am writing from the University of Lagos (UNILAG) AI UniPod, supported by UNDP. As part of our mandate to accelerate Nigeria's artificial intelligence and deep-tech ecosystem, we have been closely tracking ${organisation.name}'s impactful work in ${organisation.sector}.\n\nWe would welcome an introductory bilateral session to explore strategic alignment across applied AI research, student talent pathways, and convening ecosystem stakeholders.\n\nPlease let us know if your team is available for a brief introductory call in the coming week.\n\nWarm regards,\n${ownerName}\nUNILAG AI UniPod / UNDP Partner Registry`
      );
    } else if (template === 'event') {
      setSubject(`Convening Collaboration: UNILAG AI UniPod & ${organisation.name}`);
      setBody(
        `Dear ${recipientName},\n\nFollowing our review of upcoming deep-tech convenings across Lagos and Nigeria, UNILAG AI UniPod is inviting ${organisation.name} to collaborate as a core co-host and ecosystem partner for our upcoming AI convenings series.\n\nOur facility at UNILAG provides state-of-the-art incubation, compute access, and direct connectivity to Nigeria's highest-density engineering and research talent pool.\n\nWe would appreciate a focused discussion to coordinate event themes, developer workshops, and joint programming.\n\nBest regards,\n${ownerName}\nUNILAG AI UniPod / UNDP Partner Registry`
      );
    } else if (template === 'milestone') {
      setSubject(`Partnership Milestone Review: UNILAG AI UniPod & ${organisation.name}`);
      setBody(
        `Dear ${recipientName},\n\nIn accordance with our ongoing partnership framework at UNILAG AI UniPod, we are conducting our periodic milestone review for ${organisation.name}.\n\nWe would like to review our joint talent pipeline engagements, technical hackathon outcomes, and next-phase roadmap milestones for the upcoming quarter.\n\nKindly review your team's availability this week for a 30-minute sync.\n\nBest regards,\n${ownerName}\nUNILAG AI UniPod / UNDP Partner Registry`
      );
    }
  }, [template, organisation, selectedContactName]);

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    setSelectedContactEmail(email);
    const found = contacts.find((c) => c.email === email);
    if (found) {
      setSelectedContactName(found.name);
    }
  };

  const handleCopy = async () => {
    const fullText = `To: ${selectedContactEmail}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleLogInteraction = async () => {
    if (currentRole === 'Viewer' || isLogging) return;
    setIsLogging(true);
    try {
      await logOrganisationInteraction(organisation.id, {
        date: new Date().toISOString(),
        channel: 'Email',
        direction: 'Outbound',
        summary: `Outbound outreach draft generated (${template.toUpperCase()}): "${subject}" for ${selectedContactName} (${selectedContactEmail})`,
        loggedBy: organisation.owner || 'Console User',
      });
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 2500);
      if (onInteractionLogged) {
        onInteractionLogged();
      }
    } catch (err) {
      console.error('Failed to log interaction draft:', err);
    } finally {
      setIsLogging(false);
    }
  };

  const mailtoHref = `mailto:${encodeURIComponent(selectedContactEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1D4ED8]" />
            <h2 className="text-sm font-semibold text-[#1C1917]">
              Draft Outreach Communication
            </h2>
            <span className="text-[11px] font-mono text-[#78716C] bg-[#F5F5F4] px-2 py-0.5 rounded border border-[#E7E5E4]">
              {organisation.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded hover:bg-[#E7E5E4]/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Governance Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Document Control Policy Notice</span>
              <p className="leading-relaxed">
                Direct external dispatch is strictly restricted by UniPod governance. All drafts must be reviewed and cleared with the Executive Lead before outbound transmission.
              </p>
            </div>
          </div>

          {/* Template Selector & Contact Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
                Communication Template
              </label>
              <div className="flex rounded border border-[#E7E5E4] overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setTemplate('intro')}
                  className={`flex-1 py-1.5 px-2 text-center transition-colors ${
                    template === 'intro'
                      ? 'bg-[#1D4ED8] text-white font-medium'
                      : 'bg-white text-[#44403C] hover:bg-[#F5F5F4]'
                  }`}
                >
                  Introduction
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('event')}
                  className={`flex-1 py-1.5 px-2 text-center border-l border-r border-[#E7E5E4] transition-colors ${
                    template === 'event'
                      ? 'bg-[#1D4ED8] text-white font-medium'
                      : 'bg-white text-[#44403C] hover:bg-[#F5F5F4]'
                  }`}
                >
                  Event Co-host
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('milestone')}
                  className={`flex-1 py-1.5 px-2 text-center transition-colors ${
                    template === 'milestone'
                      ? 'bg-[#1D4ED8] text-white font-medium'
                      : 'bg-white text-[#44403C] hover:bg-[#F5F5F4]'
                  }`}
                >
                  Milestone
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
                Recipient Contact
              </label>
              {contacts.length > 0 ? (
                <select
                  value={selectedContactEmail}
                  onChange={handleContactChange}
                  className="w-full text-xs border border-[#E7E5E4] rounded px-2.5 py-1.5 bg-white text-[#1C1917] focus:outline-hidden focus:border-[#1D4ED8]"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.email}>
                      {c.name} ({c.title || 'Contact'}) - {c.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="email"
                  value={selectedContactEmail}
                  onChange={(e) => setSelectedContactEmail(e.target.value)}
                  placeholder="contact@organisation.ng"
                  className="w-full text-xs border border-[#E7E5E4] rounded px-2.5 py-1.5 bg-white text-[#1C1917] focus:outline-hidden focus:border-[#1D4ED8]"
                />
              )}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-[11px] font-mono text-[#78716C] uppercase mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs border border-[#E7E5E4] rounded px-3 py-2 bg-white text-[#1C1917] font-medium focus:outline-hidden focus:border-[#1D4ED8]"
            />
          </div>

          {/* Body Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-[#78716C] uppercase">
                Email Message Body
              </label>
              <span className="text-[10px] text-[#A8A29E] font-mono">
                Editable draft. Changes persist during this modal session.
              </span>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs border border-[#E7E5E4] rounded p-3 bg-white text-[#1C1917] font-mono leading-relaxed resize-none focus:outline-hidden focus:border-[#1D4ED8]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#E7E5E4] bg-[#FAFAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogInteraction}
              disabled={currentRole === 'Viewer' || isLogging || logSuccess}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                logSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
              }`}
            >
              {logSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Draft Logged in Timeline</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Log Draft to Timeline</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white border border-[#E7E5E4] text-[#1C1917] hover:bg-[#F5F5F4] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Copy Draft</span>
                </>
              )}
            </button>

            <a
              href={mailtoHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium bg-[#1D4ED8] text-white hover:bg-[#1E40AF] transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Launch Mail Client</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
