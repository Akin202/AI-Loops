import React, { useState } from 'react';
import type {
  ConfidenceLevel,
  Event,
  EventCategory,
  EventCity,
  EventFormat,
  EventPriceType,
  ExtractedEventData,
  Organisation,
} from '../../../types';
import { loopsConfig } from '../../../config/loops.config';
import { EventRow } from '../EventRow';

interface ReviewCardProps {
  data: ExtractedEventData;
  onChange: (updated: ExtractedEventData) => void;
  onApprove: (data: ExtractedEventData) => void;
  onSaveDraft: (data: ExtractedEventData) => void;
  onReject: (reason: string) => void;
  isPartial?: boolean;
  missingFieldsCount?: number;
  organisations: Organisation[];
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  data,
  onChange,
  onApprove,
  onSaveDraft,
  onReject,
  isPartial = false,
  missingFieldsCount = 0,
  organisations,
}) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const updateField = <K extends keyof ExtractedEventData>(
    field: K,
    value: ExtractedEventData[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Helper for confidence dots
  const renderConfidenceDot = (fieldKey: string) => {
    const conf: ConfidenceLevel = data.confidences?.[fieldKey] || (data[fieldKey as keyof ExtractedEventData] ? 'green' : 'grey');
    const colorClasses = {
      green: 'bg-emerald-500 ring-emerald-100',
      amber: 'bg-amber-500 ring-amber-100',
      grey: 'bg-stone-300 ring-stone-100',
    }[conf];

    const label = {
      green: 'High confidence extraction',
      amber: 'Inferred / verify manually',
      grey: 'Missing / manual input required',
    }[conf];

    return (
      <span
        title={label}
        aria-label={label}
        className={`w-2 h-2 rounded-full inline-block ring-2 ${colorClasses} flex-shrink-0`}
      />
    );
  };

  // Construct synthetic Event object for the public live preview
  const livePreviewEvent: Event = {
    id: 'preview-id',
    slug: (data.title || 'untitled-event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    title: data.title || 'Untitled Convening',
    description: data.description || 'No description provided.',
    startDate: data.startDate || '2026-10-15T09:00:00Z',
    endDate: data.endDate,
    city: data.city || 'Lagos',
    venue: data.venue || 'Venue TBD',
    organiser: data.organiser || 'Organiser TBD',
    category: data.category || 'Meetup',
    format: data.format || 'In-Person',
    priceType: data.priceType || 'Free',
    price: data.price,
    registrationUrl: data.registrationUrl || 'https://',
    featured: false,
  };

  // Check if a field is deemed missing for partial styling
  const isMissing = (val?: string) => !val || val.trim() === '';

  const handleApprove = () => {
    // TODO(handoff): replace with real approve & publish action
    onApprove(data);
  };

  const handleSaveDraft = () => {
    // TODO(handoff): replace with real draft save action
    onSaveDraft(data);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    // TODO(handoff): replace with real rejection action
    onReject(rejectReason.trim());
    setRejecting(false);
    setRejectReason('');
  };

  return (
    <section aria-labelledby="review-card-heading" className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg overflow-hidden shadow-xs">
      {/* Card Header & Status Notice */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#FAFAF9] border-b border-[#E7E5E4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 id="review-card-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917]">
            Review Extracted Event
          </h2>
          {isPartial ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              {missingFieldsCount > 0 ? `${missingFieldsCount} fields need your input` : 'Fields need your input'}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Ready for verification
            </span>
          )}
        </div>

        {/* Legend for Confidence Dots */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#78716C]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Inferred
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block" /> Manual
          </span>
        </div>
      </div>

      {/* Main Two-Column Grid: Form Left, Real Public Preview Right */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Editable Fields in exact requested order */}
        <div className="space-y-4">
          {/* 1. Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="field-title" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                {renderConfidenceDot('title')}
                Title <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="field-title"
              type="text"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Lagos AI Builders Hackathon 2026"
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px] ${
                isPartial && isMissing(data.title)
                  ? 'border-amber-400 bg-amber-50/60'
                  : 'border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917]'
              }`}
            />
          </div>

          {/* 2 & 3. Starts At & Ends At */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-starts-at" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('startDate')}
                  Starts at <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                id="field-starts-at"
                type="text"
                value={data.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                placeholder="2026-10-15T09:00:00Z"
                className={`w-full text-xs font-mono px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px] ${
                  isPartial && isMissing(data.startDate)
                    ? 'border-amber-400 bg-amber-50/60'
                    : 'border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917]'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-ends-at" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('endDate')}
                  Ends at (optional)
                </label>
              </div>
              <input
                id="field-ends-at"
                type="text"
                value={data.endDate || ''}
                onChange={(e) => updateField('endDate', e.target.value)}
                placeholder="2026-10-15T18:00:00Z"
                className="w-full text-xs font-mono px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
              />
            </div>
          </div>

          {/* 4 & 5. City & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-city" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('city')}
                  City <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                id="field-city"
                value={data.city}
                onChange={(e) => updateField('city', e.target.value as EventCity)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
              >
                {loopsConfig.cities
                  .filter((c) => c !== 'All')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-venue" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('venue')}
                  Venue <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                id="field-venue"
                type="text"
                value={data.venue}
                onChange={(e) => updateField('venue', e.target.value)}
                placeholder="e.g. Zone Tech Park, Gbagada"
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px] ${
                  isPartial && isMissing(data.venue)
                    ? 'border-amber-400 bg-amber-50/60'
                    : 'border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917]'
                }`}
              />
            </div>
          </div>

          {/* 6. Organiser Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="field-organiser" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                {renderConfidenceDot('organiser')}
                Organiser Name <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="field-organiser"
              type="text"
              value={data.organiser}
              onChange={(e) => updateField('organiser', e.target.value)}
              placeholder="e.g., Data Science Nigeria"
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px] ${
                isPartial && isMissing(data.organiser)
                  ? 'border-amber-400 bg-amber-50/60'
                  : 'border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917]'
              }`}
            />
          </div>

          {/* 7 & 8. Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-category" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('category')}
                  Category <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                id="field-category"
                value={data.category}
                onChange={(e) => updateField('category', e.target.value as EventCategory)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
              >
                {loopsConfig.categories
                  .filter((c) => c !== 'All')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-format" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('format')}
                  Format <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                id="field-format"
                value={data.format}
                onChange={(e) => updateField('format', e.target.value as EventFormat)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
              >
                {loopsConfig.formats
                  .filter((f) => f !== 'All')
                  .map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* 9. Price Type & Price Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="field-price-type" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  {renderConfidenceDot('priceType')}
                  Price Type
                </label>
              </div>
              <select
                id="field-price-type"
                value={data.priceType}
                onChange={(e) => updateField('priceType', e.target.value as EventPriceType)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {data.priceType === 'Paid' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="field-price-amount" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                    Price Amount / Currency
                  </label>
                </div>
                <input
                  id="field-price-amount"
                  type="text"
                  value={data.price || ''}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="e.g. ₦15,000 / $20"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
                />
              </div>
            )}
          </div>

          {/* 10. Registration URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="field-reg-url" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                {renderConfidenceDot('registrationUrl')}
                Registration URL <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="field-reg-url"
              type="url"
              value={data.registrationUrl}
              onChange={(e) => updateField('registrationUrl', e.target.value)}
              placeholder="https://lu.ma/example-event"
              className={`w-full text-xs font-mono px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px] ${
                isPartial && isMissing(data.registrationUrl)
                  ? 'border-amber-400 bg-amber-50/60'
                  : 'border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917]'
              }`}
            />
          </div>

          {/* 11. Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="field-description" className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                {renderConfidenceDot('description')}
                Description
              </label>
            </div>
            <textarea
              id="field-description"
              rows={3}
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Detailed convening summary and agenda notes..."
              className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            />
          </div>

          {/* 12. Link to Organisation (Non-extracted Combobox) */}
          <div className="pt-2 border-t border-[#E7E5E4]">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="field-link-org" className="text-xs font-semibold text-[#1C1917]">
                Link to organisation <span className="font-normal text-[#78716C]">(optional)</span>
              </label>
            </div>
            <select
              id="field-link-org"
              value={data.organisationId || ''}
              onChange={(e) => updateField('organisationId', e.target.value || undefined)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] min-h-[44px]"
            >
              <option value="">None (Unassigned)</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.sector})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#78716C]">
              Track the organiser as a lead.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Real Public EventRow Preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#78716C]">
              Public Portal Preview (Live)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
              Real Component
            </span>
          </div>

          {/* Dark Frame representing the exact public AI Loops context */}
          <div className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-md p-4 sm:p-5 flex flex-col justify-between text-[#FAFAFA]">
            <div>
              <div className="text-[10px] font-mono text-[#737373] uppercase tracking-widest pb-3 border-b border-[#262626] mb-2 flex items-center justify-between">
                <span>[INDEX ROW RENDERING]</span>
                <span className="tabular-nums">OCT 2026</span>
              </div>

              {/* Directly rendering the public EventRow */}
              <EventRow
                event={livePreviewEvent}
                isInteractive={false}
              />
            </div>

            <div className="mt-6 pt-3 border-t border-[#262626] text-[11px] font-mono text-[#737373] flex items-center justify-between">
              <span>DESTINATION: {data.city.toUpperCase()}</span>
              <span>FORMAT: {data.format.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection reason drawer/bar if open */}
      {rejecting && (
        <div className="px-4 sm:px-6 py-3 bg-red-50 border-t border-red-200 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-red-900">
            Reason for rejection:
          </span>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Duplicate event, incomplete details, spam..."
            className="flex-1 text-xs px-3 py-1.5 rounded border border-red-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-red-600 min-h-[36px]"
          />
          <button
            type="button"
            onClick={handleConfirmReject}
            disabled={!rejectReason.trim()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded min-h-[36px]"
          >
            Confirm Reject
          </button>
          <button
            type="button"
            onClick={() => {
              setRejecting(false);
              setRejectReason('');
            }}
            className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 min-h-[36px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="px-4 sm:px-6 py-4 bg-[#FAFAF9] border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Reject */}
          <button
            type="button"
            onClick={() => setRejecting(!rejecting)}
            className="px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 rounded transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Reject…
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Save as draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 text-xs font-medium text-[#1C1917] bg-[#FFFFFF] hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            Save as draft
          </button>

          {/* Approve & publish (Primary) */}
          <button
            type="button"
            onClick={handleApprove}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded transition-colors min-h-[44px] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-1"
          >
            <span>Approve & publish</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.5 rounded bg-blue-900/60 border border-blue-400/40 text-blue-100">
              ⌘S
            </kbd>
          </button>
        </div>
      </div>
    </section>
  );
};
