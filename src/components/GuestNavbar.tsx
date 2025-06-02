import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function GuestNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-white hover:opacity-90 transition-opacity">
          <Image
            src="/images/logo_textless.png"
            alt="AlMasjid Digital Logo"
            width={35}
            height={35}
            className="rounded-full shadow-md"
          />
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            AlMasjid Digital
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Button variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-300" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
} 