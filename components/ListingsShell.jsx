"use client";
import Link from "next/link";



export default function ListingsShell({ children }) {
  return (
    <div className="app">
      <header>
        <div className="brandrow">
          <Link className="brand" href="/" prefetch>
            <span className="seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 21V8l9-5 9 5v13" />
                <path d="M3 12h18M9 21V12h6v9" />
              </svg>
            </span>
            <div>
              <b>Mandalay Land</b>
              <small className="mm">ကိုအောင် အိမ်ခြံမြေ နှင့် ဆောက်လုပ်ရေး</small>
            </div>
          </Link>
          <span className="loc mm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            မန္တလေး
          </span>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
