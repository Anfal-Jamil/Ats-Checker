import { useState } from "react";
import { Check, X, ScanLine, FileText, Briefcase, AlertCircle } from "lucide-react";

export default function ATSResumeChecker() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const canScan = resume.trim().length > 20 && jobDesc.trim().length > 20 && !scanning;

  async function runScan() {
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("https://ats-checker-production-7bde.up.railway.app/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDesc }),
      });
      if (!response.ok) throw new Error("Server error");
      const parsed = await response.json();
      setResult(parsed);
    } catch (e) {
      setError("Scan failed. Make sure the backend server is running, then try again.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div style={{ background: "#EEF0F2", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="p-6 md:p-10">
      <style>{`
        @keyframes sweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes stamp {
          0% { transform: scale(1.4) rotate(-6deg); opacity: 0; }
          60% { transform: scale(0.95) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1) rotate(-2deg); opacity: 1; }
        }
        .perforated {
          background-image: radial-gradient(circle, #EEF0F2 3px, transparent 3.5px);
          background-size: 16px 16px;
          background-position: -8px 0;
        }
        .scan-mono { font-family: 'IBM Plex Mono', monospace; }
        .display-font { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ScanLine size={20} color="#3B5FE0" />
            <span className="scan-mono text-xs tracking-widest uppercase" style={{ color: "#3B5FE0" }}>
              ATS Scan Terminal
            </span>
          </div>
          <h1 className="display-font text-3xl md:text-4xl font-bold" style={{ color: "#12151C" }}>
            Will your resume clear the gate?
          </h1>
          <p className="text-sm mt-2" style={{ color: "#5A6070" }}>
            Paste your resume and the job description. The scanner checks what an ATS bot actually looks for before a human ever sees it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border" style={{ borderColor: "#DADFE5" }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} color="#12151C" />
              <span className="scan-mono text-xs uppercase tracking-wide" style={{ color: "#5A6070" }}>Resume</span>
            </div>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-56 text-sm p-3 rounded-md outline-none resize-none"
              style={{ background: "#F7F8F9", border: "1px solid #DADFE5", color: "#12151C" }}
            />
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border" style={{ borderColor: "#DADFE5" }}>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} color="#12151C" />
              <span className="scan-mono text-xs uppercase tracking-wide" style={{ color: "#5A6070" }}>Job Description</span>
            </div>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-56 text-sm p-3 rounded-md outline-none resize-none"
              style={{ background: "#F7F8F9", border: "1px solid #DADFE5", color: "#12151C" }}
            />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={runScan}
            disabled={!canScan}
            className="scan-mono px-8 py-3 rounded-md text-sm uppercase tracking-widest font-semibold transition"
            style={{
              background: canScan ? "#3B5FE0" : "#C7CCD3",
              color: "#FFFFFF",
              cursor: canScan ? "pointer" : "not-allowed",
            }}
          >
            {scanning ? "Scanning..." : "Run Scan"}
          </button>
        </div>

        {scanning && (
          <div className="relative overflow-hidden mt-8 rounded-lg h-2" style={{ background: "#DADFE5" }}>
            <div
              className="absolute left-0 top-0 h-full w-1/3"
              style={{ background: "#3B5FE0", animation: "sweep 1.1s linear infinite" }}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 flex items-center gap-2 text-sm p-4 rounded-md" style={{ background: "#FBEAE8", color: "#B23A2C" }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-10 flex justify-center">
            <div className="perforated p-1 rounded-xl" style={{ background: "#DADFE5" }}>
              <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-md" style={{ border: "1px solid #DADFE5" }}>
                <div className="text-center mb-6">
                  <div className="scan-mono text-xs uppercase tracking-widest mb-1" style={{ color: "#5A6070" }}>
                    Scan Result
                  </div>
                  <div
                    className="display-font font-bold"
                    style={{
                      fontSize: "64px",
                      color:
                        result.score >= 75 ? "#2F9E6E" : result.score >= 50 ? "#E8A33D" : "#D6493A",
                      animation: "stamp 0.4s ease-out",
                      lineHeight: 1,
                    }}
                  >
                    {result.score}
                  </div>
                  <div
                    className="scan-mono text-xs uppercase tracking-widest mt-1 inline-block px-3 py-1 rounded-full"
                    style={{
                      background:
                        result.score >= 75 ? "#E4F5EC" : result.score >= 50 ? "#FCF1DF" : "#FBEAE8",
                      color:
                        result.score >= 75 ? "#2F9E6E" : result.score >= 50 ? "#B4791F" : "#B23A2C",
                    }}
                  >
                    {result.verdict}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="scan-mono text-xs uppercase tracking-wide mb-2" style={{ color: "#5A6070" }}>
                    Matched Keywords
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords?.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: "#E4F5EC", color: "#237A54" }}>
                        <Check size={12} /> {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="scan-mono text-xs uppercase tracking-wide mb-2" style={{ color: "#5A6070" }}>
                    Missing Keywords
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords?.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: "#FBEAE8", color: "#B23A2C" }}>
                        <X size={12} /> {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4" style={{ borderTop: "1px dashed #DADFE5" }}>
                  <div className="scan-mono text-xs uppercase tracking-wide mb-2" style={{ color: "#5A6070" }}>
                    Fix These Next
                  </div>
                  <ul className="text-sm space-y-2" style={{ color: "#12151C" }}>
                    {result.feedback?.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span style={{ color: "#3B5FE0" }}>—</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}