import { BookHeart } from "lucide-react";

export default function CortisolLogPage() {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-sage/30 flex items-center justify-center mb-4">
        <BookHeart className="w-8 h-8 text-brand-forest" />
      </div>
      <h1 className="text-xl font-bold text-brand-forest mb-2">
        Кортизол Дневник
      </h1>
      <p className="text-stone-500 max-w-xs">
        Скоро ще можеш да записваш ежедневно как се чувстваш и да следиш нивата си на стрес.
      </p>
      <span className="mt-4 inline-block px-4 py-1.5 rounded-full bg-brand-cream/50 text-amber-700 text-sm font-medium">
        Очаквай скоро
      </span>
    </div>
  );
}
