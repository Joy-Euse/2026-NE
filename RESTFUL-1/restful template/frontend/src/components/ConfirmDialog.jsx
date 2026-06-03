import Button from "./Button";

function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/45 p-4">
      <div className="w-full max-w-md rounded-md bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" className="border border-slate-300 bg-white text-slate-700" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="bg-danger text-white hover:bg-danger/90" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
