"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee, Percent, Clock, Building2, Tag,
  ArrowRight, ChevronDown, CheckCircle, Shield, Zap, Star, TrendingUp, GraduationCap,
} from "lucide-react";
import { isAuthenticated, getWithAuth, BASE_URL } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router   = useRouter();
  const loggedIn = isAuthenticated();
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filter,       setFilter]       = useState("All");

  // ── YOUR ORIGINAL FETCH LOGIC — UNTOUCHED ──────────────────────────────────
  useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (loggedIn) {
          data = await getWithAuth("loan-products/");
        } else {
          const response = await fetch(`${BASE_URL}loan-products/`);
          if (!response.ok) throw new Error("Failed to fetch loan products");
          data = await response.json();
        }
        setLoanProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching loan products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanProducts();
  }, [loggedIn]);

  const filterOptions = ["All", "Personal Loan", "Business Loan", "Home Loan", "Education Loan"];
  const filtered = filter === "All"
    ? loanProducts
    : loanProducts.filter(l => l.loan_type === filter || l.name?.includes(filter));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #eef2ff;
          --bg2:      #e0e7ff;
          --surface:  #ffffff;
          --navy:     #1e3a8a;
          --navym:    #2563eb;
          --navyl:    #3b82f6;
          --navyx:    #dbeafe;
          --text:     #1e2d5a;
          --textsub:  #4b6cb7;
          --muted:    #7a96c9;
          --border:   #c7d7f5;
          --font:     'Plus Jakarta Sans', sans-serif;
        }

        body { font-family: var(--font); }

        @keyframes up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

        .pg { font-family:var(--font); background:var(--bg); min-height:100vh; color:var(--text); }
        .pg.in { padding-top:80px; }

        /* ── HERO ─────────────────────────────────────────────────── */
        .hero {
          position:relative; min-height:92vh;
          display:flex; align-items:center;
          padding:0 7%; overflow:hidden;
          background: linear-gradient(145deg, #dbeafe 0%, #eff6ff 40%, #eef2ff 70%, #e0e7ff 100%);
        }

        /* big soft circle blob */
        .hero::before {
          content:''; position:absolute;
          width:700px; height:700px; border-radius:50%;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          top:-140px; right:-160px; pointer-events:none;
        }
        .hero::after {
          content:''; position:absolute;
          width:420px; height:420px; border-radius:50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          bottom:-80px; left:-80px; pointer-events:none;
        }

        /* subtle dot pattern */
        .hero-dots {
          position:absolute; inset:0; pointer-events:none;
          background-image: radial-gradient(rgba(37,99,235,0.12) 1.5px, transparent 1.5px);
          background-size:30px 30px;
          mask-image:radial-gradient(ellipse 90% 80% at 60% 50%, black 20%, transparent 100%);
        }

        /* floating card decoration */
        .hero-deco {
          position:absolute; right:7%; top:50%; transform:translateY(-50%);
          width:340px; display:flex; flex-direction:column; gap:14px;
          pointer-events:none;
          animation: bob 4s ease-in-out infinite;
        }
        .deco-card {
          background:#fff; border-radius:16px;
          padding:18px 22px; box-shadow:0 8px 32px rgba(37,99,235,0.12);
          border:1px solid #dbeafe;
          display:flex; align-items:center; gap:14px;
        }
        .deco-icon {
          width:44px; height:44px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .deco-label { font-size:0.72rem; color:var(--muted); margin-bottom:3px; font-weight:500; }
        .deco-val   { font-size:1rem; font-weight:700; color:var(--text); }

        .hero-content { position:relative; z-index:2; max-width:580px; }

        .eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.18);
          border-radius:100px; padding:6px 16px;
          font-size:0.74rem; font-weight:700; color:var(--navym);
          letter-spacing:0.3px; margin-bottom:24px;
          animation:up .6s ease both;
        }
        .eyebrow-dot { width:6px;height:6px;border-radius:50%;background:var(--navym); }

        .hero-h1 {
          font-size:clamp(2.4rem,5vw,4.2rem); font-weight:800;
          line-height:1.1; color:var(--text); margin-bottom:20px;
          animation:up .6s ease .08s both;
        }
        .hero-h1 em {
          font-style:normal; color:var(--navym);
        }

        .hero-p {
          font-size:1.02rem; color:var(--textsub); line-height:1.8;
          max-width:440px; margin-bottom:36px; font-weight:400;
          animation:up .6s ease .16s both;
        }

        .hero-btns { display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px; animation:up .6s ease .24s both; }

        .btn-p {
          display:inline-flex;align-items:center;gap:8px;
          background:var(--navy); color:#fff;
          font-family:var(--font); font-size:0.93rem; font-weight:700;
          padding:13px 28px; border-radius:12px; border:none;
          cursor:pointer; transition:all .22s ease; text-decoration:none;
          box-shadow:0 4px 18px rgba(30,58,138,0.25);
        }
        .btn-p:hover { background:var(--navym); transform:translateY(-2px); box-shadow:0 10px 24px rgba(37,99,235,0.3); }

        .btn-o {
          display:inline-flex;align-items:center;gap:8px;
          background:#fff; color:var(--navym);
          font-family:var(--font); font-size:0.93rem; font-weight:600;
          padding:13px 26px; border-radius:12px; border:1.5px solid var(--border);
          cursor:pointer; transition:all .22s ease; text-decoration:none;
        }
        .btn-o:hover { border-color:var(--navym); background:var(--navyx); }

        .trust { display:flex;gap:20px;flex-wrap:wrap; animation:up .6s ease .32s both; }
        .trust-i { display:flex;align-items:center;gap:6px; font-size:0.76rem; color:var(--muted); font-weight:500; }

        /* ── WAVE DIVIDER ── */
        .wave-div { line-height:0; overflow:hidden; margin-top:-2px; }
        .wave-div svg { display:block; width:100%; }

        /* ── SECTION ── */
        .sec { padding:64px 7%; background:#fff; }
        .sec-lbl { font-size:0.7rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--navym);margin-bottom:10px; }
        .sec-h   { font-size:clamp(1.7rem,3vw,2.4rem);font-weight:800;color:var(--text);line-height:1.2;margin-bottom:12px; }
        .sec-sub { font-size:0.93rem;color:var(--textsub);line-height:1.75;max-width:440px; }
        .sec-hd  { margin-bottom:40px; }

        .sec-alt { background:var(--bg); }

        /* ── PILLS ── */
        .pills { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px; }
        .pill {
          padding:7px 17px;border-radius:100px;
          font-family:var(--font);font-size:0.78rem;font-weight:600;
          border:1.5px solid var(--border);background:#fff;color:var(--textsub);
          cursor:pointer;transition:all .2s ease;
        }
        .pill:hover { border-color:var(--navym);color:var(--navym); }
        .pill.on {
          background:var(--navy);border-color:var(--navy);color:#fff;
          box-shadow:0 4px 14px rgba(30,58,138,0.22);
        }

        /* ── CARDS GRID ── */
        .grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(296px,1fr));gap:18px; }

        /* ── LOAN CARD ── */
        .lc {
          position: relative;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid var(--border);
          transition: transform .28s ease, box-shadow .28s ease;
          animation: up .5s ease both;
          display: flex;
          flex-direction: column;
        }
        .lc:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(30,58,138,0.13);
          border-color: var(--navyl);
        }

        /* top gradient banner */
        .lc-banner {
          height: 88px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .lc-banner-circle {
          position: absolute;
          width: 140px; height: 140px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          bottom: -50px; right: -30px;
        }
        .lc-banner-circle2 {
          position: absolute;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          top: -20px; left: 60px;
        }
        .lc-banner-icon {
          position: absolute;
          bottom: -18px; left: 22px;
          width: 52px; height: 52px;
          border-radius: 16px;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .lc-banner-badge {
          position: absolute;
          top: 14px; right: 16px;
          padding: 4px 10px;
          border-radius: 100px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(6px);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #fff;
        }

        /* body */
        .lc-body {
          padding: 28px 20px 16px;
          flex: 1;
        }
        .lc-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .lc-desc {
          font-size: 0.78rem;
          color: var(--muted);
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* stats pills row */
        .lc-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 0 20px 18px;
        }
        .lc-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 100px;
          background: var(--bg);
          border: 1.5px solid var(--border);
        }
        .lc-pill-label {
          font-size: 0.62rem;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .lc-pill-val {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text);
        }

        /* footer */
        .lc-foot {
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1.5px solid var(--border);
          background: var(--bg);
        }
        .lc-meta { display:flex;flex-direction:column;gap:3px; }
        .lc-mr   { display:flex;align-items:center;gap:5px;font-size:0.68rem;color:var(--muted); }

        .aply {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 11px;
          font-family: var(--font);
          font-size: 0.8rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          color: #fff;
          transition: all .22s ease;
          text-decoration: none;
        }
        .aply:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }

        /* ── FEATURES ── */
        .feat-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px; }
        .feat-card {
          background:#fff;border:1.5px solid var(--border);border-radius:16px;
          padding:26px 22px;transition:all .25s ease;
        }
        .feat-card:hover { border-color:var(--navyl);box-shadow:0 8px 24px rgba(37,99,235,0.1);transform:translateY(-3px); }
        .feat-ico { width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:16px; }
        .feat-t  { font-size:1rem;font-weight:700;color:var(--text);margin-bottom:7px; }
        .feat-s  { font-size:0.81rem;color:var(--textsub);line-height:1.68; }

        /* ── CTA STRIP ── */
        .cta {
          margin:0 7% 60px;
          background:linear-gradient(135deg,var(--navy) 0%, #1d4ed8 60%, #2563eb 100%);
          border-radius:22px;padding:52px 48px;
          display:flex;align-items:center;justify-content:space-between;
          gap:28px;flex-wrap:wrap;
          box-shadow:0 16px 48px rgba(30,58,138,0.3);
          position:relative;overflow:hidden;
        }
        .cta::before {
          content:'';position:absolute;top:-60px;right:-60px;
          width:280px;height:280px;border-radius:50%;
          background:rgba(255,255,255,0.06);pointer-events:none;
        }
        .cta::after {
          content:'';position:absolute;bottom:-80px;right:120px;
          width:200px;height:200px;border-radius:50%;
          background:rgba(255,255,255,0.04);pointer-events:none;
        }
        .cta-h { font-size:clamp(1.4rem,2.5vw,1.9rem);font-weight:800;color:#fff;margin-bottom:7px;position:relative; }
        .cta-s { font-size:0.88rem;color:rgba(255,255,255,0.7);position:relative; }
        .btn-white {
          display:inline-flex;align-items:center;gap:7px;
          background:#fff;color:var(--navy);
          font-family:var(--font);font-size:0.9rem;font-weight:700;
          padding:12px 26px;border-radius:11px;border:none;cursor:pointer;
          transition:all .22s ease;text-decoration:none;
        }
        .btn-white:hover { background:var(--navyx);transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.15); }
        .btn-wout {
          display:inline-flex;align-items:center;gap:7px;
          background:transparent;color:rgba(255,255,255,0.85);
          font-family:var(--font);font-size:0.9rem;font-weight:600;
          padding:12px 22px;border-radius:11px;border:1.5px solid rgba(255,255,255,0.3);cursor:pointer;
          transition:all .22s ease;text-decoration:none;
        }
        .btn-wout:hover { background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.6); }

        /* ── FOOTER ── */
        .foot { background:var(--bg);border-top:1.5px solid var(--border);padding:26px 7%;text-align:center;font-size:0.82rem;color:var(--muted); }

        /* ── STAT CARDS ── */
        .scards { display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:8px; }
        .scard  { background:#fff;border:1.5px solid var(--border);border-radius:15px;padding:20px 22px;display:flex;align-items:center;gap:14px; }
        .scard-ico { width:44px;height:44px;border-radius:12px;background:var(--navyx);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--navy);flex-shrink:0; }
        .scard-lbl { font-size:0.73rem;color:var(--muted);margin-bottom:4px; }
        .scard-val { font-size:1.55rem;font-weight:800;color:var(--text);line-height:1; }

        /* ── SPINNER ── */
        .spn { text-align:center;padding:52px 0; }
        .spn-r { display:inline-block;width:32px;height:32px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--navym);animation:spin .8s linear infinite; }
        .spn-t { margin-top:11px;color:var(--muted);font-size:0.86rem; }

        /* ── DASH HEADER ── */
        .dh   { display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;margin-bottom:28px; }
        .dh-t { font-size:clamp(1.2rem,2.5vw,1.65rem);font-weight:800;color:var(--text); }
        .dh-t em { font-style:normal;color:var(--navym); }
      `}</style>

      <div className={`pg${loggedIn ? " in" : ""}`}>

        {/* ══════════ PUBLIC LANDING ══════════ */}
        {!loggedIn ? (
          <>
            {/* HERO */}
            <section className="hero">
              <div className="hero-dots" />

              {/* floating deco cards — right side */}
              <div className="hero-deco">
                <div className="deco-card">
                  <div className="deco-icon" style={{ background:"#dbeafe" }}>
                    <IndianRupee size={22} color="#1e3a8a" />
                  </div>
                  <div>
                    <div className="deco-label">Loan Amount</div>
                    <div className="deco-val">Up to ₹5 Cr</div>
                  </div>
                </div>
                <div className="deco-card" style={{ marginLeft:32 }}>
                  <div className="deco-icon" style={{ background:"#dcfce7" }}>
                    <Percent size={22} color="#16a34a" />
                  </div>
                  <div>
                    <div className="deco-label">Starting Rate</div>
                    <div className="deco-val">@ 7.5% p.a.</div>
                  </div>
                </div>
                <div className="deco-card">
                  <div className="deco-icon" style={{ background:"#fef3c7" }}>
                    <Zap size={22} color="#d97706" />
                  </div>
                  <div>
                    <div className="deco-label">Approval Time</div>
                    <div className="deco-val">Under 10 mins</div>
                  </div>
                </div>
              </div>

              <div className="hero-content">
                {/* <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  NBFC Loan Products
                </div> */}

                <h1 className="hero-h1">
                  The Right Loan,<br />
                  <em>Right When</em><br />
                  You Need It
                </h1>

                <p className="hero-p">
                  Transparent rates, flexible tenures, and fast approvals — explore the full range of loan products designed for real needs.
                </p>

                <div className="hero-btns">
                  {/* <Link href="/apply" className="btn-p">
                    Apply Now <ArrowRight size={16} />
                  </Link> */}
                  <button className="btn-o" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior:"smooth" })}>
                    View Products <ChevronDown size={16} />
                  </button>
                </div>

                <div className="trust">
                  {["RBI Registered", "ISO 9001:2015", "256-bit SSL Secure"].map(t => (
                    <div className="trust-i" key={t}>
                      <CheckCircle size={13} color="#2563eb" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* wave */}
            <div className="wave-div">
              <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0,32 C360,60 1080,0 1440,32 L1440,48 L0,48 Z" fill="#ffffff"/>
              </svg>
            </div>

            {/* PRODUCTS */}
            <section className="sec" id="products">
              <div className="sec-hd">
                <div className="sec-lbl">Loan Products</div>
                <h2 className="sec-h">Find the Perfect Loan for You</h2>
                <p className="sec-sub">Competitive rates, minimal documentation, and fast disbursals across all loan categories.</p>
              </div>

              {loading && <div className="spn"><div className="spn-r"/><p className="spn-t">Loading products…</p></div>}
              {error   && <p style={{color:"#ef4444",textAlign:"center",padding:"32px 0"}}>Error: {error}</p>}

              {!loading && !error && (
                <div className="grid">
                  {loanProducts.map((loan,i) => <LoanCard key={loan.id} loan={loan} i={i} />)}
                </div>
              )}
              {!loading && !error && loanProducts.length === 0 && (
                <p style={{textAlign:"center",color:"var(--muted)",padding:"48px 0"}}>No loan products available at the moment.</p>
              )}
            </section>

            {/* WHY US */}
            <section className="sec sec-alt">
              <div className="sec-hd">
                <div className="sec-lbl">Why Choose Us</div>
                <h2 className="sec-h">Simple. Fast. Trusted.</h2>
              </div>
              <div className="feat-grid">
                {[
                  { icon:<Zap size={22} color="#2563eb"/>,      bg:"#dbeafe", title:"Instant Approval",   desc:"Get a decision in under 10 minutes — no branch visit needed." },
                  { icon:<Shield size={22} color="#16a34a"/>,   bg:"#dcfce7", title:"100% Secure",        desc:"Bank-grade encryption and full RBI compliance on every transaction." },
                  { icon:<Star size={22} color="#d97706"/>,     bg:"#fef3c7", title:"Best Rates",         desc:"Starting from 7.5% p.a. with zero hidden charges, ever." },
                  { icon:<TrendingUp size={22} color="#7c3aed"/>,bg:"#ede9fe", title:"Flexible Repayment", desc:"Customize your EMI and tenure to suit your exact cash flow." },
                ].map((f,i) => (
                  <div className="feat-card" key={i}>
                    <div className="feat-ico" style={{background:f.bg}}>{f.icon}</div>
                    <div className="feat-t">{f.title}</div>
                    <p className="feat-s">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="cta">
              <div style={{position:"relative"}}>
                <p className="cta-h">Ready to get started?</p>
                <p className="cta-s">Login to apply and unlock personalized loan offers tailored for you.</p>
              </div>
              {/* <div style={{display:"flex",gap:12,flexWrap:"wrap",position:"relative"}}>
                <Link href="/apply" className="btn-white">Apply Now <ArrowRight size={15}/></Link>
                <button className="btn-wout">Learn More</button>
              </div> */}
            </div>

            <div className="foot">Login to apply for loans and access personalized offers</div>
          </>

        ) : (
          /* ══════════ LOGGED-IN — YOUR ORIGINAL STRUCTURE ══════════ */
          <div style={{padding:"24px 5%", maxWidth:1400, margin:"0 auto"}}>

            {/* YOUR ORIGINAL HEADER + FILTER */}
            <div className="dh">
              <h1 className="dh-t">NBFC Loan Products — <em>All Available Loans</em></h1>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"var(--muted)",fontSize:"0.84rem",fontWeight:500}}>Filter by</span>
                <div className="pills" style={{marginBottom:0}}>
                  {filterOptions.map(opt => (
                    <button key={opt} className={`pill${filter===opt?" on":""}`} onClick={()=>setFilter(opt)}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>

            {loading && <div className="spn"><div className="spn-r"/><p className="spn-t">Loading products…</p></div>}
            {error   && <p style={{color:"#ef4444",textAlign:"center",padding:"32px 0"}}>Error: {error}</p>}

            {/* YOUR ORIGINAL CARDS + STAT CARDS */}
            {!loading && !error && (
              <>
                <div className="grid" style={{marginBottom:28}}>
                  {filtered.map((loan,i) => <LoanCard key={loan.id} loan={loan} i={i} />)}
                </div>
                <div className="scards">
                  <StatCard icon={<IndianRupee size={19}/>} title="Total Loan Products" value={loanProducts.length.toString()} />
                  <StatCard icon={<Percent     size={19}/>} title="Avg Interest Rate"   value="11.5%" />
                  <StatCard icon={<Clock       size={19}/>} title="Avg Tenure"          value="36 months" />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ── card config per loan type ── */
const ACC = {
  Personal:  { grad:"linear-gradient(135deg,#1e3a8a,#3b82f6)", color:"#2563eb", icon:<IndianRupee size={22} color="#2563eb"/> },
  Business:  { grad:"linear-gradient(135deg,#0c4a6e,#0891b2)", color:"#0891b2", icon:<TrendingUp   size={22} color="#0891b2"/> },
  Home:      { grad:"linear-gradient(135deg,#14532d,#16a34a)", color:"#16a34a", icon:<Building2    size={22} color="#16a34a"/> },
  Education: { grad:"linear-gradient(135deg,#4c1d95,#7c3aed)", color:"#7c3aed", icon:<Star         size={22} color="#7c3aed"/> },
  Vehicle:   { grad:"linear-gradient(135deg,#7c2d12,#ea580c)", color:"#ea580c", icon:<Zap          size={22} color="#ea580c"/> },
  Gold:      { grad:"linear-gradient(135deg,#78350f,#d97706)", color:"#d97706", icon:<Shield       size={22} color="#d97706"/> },
};
const DACC = ACC.Personal;

function LoanCard({ loan, i }) {
  const a = ACC[loan.loan_type] || DACC;

  return (
    <div className="lc" style={{ animationDelay:`${i*0.05}s` }}>

      {/* gradient banner top */}
      <div className="lc-banner" style={{ background: a.grad }}>
        <div className="lc-banner-circle" />
        <div className="lc-banner-circle2" />
        <span className="lc-banner-badge">{loan.loan_type || "Standard"}</span>
        {/* white icon chip — overlaps body */}
        <div className="lc-banner-icon">{a.icon}</div>
      </div>

      {/* body */}
      <div className="lc-body">
        <div className="lc-name">{loan.name}</div>
        {loan.description && <p className="lc-desc">{loan.description}</p>}
      </div>

      {/* stat pills */}
      <div className="lc-pills">
        <div className="lc-pill">
          <IndianRupee size={11} color={a.color}/>
          <span className="lc-pill-label">Amount</span>
          <span className="lc-pill-val">₹{loan.min_amount?.toLocaleString()??"—"} – ₹{loan.max_amount?.toLocaleString()??"—"}</span>
        </div>
        <div className="lc-pill">
          <Percent size={11} color={a.color}/>
          <span className="lc-pill-label">Rate</span>
          <span className="lc-pill-val">{loan.min_interest_rate??"—"}% – {loan.max_interest_rate??"—"}%</span>
        </div>
        <div className="lc-pill">
          <Clock size={11} color={a.color}/>
          <span className="lc-pill-label">Tenure</span>
          <span className="lc-pill-val">{loan.min_tenure_months??"—"} – {loan.max_tenure_months??"—"} mo</span>
        </div>
      </div>

      {/* footer */}
      <div className="lc-foot">
        <div className="lc-meta">
          <div className="lc-mr"><Building2 size={11}/> {loan.branch||"All Branches"}</div>
          <div className="lc-mr"><Tag size={10}/> ID: {loan.loan_id||loan.id}</div>
        </div>
        <Link href="/apply">
          <button className="aply" style={{ background:a.grad, boxShadow:`0 4px 14px ${a.color}38` }}>
            Apply Now <ArrowRight size={14}/>
          </button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="scard">
      <div className="scard-ico">{icon}</div>
      <div>
        <p className="scard-lbl">{title}</p>
        <p className="scard-val">{value}</p>
      </div>
    </div>
  );
}