import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
            <div className="flex gap-5 items-center">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BuzzVar
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col gap-20 max-w-7xl p-5 w-full">
          <Hero />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-sm gap-8 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl w-full px-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BuzzVar
                </span>
                <span className="text-muted-foreground">© 2025</span>
              </div>
              <p className="text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  className="font-semibold hover:underline text-blue-600"
                  rel="noreferrer"
                >
                  Supabase
                </a>{" "}
                &{" "}
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  className="font-semibold hover:underline text-blue-600"
                  rel="noreferrer"
                >
                  Next.js
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
