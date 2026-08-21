import type { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
