"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMode(initialMode);
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
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in-0"
      onClick={onClose}
    >
      {/* Modal Dialog Container */}
      <div
        className="relative z-10 w-full max-w-md my-auto max-h-[92vh] overflow-y-auto rounded-3xl animate-in zoom-in-95 fade-in-0 duration-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "login" ? (
          <LoginForm
            onClose={onClose}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onClose={onClose}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

