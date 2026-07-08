"use client";
import { useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function NavItem({ href, className, children, label }) {
  const router = useRouter();
  const touched = useRef(false);

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    touched.current = true;
    router.push(href);
  }, [href, router]);

  const onClick = useCallback((e) => {
    if (touched.current) { e.preventDefault(); touched.current = false; }
  }, []);

  return (
    <a href={href} className={className} aria-label={label}
       onPointerDown={onPointerDown} onClick={onClick}>
      {children}
    </a>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAuth     = pathname.startsWith("/auth");
  const isHome     = pathname === "/";
  const isPhone    = pathname === "/phone";
  const isAdmin    = pathname === "/admin" || pathname === "/dashboard";
  const isProfile  = pathname.startsWith("/user/profile") || pathname.startsWith("/profile");
  const profileHref = session ? "/user/profile" : "/auth/login";

  if (isAuth) return null;

  return (
    <nav>
      <NavItem href="/" className={isHome ? "on" : ""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>
        </svg>
        <span className="mm">မြေကွက်</span>
      </NavItem>
      <NavItem href="/phone" className={isPhone ? "on" : ""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
        </svg>
        <span className="mm">ဖုန်း</span>
      </NavItem>
      <NavItem href="/admin?add=1" className="post" label="ရောင်းမယ်">
        <span className="pc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </NavItem>
      <NavItem href="/admin" className={isAdmin ? "on" : ""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>
        </svg>
        <span className="mm">စီမံ</span>
      </NavItem>
      <NavItem href={profileHref} className={isProfile ? "on" : ""}>
        {session?.user?.image
          ? <img src={session.user.image} alt="" style={{ width:22, height:22, borderRadius:"50%", objectFit:"cover", border:"1.5px solid #E0A33B" }}/>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
        }
        <span className="mm">{session ? "ကျွန်ုပ်" : "ဝင်မည်"}</span>
      </NavItem>
    </nav>
  );
}
