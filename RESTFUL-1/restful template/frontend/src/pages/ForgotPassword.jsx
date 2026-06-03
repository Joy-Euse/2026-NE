import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import AuthLayout from "../layouts/AuthLayout";
import Alert from "../components/Alert";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { apiError } from "../services/api";
import { forgotPassword } from "../services/authApi";
import { isEmail } from "../utils/validators";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");
  const [etherealLink, setEtherealLink] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevLink("");
    setEtherealLink("");
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message || "Password reset email sent.");
      setDevLink(response.data?.resetLink || "");
      setEtherealLink(response.data?.emailPreviewUrl || "");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-secondary">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email and we will send a reset link.</p>
        <div className="mt-4 space-y-2">
          <Alert type="error">{error}</Alert>
          <Alert type="success">{message}</Alert>
          <Alert type="info">{devLink && <Link className="font-medium text-primary" to={new URL(devLink).pathname + new URL(devLink).search}>Open development reset link</Link>}</Alert>
          <Alert type="info">{etherealLink && <a className="font-medium text-primary" href={etherealLink} target="_blank" rel="noopener noreferrer">View email in Ethereal inbox ↗</a>}</Alert>
        </div>
        <div className="mt-4">
          <FormField label="Email"><input type="email" className="w-full rounded-md border border-slate-300 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        </div>
        <Button disabled={loading} className="mt-5 w-full bg-primary text-white hover:bg-primary/90"><FiMail /> {loading ? "Sending..." : "Send reset link"}</Button>
        <p className="mt-4 text-center text-sm text-slate-600"><Link className="font-medium text-primary" to="/login">Back to sign in</Link></p>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
