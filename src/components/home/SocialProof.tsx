import { Star } from "lucide-react";
import { socialProof } from "@/data/reviews";

export function SocialProof() {
  return (
    <section className="border-y border-stone-200 bg-white py-6 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="flex text-[#F4E3B2]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Оценено с {socialProof.rating}/5 от {socialProof.reviewCount.toLocaleString()}+ Жени
          </span>
        </div>
        <div className="flex items-center gap-8 grayscale opacity-50">
          {socialProof.publications.map((pub) => (
            <span
              key={pub}
              className="text-xl font-serif font-bold tracking-tighter"
            >
              {pub}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
