import { Star } from "lucide-react";
import { reviews } from "@/data/reviews";

export function ReviewsSection() {
  return (
    <section className="py-20 bg-stone-50 border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-10 text-center text-[#2D4A3E]">
          Real Women. Real Glow.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100"
            >
              <div className="flex text-[#F4E3B2] mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm font-medium text-stone-800 mb-2">
                &ldquo;{review.title}&rdquo;
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">
                {review.content}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-stone-200" />
                <span className="text-xs text-stone-400">{review.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
