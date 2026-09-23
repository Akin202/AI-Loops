import React from 'react';
import { clsx } from 'clsx';

interface MetaStripProps {
  items: (string | undefined | null | false)[];
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  id?: string;
}

/**
 * The Signature AI Loops Element:
 * Uppercase, 11px, weight 600, letter-spacing 0.18em, separated by " · ".
 * Used across the hero, event cards, filters, and detail views as the primary design through-line.
 */
export const MetaStrip: React.FC<MetaStripProps> = ({
  items,
  className,
  itemClassName,
  separatorClassName,
  id,
}) => {
  const filteredItems = items.filter(Boolean) as string[];

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      id={id}
      className={clsx(
        'inline-flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A3A3A3] leading-normal select-none',
        className
      )}
    >
      {filteredItems.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          <span className={clsx('whitespace-nowrap', itemClassName)}>
            {item}
          </span>
          {index < filteredItems.length - 1 && (
            <span
              aria-hidden="true"
              className={clsx('text-[#525252] font-normal select-none', separatorClassName)}
            >
              ·
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
