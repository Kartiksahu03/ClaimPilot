import { useState } from "react";
import axios from "axios";
import {
  ArrowUpRight,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Send,
  CheckCircle2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialForm = {
  claimant_name: "",
  email: "",
  phone: "",
  user_type: "Patient",
  claim_category: "Hospitalization",
  policy_number: "",
  claim_amount: "",
  description: ""
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successClaim, setSuccessClaim] = useState(null);
  const [apiError, setApiError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setApiError("");
    setSuccessClaim(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setApiError("");
    setSuccessClaim(null);

    const payload = {
      ...form,
      claim_amount: form.claim_amount === "" ? null : Number(form.claim_amount)
    };

    try {
      const response = await axios.post(`${API_URL}/claims`, payload);
      setSuccessClaim(response.data.claim);
      setForm(initialForm);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setApiError(
          error.response?.data?.message ||
            "Could not submit your claim. Check that the ClaimPilot backend is running and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-sage-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-sage-500 focus:ring-2 focus:ring-sage-100";
  const labelClass = "block text-sm font-medium text-slate-700";

  function fieldError(name) {
    return errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    ) : null;
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-8 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-700 text-white shadow-soft">
              <FileCheck2 size={22} />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">ClaimPilot</span>
              <span className="block text-xs text-slate-500">Claims review workspace</span>
            </span>
          </a>
          <span className="hidden items-center gap-2 rounded-full border border-sage-200 bg-white/80 px-4 py-2 text-sm text-sage-800 sm:flex">
            <ShieldCheck size={16} />
            Human-reviewed decisions
          </span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-800">
              <Sparkles size={16} />
              Thoughtful document review, made simpler
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              A clearer way to review
              <span className="text-sage-700"> medical claims.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Organize claim documents, extract important details with AI assistance,
              and help reviewers spot information that may need attention.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#submit-claim"
                className="inline-flex items-center gap-2 rounded-full bg-sage-700 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-sage-800"
              >
                Submit a claim
                <ArrowUpRight size={17} />
              </a>
              <span className="inline-flex items-center rounded-full border border-sage-200 bg-white px-6 py-3.5 text-sm font-medium text-sage-800">
                Built for human review
              </span>
            </div>
            <p className="mt-5 text-xs leading-6 text-slate-500">
              Demonstration project. AI-generated information is subject to human verification
              and is not an insurance approval or medical decision.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-sage-100/70 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white bg-white p-6 shadow-soft sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Review overview</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your workspace</h2>
                </div>
                <span className="rounded-2xl bg-sage-50 p-3 text-sage-700">
                  <FileCheck2 size={22} />
                </span>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-cream p-5">
                  <p className="text-sm text-slate-500">Ready to review</p>
                  <p className="mt-2 text-3xl font-semibold">—</p>
                </div>
                <div className="rounded-2xl bg-cream p-5">
                  <p className="text-sm text-slate-500">Need attention</p>
                  <p className="mt-2 text-3xl font-semibold">—</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-sage-100 p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-sage-100 p-2.5 text-sage-700">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <p className="font-medium">AI-assisted document checks</p>
                    <p className="mt-1 text-sm text-slate-500">Extraction and summaries, reviewed by a person.</p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-sage-50">
                  <div className="h-full w-2/3 rounded-full bg-sage-500" />
                </div>
                <p className="mt-2 text-xs text-slate-500">Workspace preview · Sample metrics will appear after setup</p>
              </div>
            </div>
          </div>
        </section>

        <section id="submit-claim" className="scroll-mt-8 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-800">
                <FileCheck2 size={16} /> Claim intake
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Submit a medical claim</h2>
              <p className="mt-3 leading-7 text-slate-600">
                Enter the claimant and claim details below. A reviewer can verify the information after submission.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-sage-100 bg-white p-5 shadow-soft sm:p-8">
              {successClaim && (
                <div role="status" className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 size={18} /> Claim submitted successfully
                  </div>
                  <p className="mt-2">Reference ID: <span className="break-all font-mono">{successClaim.id}</span></p>
                  <p className="mt-1">Current status: {successClaim.status}</p>
                </div>
              )}

              {apiError && (
                <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {apiError}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Claimant full name *
                  <input className={inputClass} name="claimant_name" value={form.claimant_name} onChange={handleChange} placeholder="Enter full name" required maxLength={150} />
                  {fieldError("claimant_name")}
                </label>
                <label className={labelClass}>
                  Email address *
                  <input className={inputClass} type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
                  {fieldError("email")}
                </label>
                <label className={labelClass}>
                  Phone number *
                  <input className={inputClass} type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" required maxLength={25} />
                  {fieldError("phone")}
                </label>
                <label className={labelClass}>
                  Submitted by *
                  <select className={inputClass} name="user_type" value={form.user_type} onChange={handleChange} required>
                    <option>Patient</option>
                    <option>Caregiver</option>
                    <option>Hospital Representative</option>
                  </select>
                  {fieldError("user_type")}
                </label>
                <label className={labelClass}>
                  Claim category *
                  <select className={inputClass} name="claim_category" value={form.claim_category} onChange={handleChange} required>
                    <option>Hospitalization</option>
                    <option>Daycare</option>
                    <option>Pre/Post Hospitalization</option>
                    <option>Other</option>
                  </select>
                  {fieldError("claim_category")}
                </label>
                <label className={labelClass}>
                  Policy number
                  <input className={inputClass} name="policy_number" value={form.policy_number} onChange={handleChange} placeholder="Optional policy number" maxLength={100} />
                  {fieldError("policy_number")}
                </label>
                <label className={labelClass}>
                  Claim amount (₹)
                  <input className={inputClass} type="number" name="claim_amount" value={form.claim_amount} onChange={handleChange} placeholder="e.g. 45000" min="0.01" step="0.01" />
                  {fieldError("claim_amount")}
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Claim description *
                  <textarea className={`${inputClass} min-h-32 resize-y`} name="description" value={form.description} onChange={handleChange} placeholder="Briefly describe the claim and relevant details..." required maxLength={5000} />
                  {fieldError("description")}
                </label>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-sage-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-5 text-slate-500">
                  Please use test data for this demonstration. Claim submission does not imply approval.
                </p>
                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit claim"}
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-sage-100 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ClaimPilot</span>
          <span>Organized reviews. Clearer next steps.</span>
        </footer>
      </div>
    </main>
  );
}

export default App;
