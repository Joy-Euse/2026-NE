import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/Button";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import { signup } from "../redux/authSlice";
import { isEmail, passwordValid, required } from "../utils/validators";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!required(form.firstName)) nextErrors.firstName = "First name is required.";
    if (!required(form.lastName)) nextErrors.lastName = "Last name is required.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email.";
    if (!passwordValid(form.password)) nextErrors.password = "Use at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const result = await dispatch(signup(form));
    if (result.meta.requestStatus === "fulfilled") navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-secondary">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">New accounts start with USER access.</p>
        <div className="mt-4"><Alert type="error">{error}</Alert></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="First name" error={errors.firstName}><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></FormField>
          <FormField label="Last name" error={errors.lastName}><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></FormField>
          <div className="sm:col-span-2"><FormField label="Email" error={errors.email}><input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></FormField></div>
          <div className="sm:col-span-2"><FormField label="Password" error={errors.password}><input className="w-full rounded-md border border-slate-300 px-3 py-2" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} /></FormField></div>
        </div>
        <Button disabled={loading} className="mt-5 w-full bg-primary text-white hover:bg-primary/90">{loading ? "Creating..." : "Create account"}</Button>
        <p className="mt-4 text-center text-sm text-slate-600">Already registered? <Link className="font-medium text-primary" to="/login">Sign in</Link></p>
      </form>
    </AuthLayout>
  );
}

export default Register;
