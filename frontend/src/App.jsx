import { useEffect, useState } from "react";
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [aiReview, setAiReview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimsError, setClaimsError] = useState("");
  const [claimSearch, setClaimSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDocuments, setClaimDocuments] = useState([]);
  const [documentVerificationError, setDocumentVerificationError] = useState("");
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [reviewWorkspace, setReviewWorkspace] = useState({ notes: [], activity: [], claim: null });
  const [reviewNote, setReviewNote] = useState("");
  const [reviewDisposition, setReviewDisposition] = useState("Pending");
  const [reviewError, setReviewError] = useState("");

  async function loadClaims() {
    setClaimsLoading(true);
    setClaimsError("");
    try {
      const response = await axios.get(`${API_URL}/claims`);
      const savedClaims = response.data.claims || [];
      setClaims(savedClaims);
      setSelectedClaim((current) => current
        ? (savedClaims.find((claim) => claim.id === current.id) || savedClaims[0] || null)
        : (savedClaims[0] || null));
    } catch (error) {
      setClaimsError(error.response?.data?.message || "Could not load saved claims. Check the backend and database.");
    } finally {
      setClaimsLoading(false);
    }
  }

  useEffect(() => { loadClaims(); }, []);

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
      const createdClaim = response.data.claim;
      setSuccessClaim(createdClaim);
      setSelectedClaim(createdClaim);
      setClaims((current) => [createdClaim, ...current.filter((claim) => claim.id !== createdClaim.id)]);
      setAiReview(null);
      setAiError("");
      setForm(initialForm);

      if (selectedFiles.length > 0) {
        const documentData = new FormData();
        selectedFiles.forEach((file) => documentData.append("documents", file));
        try {
          await axios.post(`${API_URL}/claims/${createdClaim.id}/documents`, documentData);
          setSelectedFiles([]);
        } catch (uploadRequestError) {
          setUploadError(
            uploadRequestError.response?.data?.message ||
              "Claim was created, but document upload failed. Please retry the upload."
          );
        }
      }
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


  async function loadReviewWorkspace(claimId) {
    if (!claimId) return;
    try { const response = await axios.get(`${API_URL}/claims/${claimId}/review-workspace`); setReviewWorkspace(response.data); setReviewDisposition(response.data.claim?.review_disposition || "Pending"); setReviewError(""); }
    catch (error) { setReviewError(error.response?.data?.message || "Could not load reviewer workspace."); }
  }
  async function changeReviewStatus(value) {
    if (!selectedClaim?.id) return;
    try { await axios.patch(`${API_URL}/claims/${selectedClaim.id}/review-status`, { review_status: value }); await loadReviewWorkspace(selectedClaim.id); await loadClaims(); }
    catch (error) { setReviewError(error.response?.data?.message || "Could not update review status."); }
  }
  async function saveReviewDisposition() {
    if (!selectedClaim?.id) return;
    try {
      await axios.patch(`${API_URL}/claims/${selectedClaim.id}/review-disposition`, { disposition: reviewDisposition });
      await loadReviewWorkspace(selectedClaim.id);
      await loadClaims();
    } catch (error) { setReviewError(error.response?.data?.message || "Could not record reviewer disposition."); }
  }
  async function submitReviewerNote(event) {
    event.preventDefault(); if (!selectedClaim?.id || !reviewNote.trim()) return;
    try { await axios.post(`${API_URL}/claims/${selectedClaim.id}/reviewer-notes`, { note: reviewNote }); setReviewNote(""); await loadReviewWorkspace(selectedClaim.id); }
    catch (error) { setReviewError(error.response?.data?.message || "Could not save reviewer note."); }
  }

  async function loadClaimDocuments(claimId) {
    if (!claimId) return;
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const response = await axios.get(`${API_URL}/claims/${claimId}/documents`);
      setClaimDocuments(response.data.documents || []);
    } catch (error) {
      setClaimDocuments([]);
      setDocumentsError(error.response?.data?.message || "Could not load documents for this claim.");
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function toggleDocumentVerification(doc) {
    if (!selectedClaim?.id) return;
    setDocumentVerificationError("");
    try {
      const response = await axios.patch(`${API_URL}/claims/${selectedClaim.id}/documents/${doc.id}/verification`, { verified: !doc.verified });
      setClaimDocuments((current) => current.map((item) => item.id === doc.id ? { ...item, verified: response.data.document.verified } : item));
    } catch (error) {
      setDocumentVerificationError(error.response?.data?.message || "Could not update document verification.");
    }
  }

  async function handleAiReview() {
    const claimToReview = selectedClaim || successClaim;
    if (!claimToReview?.id) return;
    setAiLoading(true);
    setAiError("");
    setAiReview(null);
    try {
      const response = await axios.post(`${API_URL}/claims/${claimToReview.id}/ai-review`);
      setAiReview(response.data.review);
    } catch (error) {
      setAiError(error.response?.data?.message || "AI review failed. Check the uploaded PDF and Groq configuration.");
    } finally {
      setAiLoading(false);
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


        <section id="saved-claims" className="scroll-mt-8 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div><span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-800"><FileCheck2 size={16} /> Claims workspace</span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">Previously submitted claims</h2>
                <p className="mt-2 text-sm text-slate-600">Saved claims are restored here whenever you return or refresh.</p></div>
              <button type="button" onClick={loadClaims} disabled={claimsLoading} className="rounded-full border border-sage-200 bg-white px-5 py-2.5 text-sm font-semibold text-sage-800 disabled:opacity-60">{claimsLoading ? "Refreshing..." : "Refresh claims"}</button>
            </div>
            {claimsError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{claimsError}</p>}
            {!claimsLoading && claims.length > 0 && <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["Submitted", "In Review", "Review Completed"].map((status) => <div key={status} className="rounded-2xl border border-sage-100 bg-white p-4"><p className="text-xs text-slate-500">{status}</p><p className="mt-1 text-2xl font-semibold">{claims.filter((claim) => (claim.review_status || "Submitted") === status).length}</p></div>)}
              <div className="rounded-2xl border border-sage-100 bg-white p-4"><p className="text-xs text-slate-500">Total claims</p><p className="mt-1 text-2xl font-semibold">{claims.length}</p></div>
            </div>}
            {!claimsLoading && claims.length > 0 && <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <input aria-label="Search claims" className={inputClass} value={claimSearch} onChange={(e) => setClaimSearch(e.target.value)} placeholder="Search claimant or reference ID..." />
              <select aria-label="Filter by review status" className={inputClass} value={reviewStatusFilter} onChange={(e) => setReviewStatusFilter(e.target.value)}><option>All</option><option>Submitted</option><option>In Review</option><option>Review Completed</option></select>
              <select aria-label="Filter by claim category" className={inputClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option><option>Hospitalization</option><option>Daycare</option><option>Pre/Post Hospitalization</option><option>Other</option></select>
            </div>}
            {claimsLoading ? <div className="rounded-2xl border border-sage-100 bg-white p-6 text-sm text-slate-500">Loading saved claims...</div>
              : claims.length === 0 ? <div className="rounded-2xl border border-sage-100 bg-white p-6 text-sm text-slate-500">No submitted claims found yet. New submissions will appear here.</div>
              : <div className="space-y-3">{claims.filter((claim) => { const status = claim.review_status || "Submitted"; const search = claimSearch.trim().toLowerCase(); return (reviewStatusFilter === "All" || status === reviewStatusFilter) && (categoryFilter === "All" || claim.claim_category === categoryFilter) && (!search || claim.claimant_name.toLowerCase().includes(search) || claim.id.toLowerCase().includes(search)); }).map((claim) => <article key={claim.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${selectedClaim?.id === claim.id ? "border-sage-500 ring-2 ring-sage-100" : "border-sage-100"}`}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{claim.claimant_name}</h3><span className="rounded-full bg-sage-50 px-3 py-1 text-xs text-sage-800">{claim.review_status || "Submitted"}</span></div>
                    <p className="mt-1 text-sm text-slate-600">{claim.claim_category} · ₹{claim.claim_amount ?? "—"}</p><p className="mt-2 text-xs text-slate-500">Disposition: {claim.review_disposition || "Pending"}</p><p className="mt-2 break-all font-mono text-xs text-slate-500">Reference ID: {claim.id}</p></div>
                    <button type="button" onClick={() => { setSelectedClaim(claim); setSuccessClaim(claim); setAiReview(null); setAiError(""); loadClaimDocuments(claim.id); loadReviewWorkspace(claim.id); }} className="rounded-full bg-sage-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sage-800">{selectedClaim?.id === claim.id ? "Selected claim" : "Open claim"}</button></div>
                </article>)}</div>}{claims.length > 0 && !claims.some((claim) => { const status = claim.review_status || "Submitted"; const search = claimSearch.trim().toLowerCase(); return (reviewStatusFilter === "All" || status === reviewStatusFilter) && (categoryFilter === "All" || claim.claim_category === categoryFilter) && (!search || claim.claimant_name.toLowerCase().includes(search) || claim.id.toLowerCase().includes(search)); }) && <p className="rounded-xl border border-sage-100 bg-white p-5 text-sm text-slate-500">No claims match these search and filter options.</p>}
            {selectedClaim && <div className="mt-6 rounded-3xl border border-sage-100 bg-white p-5 shadow-soft sm:p-7">
              <section className="mb-6 border-b border-sage-100 pb-5"><h4 className="font-semibold">Reviewer workspace</h4><label className="mt-3 block text-sm">Reviewer disposition<select className={inputClass} value={reviewDisposition} onChange={(e) => setReviewDisposition(e.target.value)}><option>Pending</option><option>Reviewed - More Information Required</option><option>Reviewed - Ready for Insurer Decision</option></select></label><button type="button" onClick={saveReviewDisposition} className="mt-2 rounded-full border border-sage-300 px-4 py-2 text-sm font-semibold text-sage-800">Record disposition</button><p className="mt-2 text-xs text-slate-500">Workflow disposition only—not an approval or denial of coverage.</p><label className="mt-3 block text-sm">Review status<select className={inputClass} value={reviewWorkspace.claim?.review_status || selectedClaim.review_status || "Submitted"} onChange={(e) => changeReviewStatus(e.target.value)}><option>Submitted</option><option>In Review</option><option>Review Completed</option></select></label>{reviewError && <p className="mt-2 text-sm text-red-700">{reviewError}</p>}<form onSubmit={submitReviewerNote} className="mt-4"><label className="block text-sm font-medium">Reviewer comment<textarea className={`${inputClass} min-h-20`} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Add a reviewer note..." maxLength={3000}/></label><button className="mt-2 rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-white" type="submit">Save comment</button></form><div className="mt-4"><h5 className="text-sm font-semibold">Comments</h5>{(reviewWorkspace.notes || []).map((note) => <p key={note.id} className="mt-2 rounded-lg bg-cream p-3 text-sm">{note.note}<span className="mt-1 block text-xs text-slate-500">{note.reviewer_name} · {new Date(note.created_at).toLocaleString()}</span></p>)}</div><div className="mt-4"><h5 className="text-sm font-semibold">Activity timeline</h5>{(reviewWorkspace.activity || []).map((event) => <div key={event.id} className="mt-2 border-l-2 border-sage-300 pl-3 text-sm"><p className="font-medium">{String(event.action).replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{event.details?.description || ""} · {new Date(event.created_at).toLocaleString()}</p></div>)}</div></section>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm font-medium text-sage-700">Selected claim</p><h3 className="mt-1 text-xl font-semibold">{selectedClaim.claimant_name}</h3><p className="mt-1 break-all font-mono text-xs text-slate-500">{selectedClaim.id}</p></div>
                <button type="button" onClick={handleAiReview} disabled={aiLoading} className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-800 disabled:opacity-60"><Sparkles size={16} /> {aiLoading ? "Analyzing documents..." : "Run AI document review"}</button></div>

              <div className="mt-6 border-t border-sage-100 pt-5">
                <h4 className="font-semibold">Claim documents</h4>
                <p className="mt-1 text-sm text-slate-500">View the original files linked to this claim.</p>
                {documentsLoading ? <p className="mt-3 text-sm text-slate-500">Loading documents…</p>
                  : documentsError ? <p role="alert" className="mt-3 text-sm text-red-700">{documentsError}</p>
                  : claimDocuments.length === 0 ? <p className="mt-3 text-sm text-slate-500">No uploaded documents found for this claim.</p>
                  : <><p className="mt-3 text-xs text-slate-500">{claimDocuments.filter((doc) => doc.verified).length} of {claimDocuments.length} uploaded documents verified</p>{documentVerificationError && <p role="alert" className="mt-2 text-sm text-red-700">{documentVerificationError}</p>}<ul className="mt-3 space-y-2">{claimDocuments.map((doc) => <li key={doc.id} className="flex flex-col justify-between gap-3 rounded-xl border border-sage-100 p-3 sm:flex-row sm:items-center">
                    <div><p className="break-all text-sm font-medium">{doc.original_file_name}</p><p className="mt-1 text-xs text-slate-500">{doc.mime_type} · {Math.round((doc.file_size_bytes || 0) / 1024)} KB</p></div>
                    <a className="inline-flex w-fit rounded-full border border-sage-200 px-4 py-2 text-sm font-semibold text-sage-800 hover:bg-sage-50" href={`${API_URL}/claims/${selectedClaim.id}/documents/${doc.id}/view`} target="_blank" rel="noreferrer">Open document ↗</a>
                    <button type="button" onClick={() => toggleDocumentVerification(doc)} className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${doc.verified ? "border border-sage-200 bg-white text-sage-800" : "bg-sage-700 text-white"}`}>{doc.verified ? "Verified ✓ (undo)" : "Mark verified"}</button>
                  </li>)}</ul></>}
              </div>
              {aiError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{aiError}</p>}
              {aiReview && <div className="mt-6 space-y-4 border-t border-sage-100 pt-5 text-sm"><div><h4 className="font-semibold">AI summary</h4><p className="mt-1 leading-6">{aiReview.summary || "No summary returned."}</p></div>
                <div><h4 className="font-semibold">Extracted fields (verify manually)</h4><pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-cream p-4 text-xs">{JSON.stringify(aiReview.extractedFields || {}, null, 2)}</pre></div>
                <div><h4 className="font-semibold">Missing information</h4>{aiReview.missingInformation?.length ? <ul className="mt-1 list-inside list-disc">{aiReview.missingInformation.map((item,index)=><li key={index}>{item}</li>)}</ul> : <p className="mt-1 text-slate-600">No missing information flagged by AI.</p>}</div>
                <div><h4 className="font-semibold">Possible discrepancies</h4>{aiReview.possibleDiscrepancies?.length ? <ul className="mt-1 list-inside list-disc">{aiReview.possibleDiscrepancies.map((item,index)=><li key={index}>{item}</li>)}</ul> : <p className="mt-1 text-slate-600">No possible discrepancies flagged by AI.</p>}</div>
                <div><h4 className="font-semibold">Reviewer notes</h4>{aiReview.reviewerNotes?.length ? <ul className="mt-1 list-inside list-disc">{aiReview.reviewerNotes.map((item,index)=><li key={index}>{item}</li>)}</ul> : <p className="mt-1 text-slate-600">No additional notes.</p>}</div>
                {aiReview.reviewGuidance && <div className="rounded-2xl border border-sage-200 bg-sage-50 p-4"><h4 className="font-semibold">AI-assisted review guidance</h4><p className="mt-2"><span className="font-medium">Attention level:</span> {aiReview.reviewGuidance.priority || "routine"}</p><p className="mt-1"><span className="font-medium">Suggested workflow step:</span> {aiReview.reviewGuidance.suggestedNextStep || "manual_review"}</p><p className="mt-1 leading-6">{aiReview.reviewGuidance.rationale || "No rationale provided."}</p>{aiReview.reviewGuidance.evidence?.length > 0 && <ul className="mt-2 list-inside list-disc">{aiReview.reviewGuidance.evidence.map((item,index)=><li key={index}>{item}</li>)}</ul>}<p className="mt-3 text-xs text-slate-600">This is a workflow suggestion, not a coverage or claim decision. Verify all evidence and decide independently.</p></div>}
                <p className="text-xs text-slate-500">AI-generated assistance only. Human verification is required; this is not an approval or rejection decision.</p></div>}
            </div>}
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
                  <button type="button" onClick={handleAiReview} disabled={aiLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage-800 disabled:opacity-60">
                    <Sparkles size={16} /> {aiLoading ? "Analyzing documents..." : "Run AI document review"}
                  </button>
                  {aiError && <p role="alert" className="mt-3 text-sm text-red-700">{aiError}</p>}
                  {aiReview && (
                    <div className="mt-5 space-y-4 border-t border-green-200 pt-4 text-left">
                      <div><h3 className="font-semibold">AI summary</h3><p className="mt-1 leading-6">{aiReview.summary || "No summary returned."}</p></div>
                      <div><h3 className="font-semibold">Extracted fields (verify manually)</h3><pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white/80 p-3 text-xs">{JSON.stringify(aiReview.extractedFields || {}, null, 2)}</pre></div>
                      <div><h3 className="font-semibold">Missing information</h3>{aiReview.missingInformation?.length ? <ul className="mt-1 list-inside list-disc">{aiReview.missingInformation.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-1">No missing information flagged by AI.</p>}</div>
                      <div><h3 className="font-semibold">Possible discrepancies</h3>{aiReview.possibleDiscrepancies?.length ? <ul className="mt-1 list-inside list-disc">{aiReview.possibleDiscrepancies.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-1">No possible discrepancies flagged by AI.</p>}</div>
                      <div><h3 className="font-semibold">Reviewer notes</h3>{aiReview.reviewerNotes?.length ? <ul className="mt-1 list-inside list-disc">{aiReview.reviewerNotes.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-1">No additional notes.</p>}</div>
                      <p className="text-xs text-green-800">AI-generated assistance only. A human reviewer must verify all extracted information.</p>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {uploadError}
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
                <label className={`${labelClass} sm:col-span-2`}>
                  Supporting documents (optional)
                  <input
                    className={inputClass}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    multiple
                    onChange={(event) => {
                      setSelectedFiles(Array.from(event.target.files || []));
                      setUploadError("");
                    }}
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    PDF, JPG, or PNG. Up to 5 files, 10 MB each. For this demo, use synthetic/test documents only.
                  </p>
                  {selectedFiles.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
                      {selectedFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`}>{file.name}</li>
                      ))}
                    </ul>
                  )}
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
