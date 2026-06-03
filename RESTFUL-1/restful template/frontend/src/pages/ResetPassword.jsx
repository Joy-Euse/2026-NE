import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import AuthLayout from "../layouts/AuthLayout";
import Alert from "../components/Alert";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { apiError } from "../services/api";
import { resetPassword } from "../services/authApi";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ resetToken: searchParams.get("token") || "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.resetToken || form.newPassword.length < 8) {
      setError("Reset token is required and password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ resetToken: form.resetToken, newPassword: form.newPassword });
      setMessage("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-secondary">Create new password</h1>
        <p className="mt-1 text-sm text-slate-500">Use the reset link from your email to continue.</p>
        <div className="mt-4 space-y-2">
          <Alert type="error">{error}</Alert>
          <Alert type="success">{message}</Alert>
        </div>
        <div className="mt-4 space-y-4">
          <FormField label="Reset token"><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.resetToken} onChange={(e) => setForm({ ...form, resetToken: e.target.value })} /></FormField>
          <FormField label="New password"><input type="password" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></FormField>
          <FormField label="Confirm password"><input type="password" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></FormField>
        </div>
        <Button disabled={loading} className="mt-5 w-full bg-primary text-white hover:bg-primary/90"><FiLock /> {loading ? "Resetting..." : "Reset password"}</Button>
        <p className="mt-4 text-center text-sm text-slate-600"><Link className="font-medium text-primary" to="/login">Back to sign in</Link></p>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
