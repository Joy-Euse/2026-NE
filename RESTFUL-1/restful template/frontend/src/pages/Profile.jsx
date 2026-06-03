import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FiSave, FiShield } from "react-icons/fi";
import DashboardLayout from "../layouts/DashboardLayout";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import { apiError } from "../services/api";
import { changePassword } from "../services/authApi";
import { getOwnProfile, updateOwnProfile } from "../services/userApi";
import { setUser } from "../redux/authSlice";
import { required } from "../utils/validators";

function Profile() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getOwnProfile()
      .then((data) => setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role,
        status: data.status,
      }))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!required(profile.firstName) || !required(profile.lastName)) {
      setError("First name and last name are required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateOwnProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      dispatch(setUser(updated));
      setProfile((current) => ({ ...current, ...updated }));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!passwords.currentPassword || passwords.newPassword.length < 8) {
      setError("Current password is required and new password must be at least 8 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password changed successfully. Please sign in again on your next session.");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">My Profile</h1>
      <div className="mb-4 space-y-2">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{message}</Alert>
      </div>
      {loading ? <LoadingState /> : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Profile details">
            <form onSubmit={saveProfile} className="grid gap-3 md:grid-cols-2">
              <FormField label="First name"><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></FormField>
              <FormField label="Last name"><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></FormField>
              <FormField label="Email"><input type="email" readOnly className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" value={profile.email} /></FormField>
              <FormField label="Phone"><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></FormField>
              <div className="md:col-span-2">
                <Button disabled={saving} className="bg-primary text-white hover:bg-primary/90"><FiSave /> Save profile</Button>
              </div>
            </form>
          </Card>
          <Card title="Change password">
            <form onSubmit={savePassword} className="space-y-3">
              <FormField label="Current password"><input type="password" className="w-full rounded-md border border-slate-300 px-3 py-2" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></FormField>
              <FormField label="New password"><input type="password" className="w-full rounded-md border border-slate-300 px-3 py-2" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></FormField>
              <FormField label="Confirm new password"><input type="password" className="w-full rounded-md border border-slate-300 px-3 py-2" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} /></FormField>
              <Button disabled={saving} className="bg-secondary text-white hover:bg-secondary/90"><FiShield /> Change password</Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Profile;
