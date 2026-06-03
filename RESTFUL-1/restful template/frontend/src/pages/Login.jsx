import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/Button";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import { login } from "../redux/authSlice";
import { isEmail, required } from "../utils/validators";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email.";
    if (!required(form.password)) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await dispatch(login(form));
    if (result.meta.requestStatus === "fulfilled") navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-secondary">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Access the fire safety management system.</p>
        <div className="mt-4"><Alert type="error">{error}</Alert></div>
        <div className="mt-4 space-y-4">
          <FormField label="Email" error={errors.email}>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label="Password" error={errors.password}>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
        </div>
        <Button disabled={loading} className="mt-5 w-full bg-primary text-white hover:bg-primary/90">
          <FiLogIn /> {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Need an account? <Link className="font-medium text-primary" to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
