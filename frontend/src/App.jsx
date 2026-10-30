import { ArrowUpRight, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";

function App() {
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

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
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
              <button className="inline-flex items-center gap-2 rounded-full bg-sage-700 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-sage-800">
                Explore workspace
                <ArrowUpRight size={17} />
              </button>
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

        <footer className="flex flex-col gap-2 border-t border-sage-100 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ClaimPilot</span>
          <span>Organized reviews. Clearer next steps.</span>
        </footer>
      </div>
    </main>
  );
}

export default App;
