// Pure Server Component — static JSX, zero client JS
const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export default function SellSection({ phone }) {
  const tel = "tel:" + phone.replace(/[^0-9+]/g, "");
  return (
    <div className="sell mm">
      <span className="big" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 21V8l9-5 9 5v13" /><path d="M3 21h18" /><path d="M12 11v5M9.5 13.5h5" />
        </svg>
      </span>
      <h2>မြေကွက် ရောင်းချင်ပါသလား?</h2>
      <p>ဖုန်းတစ်ချက် ခေါ်ပြီး မြေကွက်အချက်အလက် ပြောပြလိုက်ရုံပါပဲ။ ဈေးကွက်ပေါက်ဈေးနဲ့ ဝယ်ယူသူ ရှာပေးပါမယ်။</p>
      <div className="steps">
        <div className="step"><span className="n">၁</span><div><b>ဖုန်းခေါ်ပါ</b><small>အောက်က ခလုတ်ကို နှိပ်လိုက်ပါ</small></div></div>
        <div className="step"><span className="n">၂</span><div><b>အချက်အလက် ပြောပြပါ</b><small>နေရာ၊ အကျယ် (ပေ)၊ ဂရန်အမျိုးအစား၊ လိုချင်တဲ့ဈေး</small></div></div>
        <div className="step"><span className="n">၃</span><div><b>ဝယ်သူနဲ့ ချိတ်ဆက်ပေးမယ်</b><small>ပုံ/မြေပုံ ရရှိရင် ပိုမြန်ပါတယ်</small></div></div>
      </div>
      <a className="call mm" href={tel} style={{ maxWidth: 320, margin: "0 auto" }}>
        <Phone /> မြေကွက်တင်ရန် ဖုန်းခေါ်မယ်
      </a>
    </div>
  );
}
