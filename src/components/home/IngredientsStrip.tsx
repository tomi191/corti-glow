import { ingredients } from "@/data/products";

export function IngredientsStrip() {
  return (
    <section className="py-16 bg-white border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-4 md:gap-12 text-sm font-medium text-stone-500 uppercase tracking-wider">
          {ingredients.slice(0, 5).map((ingredient) => (
            <span key={ingredient.name} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ingredient.color }}
              />
              {ingredient.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
