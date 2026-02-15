"use client";

import { useState } from "react";
import { ChevronDown, List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
}

interface TableOfContentsMobileProps {
  headings: TOCItem[];
}

export function TableOfContentsMobile({ headings }: TableOfContentsMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length < 2) return null;

  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
      >
        <List className="w-4 h-4" />
        Съдържание
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <ul className="mt-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          {headings.map(({ id, text }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setIsOpen(false)}
                className="block text-sm text-stone-600 hover:text-[#2D4A3E] transition"
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
