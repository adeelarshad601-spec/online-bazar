"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 2700);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMode(initialMode);
    setIsClosing(false);
  }, [initialMode, isOpen]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <style jsx global>{`
        @keyframes authBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes authBackdropOut {
          0%, 74% { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes authFormIn {
          from { opacity: 0; transform: translateY(18px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes authFormDrop {
          0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
          42% { opacity: 1; transform: rotate(-28deg); }
          52% { opacity: 1; transform: rotate(-28deg); }
          100% { opacity: 0; transform: translate3d(0, 125vh, 0) rotate(-28deg); }
        }

        @keyframes authCloseDrop {
          0% { opacity: 1; transform: translate3d(0, 0, 0); }
          100% { opacity: 0; transform: translate3d(0, 110vh, 0); }
        }
      `}</style>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md"
        onClick={handleClose}
        style={{
          animation: isClosing
            ? "authBackdropOut 2600ms ease-in forwards"
            : "authBackdropIn 300ms ease-out both",
        }}
      >
        {/* Modal Dialog Container */}
        <div
          className="relative z-10 w-full max-w-md my-auto max-h-[92vh] overflow-visible rounded-3xl scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-105 hover:bg-red-600 active:scale-95"
            aria-label="Close"
            title="Close form"
            style={{
              animation: isClosing
                ? "authCloseDrop 1248ms linear 1352ms forwards"
                : undefined,
            }}
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>

          {mode === "login" ? (
            <LoginForm
              onClose={handleClose}
              onSwitchToRegister={() => setMode("register")}
              isClosing={isClosing}
            />
          ) : (
            <RegisterForm
              onClose={handleClose}
              onSwitchToLogin={() => setMode("login")}
              isClosing={isClosing}
            />
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

