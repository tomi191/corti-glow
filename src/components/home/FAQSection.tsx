import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/faqs";

export function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-8 text-center text-[#2D4A3E]">
          Въпроси?
        </h2>

        <div className="space-y-4">
          {faqs.slice(0, 3).map((faq, index) => (
            <details
              key={index}
              className="group p-4 bg-stone-50 rounded-xl cursor-pointer"
            >
              <summary className="flex justify-between items-center font-medium text-stone-800">
                {faq.question}
                <span className="transform group-open:rotate-180 transition-transform text-[#B2D8C6]">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <p className="text-stone-500 text-sm mt-3 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
