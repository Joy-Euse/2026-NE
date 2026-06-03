import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiKey, FiMail } from "react-icons/fi";
import AuthLayout from "../layouts/AuthLayout";
import Alert from "../components/Alert";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { apiError } from "../services/api";
import { forgotPassword, resetPassword, verifyResetCode } from "../services/authApi";
import { isEmail } from "../utils/validators";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(form.email);
      setMessage(response.message || "If this email has an account, a reset code was sent.");
      setStep("code");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{5}$/.test(form.code)) {
      setError("Enter the 5-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      await verifyResetCode({ email: form.email, code: form.code });
      setMessage("Code verified. Enter your new password.");
      setStep("password");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: form.email,
        code: form.code,
        newPassword: form.newPassword,
      });
      setMessage("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const title = {
    email: "Reset password",
    code: "Enter reset code",
    password: "Create new password",
  }[step];

  const description = {
    email: "Enter your account email and we will send a 5-digit reset code.",
    code: "Check your email and enter the 5-digit code.",
    password: "Enter and confirm your new password.",
  }[step];

  return (
    <AuthLayout>
      <form
        onSubmit={step === "email" ? requestCode : step === "code" ? verifyCode : savePassword}
        className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-secondary">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>

        <div className="mt-4 space-y-2">
          <Alert type="error">{error}</Alert>
          <Alert type="success">{message}</Alert>
        </div>

        <div className="mt-4 space-y-4">
          {step === "email" && (
            <FormField label="Email">
              <input
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </FormField>
          )}

          {step === "code" && (
            <FormField label="Verification code">
              <input
                inputMode="numeric"
                maxLength={5}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-2xl font-semibold tracking-[0.4em]"
                value={form.code}
                onChange={(e) => setField("code", e.target.value.replace(/\D/g, "").slice(0, 5))}
              />
            </FormField>
          )}

          {step === "password" && (
            <>
              <FormField label="New password">
                <input
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.newPassword}
                  onChange={(e) => setField("newPassword", e.target.value)}
                />
              </FormField>
              <FormField label="Confirm password">
                <input
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                />
              </FormField>
            </>
          )}
        </div>

        <Button disabled={loading} className="mt-5 w-full bg-primary text-white hover:bg-primary/90">
          {step === "email" && <FiMail />}
          {step === "code" && <FiCheck />}
          {step === "password" && <FiKey />}
          {loading
            ? "Please wait..."
            : step === "email"
              ? "Send code"
              : step === "code"
                ? "Verify code"
                : "Reset password"}
        </Button>

        {step !== "email" && (
          <Button
            type="button"
            className="mt-3 w-full border border-slate-300 bg-white"
            onClick={() => {
              setError("");
              setMessage("");
              setStep("email");
            }}
          >
            Use a different email
          </Button>
        )}

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link className="font-medium text-primary" to="/login">Back to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
