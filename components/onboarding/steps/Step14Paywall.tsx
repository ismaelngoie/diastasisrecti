"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/store/useUserStore";
import {
  Star,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
  Brain,
  X,
  Loader2,
  Lock,
  Mail,
  Stethoscope,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { AnimatePresence, motion } from "framer-motion";

// --- STRIPE SETUP ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const REVIEW_IMAGES = ["/review9.png", "/review1.png", "/review5.png", "/review4.png", "/review2.png"];

const MEDICAL_FEATURES = [
  {
    icon: <Brain size={24} className="text-white" />,
    title: "AI-Driven Protocol",
    desc: "Adapts to your gap width daily.",
  },
  {
    icon: <ShieldCheck size={24} className="text-white" />,
    title: "Diastasis Safe",
    desc: "Zero crunches. Zero bulging.",
  },
  {
    icon: <Stethoscope size={24} className="text-white" />,
    title: "Physio Approved",
    desc: "Clinical logic, home comfort.",
  },
  {
    icon: <Activity size={24} className="text-white" />,
    title: "Tissue Tracking",
    desc: "Visual trackers for gap closure.",
  },
];

const REVIEWS = [
  { name: "Sarah W.", text: "I closed my 3-finger gap in 9 weeks. No surgery.", image: "/review9.png" },
  { name: "Michelle T.", text: "The 'coning' stopped after 12 days. Finally safe.", image: "/review1.png" },
  { name: "Chloe N.", text: "My back pain vanished when my core reconnected.", image: "/review5.png" },
  { name: "Olivia G.", text: "Better than my $150 physio visits. Truly.", image: "/review4.png" },
  { name: "Jess P.", text: "I can lift my baby without fear now.", image: "/review2.png" },
];

const DASHBOARD_PATH = "/dashboard?plan=monthly";

const CheckoutForm = ({ onClose }: { onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { setPremium, setJoinDate, setName } = useUserData();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const returnUrl = `${window.location.origin}${DASHBOARD_PATH}`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Payment failed");
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      setPremium(true);
      setJoinDate(new Date().toISOString());

      // ✅ AUTO-START DRY SEAL IF USER HAS LEAKS
      const symptoms = useUserData.getState().symptoms || [];
      if (symptoms.includes("incontinence")) {
        useUserData.getState().startDrySeal();
      }

      router.push(DASHBOARD_PATH);
      return;
    }

    setMessage("An unexpected error occurred.");
    setIsLoading(false);
  };

  // ✅ Correct PaymentElement typing
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    fields: {
      billingDetails: {
        phone: "never",
      },
    },
  };

  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-[#1A1A26] p-6 rounded-[32px] border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-10 fade-in duration-500 relative my-auto mx-4"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
      >
        <X size={20} className="text-white/70" />
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-lora)" }}>
          Secure Checkout
        </h3>
        <p className="text-sm text-white/50 font-medium">Total due: $24.99 / month</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-white">
          <LinkAuthenticationElement
            id="link-authentication-element"
            onChange={(e: any) => setEmail(e.value.email)}
          />
        </div>

        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      {message && (
        <div className="text-red-300 text-sm mt-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20 font-semibold">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_10px_40px_rgba(230,84,115,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : "Unlock My Protocol ($24.99)"}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-white/30 text-[11px] font-semibold">
        <Lock size={12} />
        256-bit SSL Secure Payment
      </div>
    </form>
  );
};

const RestoreModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { setPremium, setJoinDate, setName } = useUserData();

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/restore-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.isPremium) {
        setPremium(true);
        setJoinDate(new Date().toISOString());
        if (data.customerName) setName(data.customerName);

        // ✅ AUTO-START DRY SEAL IF USER HAS LEAKS
        const symptoms = useUserData.getState().symptoms || [];
        if (symptoms.includes("incontinence")) {
          useUserData.getState().startDrySeal();
        }

        router.push(DASHBOARD_PATH);
      } else {
        alert("We found your email, but no active subscription was detected.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to verify purchase. Please check your internet connection.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#1A1A26] border border-white/10 rounded-[32px] p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-lora)" }}>
            Restore Purchase
          </h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed">
          Enter the email address used at checkout. We'll find your active medical plan.
        </p>

        <form onSubmit={handleRestoreSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[color:var(--pink)] transition-colors font-semibold"
              autoFocus
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full h-12 bg-white/10 border border-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Find My Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Step14Paywall() {
  const { name } = useUserData();

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [userCount, setUserCount] = useState(10150);
  const [showContent, setShowContent] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const [clientSecret, setClientSecret] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const displayReview = useMemo(() => REVIEWS[currentReviewIndex], [currentReviewIndex]);

  useEffect(() => {
    setShowContent(true);
  }, []);

  useEffect(() => {
    const featureTimer = setInterval(
      () => setActiveFeatureIndex((p) => (p + 1) % MEDICAL_FEATURES.length),
      3000
    );
    const reviewTimer = setInterval(() => setCurrentReviewIndex((p) => (p + 1) % REVIEWS.length), 5000);
    return () => {
      clearInterval(featureTimer);
      clearInterval(reviewTimer);
    };
  }, []);

  useEffect(() => {
    if (!showContent) return;
    let start = 10150;
    const timer = setInterval(() => {
      start += 2;
      if (start >= 10243) {
        setUserCount(10243);
        clearInterval(timer);
      } else setUserCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [showContent]);

  // Preload review images so REVIEW_IMAGES isn't dead weight
  useEffect(() => {
    if (typeof window === "undefined") return;
    REVIEW_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleStartPlan = async () => {
    setIsButtonLoading(true);

    if (!clientSecret) {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server error (${res.status}): ${txt}`);
        }

        const data = await res.json();
        if (!data?.clientSecret) throw new Error("No clientSecret returned from server.");

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error("Stripe init error:", err);
        alert(`Could not initialize payment: ${err?.message || "Unknown error"}`);
        setIsButtonLoading(false);
        return;
      }
    }

    setIsButtonLoading(false);
    setShowCheckoutModal(true);
  };

  const stripeAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#E65473",
      colorBackground: "#1A1A26",
      colorText: "#ffffff",
      colorDanger: "#df1b41",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "16px",
    },
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#1A1A26] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-60" : "opacity-0"
          }`}
        >
          <source src="/paywall_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A26]/30 via-transparent to-[#1A1A26]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Scrollable Content */}
      <div
        className={`z-10 flex-1 flex flex-col overflow-y-auto no-scrollbar pt-14 pb-40 px-6 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-md shadow-lg">
            <Lock size={14} className="text-white/90" />
            <span className="text-[11px] font-extrabold text-white tracking-widest uppercase">
              Clinical Protocol Locked
            </span>
          </div>
        </div>

        <h1
          className="text-[34px] font-extrabold text-white text-center mb-4 leading-[1.1] drop-shadow-xl"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          <span className="text-white/90">{name}, your repair</span>
          <br />
          <span className="text-[color:var(--pink)]">protocol is ready.</span>
        </h1>

        <p className="text-center text-white/70 text-[15px] font-medium leading-relaxed mb-8 max-w-xs mx-auto">
          Join <span className="text-white font-bold">{userCount.toLocaleString()}+ women</span> who closed their gap
          without surgery.
        </p>

        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
            <motion.div
              className="h-full bg-[color:var(--pink)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[color:var(--pink)] to-[#C23A5B] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureIndex}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {MEDICAL_FEATURES[activeFeatureIndex].icon}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeatureIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-lg font-bold text-white mb-1">{MEDICAL_FEATURES[activeFeatureIndex].title}</h3>
                <p className="text-white/60 text-sm font-medium">{MEDICAL_FEATURES[activeFeatureIndex].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[28px] p-5 flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5">
            <span className="text-[20px] font-bold text-white">4.9</span>
            <div className="flex text-yellow-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white/50 uppercase ml-1 tracking-wide">Doctor Approved</span>
          </div>

          <div className="relative w-full h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute w-full flex flex-col items-center"
              >
                <img
                  src={displayReview.image}
                  alt={displayReview.name}
                  className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-md mb-3"
                />
                <p className="text-[15px] italic text-white text-center font-medium leading-snug px-4">
                  "{displayReview.text}"
                </p>
                <p className="text-[11px] font-bold text-white/40 mt-2 uppercase tracking-wide">{displayReview.name}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          onClick={() => setIsFaqOpen(!isFaqOpen)}
          className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm cursor-pointer active:scale-[0.99] transition-transform mb-6"
        >
          <div className="flex items-center justify-center gap-2 text-white/80">
            <span className="text-[13px] font-bold">100% Money-Back Guarantee?</span>
            {isFaqOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isFaqOpen ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-[13px] text-white/50 text-center leading-relaxed px-2">
              Yes. If you don't see results in your gap or symptoms, request a full refund in the app settings. No questions asked.
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 text-[11px] font-bold text-white/30 tracking-wide uppercase">
          <button onClick={() => setShowRestoreModal(true)} className="hover:text-white transition-colors">
            Restore Purchase
          </button>
          <span>•</span>
          <span>Encrypted</span>
          <span>•</span>
          <span>Secure</span>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div
        className={`absolute bottom-0 left-0 w-full z-30 px-5 pb-8 pt-8 bg-gradient-to-t from-[#1A1A26] via-[#1A1A26]/95 to-transparent transition-all duration-700 delay-200 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <button
          onClick={handleStartPlan}
          disabled={isButtonLoading}
          className="w-full h-[60px] rounded-full shadow-[0_0_40px_rgba(225,29,72,0.4)] flex items-center justify-center gap-3 animate-breathe active:scale-[0.98] transition-transform relative overflow-hidden group bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          {isButtonLoading ? (
            <Loader2 className="animate-spin text-white" />
          ) : (
            <>
              <span className="text-[18px] font-extrabold text-white">Unlock My Repair Protocol</span>
              <ChevronDown className="-rotate-90 text-white/80" size={20} />
            </>
          )}
        </button>

        <div className="flex flex-col items-center justify-center mt-4 gap-1">
          <p className="text-white font-bold text-[14px]">$24.99 / month</p>
          <p className="text-white/50 text-[11px] font-medium">Cancel anytime in settings.</p>
        </div>
      </div>

      {/* Stripe Modal */}
      {showCheckoutModal && clientSecret && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setShowCheckoutModal(false)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <Elements options={{ clientSecret, appearance: stripeAppearance }} stripe={stripePromise}>
              <CheckoutForm onClose={() => setShowCheckoutModal(false)} />
            </Elements>
          </div>
        </div>
      )}

      {showRestoreModal && <RestoreModal onClose={() => setShowRestoreModal(false)} />}
    </div>
  );
}
