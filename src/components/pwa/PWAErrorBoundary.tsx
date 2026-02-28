"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("PWA Error Boundary caught:", error);
    // Try to clear potentially corrupted localStorage
    try {
      localStorage.removeItem("lura-pwa");
    } catch {
      // localStorage may be unavailable
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-brand-forest">
              Нещо се обърка
            </h2>
            <p className="text-sm text-stone-500">
              Опитай да презаредиш страницата. Ако проблемът продължи, данните ти ще бъдат нулирани.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 rounded-2xl bg-brand-forest text-white font-semibold text-base shadow-lg active:scale-[0.98] transition-transform"
            >
              Презареди
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
