import React from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

export default function SectionHeader({ title, subtitle, onPrev, onNext, action }) {
    return (
        <div className="flex items-end justify-between gap-4 mb-4">
            <div className="min-w-0">
                <h2 className="gh-section-title !mb-0">{title}</h2>
                {subtitle && <p className="text-[13px] sm:text-sm text-[#6b7080] mt-1 line-clamp-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {action}
                {onPrev && (
                    <button onClick={onPrev} className="gh-icon-btn !hidden md:!inline-flex !w-9 !h-9" aria-label={`Previous ${title}`}>
                        <BsChevronLeft className="w-4 h-4" />
                    </button>
                )}
                {onNext && (
                    <button onClick={onNext} className="gh-icon-btn !hidden md:!inline-flex !w-9 !h-9" aria-label={`Next ${title}`}>
                        <BsChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function SectionLoader({ title, height = 'h-[260px]' }) {
    return (
        <div>
            {title && <h2 className="gh-section-title !mb-4">{title}</h2>}
            <div className={`${height} rounded-xl bg-[#111319] border border-white/[0.05] animate-pulse`} />
        </div>
    );
}
