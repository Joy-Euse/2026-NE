import Button from "./Button";

function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.max(Math.ceil((total || 0) / limit), 1);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-1 pt-3 text-sm">
      <span className="text-slate-500">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <Button className="border border-slate-300 bg-white text-slate-700" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button className="border border-slate-300 bg-white text-slate-700" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
