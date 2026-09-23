import React, { useEffect, useState } from 'react';
import type { TeamMember, TeamRole } from '../../../types';
import { getAllTeamMembers, addTeamMember } from '../../../lib/data-access';
import {
  Plus,
  Mail,
  Phone,
  QrCode,
  Share2,
  X,
  Sparkles,
  Shield,
  Copy,
  Check,
  Building,
} from 'lucide-react';

interface ConsoleTeamProps {
  currentRole: TeamRole;
}

export const ConsoleTeam: React.FC<ConsoleTeamProps> = ({ currentRole }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [role, setRole] = useState<TeamRole>('Editor');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Virtual Card Modal State (AI Loops Dark Aesthetic!)
  const [virtualCardMember, setVirtualCardMember] = useState<TeamMember | null>(null);
  const [copiedVCard, setCopiedVCard] = useState(false);

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTeamMembers();
      setTeamMembers(data);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Viewer' || !name.trim() || !email.trim()) return;

    try {
      // TODO(handoff): persist team member
      const newMember = await addTeamMember({
        name: name.trim(),
        title: title.trim() || 'Team Specialist',
        unit: unit.trim() || 'Ecosystem Partnerships',
        role,
        email: email.trim(),
        phone: phone.trim() || '',
        active: true,
      });

      setTeamMembers((prev) => [...prev, newMember]);
      setShowAddModal(false);
      setName('');
      setTitle('');
      setUnit('');
      setRole('Editor');
      setEmail('');
      setPhone('');
    } catch (err) {
      console.error('Failed to add team member:', err);
    }
  };

  const handleCopyVCard = (member: TeamMember) => {
    // TODO(handoff): export vCard / share
    const cardText = `BEGIN:VCARD\nVERSION:3.0\nFN:${member.name}\nTITLE:${member.title}\nORG:AI Loops;${member.unit}\nEMAIL:${member.email}\nTEL:${member.phone || ''}\nURL:https://loops.africa\nEND:VCARD`;
    navigator.clipboard?.writeText?.(cardText);
    setCopiedVCard(true);
    setTimeout(() => setCopiedVCard(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917] tracking-tight flex items-center gap-2">
            <span>Team Directory</span>
            <span className="text-xs font-mono font-normal text-[#78716C]">
              ({teamMembers.length} active)
            </span>
          </h1>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Internal ecosystem leads, field representatives, and executive champions
          </p>
        </div>

        {currentRole !== 'Viewer' && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors shadow-2xs min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Team Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-mono text-[#78716C]">
          Loading team roster…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#D6D3D1] transition-colors"
            >
              {/* Member Top: Name, Title, Unit, Role Badge */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#1C1917]">{member.name}</h3>
                    <p className="text-[11px] text-[#44403C] font-medium">{member.title}</p>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      member.role === 'Lead'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : member.role === 'Admin'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-[#F5F5F4] text-[#44403C] border-[#E7E5E4]'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C]">
                  <Building className="w-3 h-3 text-[#A8A29E]" />
                  <span>{member.unit}</span>
                </div>
              </div>

              {/* Contacts */}
              <div className="pt-2 border-t border-[#E7E5E4] space-y-1 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#44403C]">
                  <Mail className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  <a href={`mailto:${member.email}`} className="hover:text-[#1D4ED8] truncate">
                    {member.email}
                  </a>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-[#44403C]">
                    <Phone className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                    <a href={`tel:${member.phone}`} className="hover:text-[#1D4ED8]">
                      {member.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Virtual Card Action (Meets AI Loops Dark Aesthetic) */}
              <div className="pt-2 border-t border-[#E7E5E4] flex justify-end">
                <button
                  type="button"
                  onClick={() => setVirtualCardMember(member)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium text-[#1C1917] bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] rounded transition-colors"
                >
                  <QrCode className="w-3 h-3 text-[#78716C]" />
                  <span>Virtual Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- ADD MEMBER MODAL ----------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#1C1917]">Add Team Member</h3>
                <p className="text-[11px] text-[#78716C] font-mono">
                  Create an internal console user and partner liaison record
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#78716C] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Bello"
                  className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#78716C] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Regional Community Architect"
                  className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#78716C] mb-1">
                  Unit / Department
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. Developer Relations & Ecosystem"
                  className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#78716C] mb-1">
                    Console Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TeamRole)}
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#78716C] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 …"
                    className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#78716C] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. amina@loops.africa"
                  className="w-full p-2 border border-[#E7E5E4] rounded bg-[#FAFAF9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#44403C] hover:bg-[#F5F5F4] rounded border border-[#E7E5E4]"
                >
                  Cancel
                </button>
                {/* // TODO(handoff): persist team member */}
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded transition-colors"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- VIRTUAL CARD MODAL (AI LOOPS DARK AESTHETIC) ----------------- */}
      {virtualCardMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0C0A09] text-[#FAFAF9] border border-[#292524] rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in zoom-in-95 relative">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setVirtualCardMember(null)}
              className="absolute right-4 top-4 text-[#A8A29E] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close card preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* AI Loops Branding & Motif Header */}
            <div className="flex items-center justify-between border-b border-[#292524] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] inline-block shadow-[0_0_8px_#1D4ED8]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#A8A29E] font-medium">
                  Loops Virtual Card
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#78716C]">VERIFIED 2026</span>
            </div>

            {/* Member Profile in Dark Identity */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {virtualCardMember.name}
              </h2>
              <p className="text-xs text-[#E7E5E4] font-medium">{virtualCardMember.title}</p>
              <p className="text-[11px] font-mono text-[#A8A29E]">{virtualCardMember.unit}</p>
            </div>

            {/* Interactive QR Simulation */}
            <div className="bg-[#1C1917] border border-[#292524] rounded-xl p-4 flex flex-col items-center justify-center space-y-2.5">
              <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner">
                {/* Simulated high-contrast QR Matrix */}
                <div className="w-full h-full border-4 border-black p-1 grid grid-cols-6 grid-rows-6 gap-0.5 bg-white">
                  <div className="bg-black col-span-2 row-span-2" />
                  <div className="bg-black col-start-5 col-span-2 row-span-2" />
                  <div className="bg-black col-span-2 row-start-5 row-span-2" />
                  <div className="bg-black col-start-3 col-span-2 row-start-3 row-span-2 rounded-xs" />
                  <div className="bg-black col-start-4 row-start-1" />
                  <div className="bg-black col-start-1 row-start-4" />
                  <div className="bg-black col-start-6 row-start-4" />
                  <div className="bg-black col-start-4 row-start-6" />
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#A8A29E] tracking-wider uppercase">
                Scan to Save Contact · loops.africa
              </span>
            </div>

            {/* Direct Contact Links */}
            <div className="space-y-1.5 text-xs font-mono text-[#D6D3D1]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                <span className="truncate">{virtualCardMember.email}</span>
              </div>
              {virtualCardMember.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                  <span>{virtualCardMember.phone}</span>
                </div>
              )}
            </div>

            {/* Actions: Copy vCard & Done */}
            <div className="pt-2 border-t border-[#292524] flex items-center justify-between gap-3">
              {/* // TODO(handoff): export vCard / share */}
              <button
                type="button"
                onClick={() => handleCopyVCard(virtualCardMember)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1C1917] hover:bg-[#292524] border border-[#292524] rounded-lg text-xs font-mono text-white transition-colors"
              >
                {copiedVCard ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>vCard Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span>Copy vCard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setVirtualCardMember(null)}
                className="py-2 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
