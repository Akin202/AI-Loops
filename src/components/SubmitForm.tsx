import React, { useState } from 'react';
import type { EventCategory, EventCity, EventFormat, EventPriceType, EventSubmission, SubmissionState } from '../../types';
import { loopsConfig } from '../../config/loops.config';
import { MetaStrip } from './MetaStrip';

interface SubmitFormProps {
  submissionState: SubmissionState;
  onSubmit: (submission: EventSubmission) => void;
  onReset: () => void;
  onNavigateHome: () => void;
}

export const SubmitForm: React.FC<SubmitFormProps> = ({
  submissionState,
  onSubmit,
  onReset,
  onNavigateHome,
}) => {
  const [formData, setFormData] = useState<EventSubmission>({
    title: '',
    date: '2026-11-15',
    city: 'Lagos',
    venue: '',
    organiser: '',
    category: 'Conference',
    format: 'In-Person',
    priceType: 'Free',
    registrationUrl: '',
    description: '',
    submitterEmail: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic client validation
    if (
      !formData.title.trim() ||
      !formData.date ||
      !formData.venue.trim() ||
      !formData.organiser.trim() ||
      !formData.registrationUrl.trim() ||
      !formData.description.trim() ||
      !formData.submitterEmail.trim()
    ) {
      setFormError('All fields marked with an asterisk are required.');
      return;
    }

    onSubmit(formData);
  };

  // Success State View
  if (submissionState.status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-8">
        <div className="p-8 bg-[#141414] border border-[#262626] space-y-6">
          <MetaStrip
            items={['REGISTRY TRANSMISSION COMPLETE', 'STATUS: PENDING REVIEW']}
          />

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#FAFAFA] tracking-tight">
            Convening Submitted
          </h1>

          <p className="text-base text-[#E5E5E5] leading-relaxed font-normal">
            Your event filing has been logged in the AI Loops public staging ledger under reference{' '}
            <span className="font-mono font-bold text-[#FAFAFA]">
              {submissionState.id || 'mock-1'}
            </span>
            . The editorial board will verify organiser credentials within 48 hours.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onReset}
              className="min-h-[48px] px-6 py-3 bg-[#FAFAFA] text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.16em] hover:bg-white transition-colors"
            >
              + Submit Another Convening
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="min-h-[48px] px-6 py-3 border border-[#404040] text-xs font-semibold uppercase tracking-[0.14em] text-[#FAFAFA] hover:bg-[#1C1C1C] transition-colors"
            >
              Return to Public Index
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#262626] bg-[#0D0D0D]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="min-h-[48px] inline-flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-[#A3A3A3] hover:text-[#FAFAFA]"
          >
            ← Back to All Events
          </button>
          <MetaStrip items={['PUBLIC DEPOSIT PROTOCOL', 'FREE RECORDING']} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <MetaStrip items={['REGISTRY PROTOCOL', 'PUBLIC SUBMISSION FORM']} />
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#FAFAFA] tracking-tight">
            Submit a Convening
          </h1>
          <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
            Record a verified hackathon, technical symposium, or developer workshop in the national AI Loops directory.
          </p>
        </header>

        {formError && (
          <div
            role="alert"
            className="p-4 bg-[#1F1212] border border-[#7F1D1D] text-[#FCA5A5] text-sm"
          >
            {formError}
          </div>
        )}

        {/* Presentational Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="field-title"
              className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
            >
              Convening Title *
            </label>
            <input
              id="field-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Nigeria Blockchain & AI Week 2026"
              className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base placeholder-[#525252] focus:outline-none focus:border-[#FAFAFA]"
              disabled={submissionState.status === 'submitting'}
            />
          </div>

          {/* Date & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="field-date"
                className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
              >
                Date *
              </label>
              <input
                id="field-date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base focus:outline-none focus:border-[#FAFAFA]"
                disabled={submissionState.status === 'submitting'}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="field-city"
                className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
              >
                City / Host Region *
              </label>
              <select
                id="field-city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base focus:outline-none focus:border-[#FAFAFA]"
                disabled={submissionState.status === 'submitting'}
              >
                {loopsConfig.cities
                  .filter((c) => c !== 'All')
                  .map((city) => (
                    <option key={city} value={city} className="bg-[#141414] text-[#FAFAFA]">
                      {city}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <label
              htmlFor="field-venue"
              className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
            >
              Venue / Specific Address *
            </label>
            <input
              id="field-venue"
              name="venue"
              type="text"
              required
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Zone Tech Park, Plot 9 Gbagada Industrial Scheme, Lagos"
              className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base placeholder-[#525252] focus:outline-none focus:border-[#FAFAFA]"
              disabled={submissionState.status === 'submitting'}
            />
          </div>

          {/* Organiser */}
          <div className="space-y-2">
            <label
              htmlFor="field-organiser"
              className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
            >
              Organising Entity or Collective *
            </label>
            <input
              id="field-organiser"
              name="organiser"
              type="text"
              required
              value={formData.organiser}
              onChange={handleChange}
              placeholder="e.g. Blockchain & AI Ecosystem Association"
              className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base placeholder-[#525252] focus:outline-none focus:border-[#FAFAFA]"
              disabled={submissionState.status === 'submitting'}
            />
          </div>

          {/* Category, Format, Price Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="field-category"
                className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
              >
                Category *
              </label>
              <select
                id="field-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base focus:outline-none focus:border-[#FAFAFA]"
                disabled={submissionState.status === 'submitting'}
              >
                {loopsConfig.categories
                  .filter((c) => c !== 'All')
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-[#141414] text-[#FAFAFA]">
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="field-format"
                className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
              >
                Format *
              </label>
              <select
                id="field-format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base focus:outline-none focus:border-[#FAFAFA]"
                disabled={submissionState.status === 'submitting'}
              >
                {loopsConfig.formats
                  .filter((f) => f !== 'All')
                  .map((fmt) => (
                    <option key={fmt} value={fmt} className="bg-[#141414] text-[#FAFAFA]">
                      {fmt}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="field-priceType"
                className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
              >
                Pricing *
              </label>
              <select
                id="field-priceType"
                name="priceType"
                value={formData.priceType}
                onChange={handleChange}
                className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base focus:outline-none focus:border-[#FAFAFA]"
                disabled={submissionState.status === 'submitting'}
              >
                <option value="Free" className="bg-[#141414] text-[#FAFAFA]">
                  Free
                </option>
                <option value="Paid" className="bg-[#141414] text-[#FAFAFA]">
                  Paid
                </option>
              </select>
            </div>
          </div>

          {/* Registration URL */}
          <div className="space-y-2">
            <label
              htmlFor="field-registrationUrl"
              className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
            >
              Registration or RSVP URL *
            </label>
            <input
              id="field-registrationUrl"
              name="registrationUrl"
              type="url"
              required
              value={formData.registrationUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base placeholder-[#525252] focus:outline-none focus:border-[#FAFAFA]"
              disabled={submissionState.status === 'submitting'}
            />
          </div>

          {/* Submitter Email */}
          <div className="space-y-2">
            <label
              htmlFor="field-submitterEmail"
              className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
            >
              Submitter / Host Work Email *
            </label>
            <input
              id="field-submitterEmail"
              name="submitterEmail"
              type="email"
              required
              value={formData.submitterEmail}
              onChange={handleChange}
              placeholder="convener@organisation.org"
              className="w-full min-h-[48px] px-4 py-3 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base placeholder-[#525252] focus:outline-none focus:border-[#FAFAFA]"
              disabled={submissionState.status === 'submitting'}
            />
            <p className="text-xs text-[#737373] font-mono">
              Used solely for verification queries. Never displayed publicly.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="field-description"
              className="block text-xs font-mono uppercase tracking-[0.16em] text-[#A3A3A3]"
            >
              Convening Description & Agenda *
            </label>
            <textarea
              id="field-description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline the thematic research, target attendees, and key agenda items..."
              className="w-full p-4 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-base placeholder-[#525252] focus:outline-none focus:border-[#FAFAFA]"
              disabled={submissionState.status === 'submitting'}
            />
          </div>

          {/* Action button */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={submissionState.status === 'submitting'}
              className="min-h-[52px] px-8 py-3.5 bg-[#FAFAFA] text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.18em] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submissionState.status === 'submitting'
                ? 'Transmitting Record...'
                : 'Deposit Convening Into Registry'}
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="min-h-[52px] px-6 py-3.5 border border-[#404040] text-xs font-semibold uppercase tracking-[0.14em] text-[#FAFAFA] hover:bg-[#141414]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
