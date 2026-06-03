import React from "react";

function Card({ children, title, action }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-secondary">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default Card;
