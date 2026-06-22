import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-bold text-slate-500 sm:text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight aria-hidden="true" size={14} className="shrink-0 text-slate-300" /> : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-8 max-w-[9rem] items-center gap-1 truncate rounded-md px-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700 sm:max-w-none"
                >
                  {index === 0 ? <Home aria-hidden="true" size={14} className="shrink-0" /> : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className="inline-flex min-h-8 max-w-[10rem] items-center truncate rounded-md px-1.5 text-slate-950 sm:max-w-none"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
