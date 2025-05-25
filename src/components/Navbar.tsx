import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NavbarProps {
  role: string | null;
  user: any;
}

const Navbar = ({ role, user }: NavbarProps) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white">
            <Image
              src="/images/logo_textless.png"
              alt="AlMasjid Digital Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            AlMasjid Digital
          </Link>
          <nav className="space-x-6 hidden md:flex items-center">
            <Link href="/donasi" className="text-gray-300 hover:text-yellow-400 transition">Donasi</Link>
            <Link href="/keuangan" className="text-gray-300 hover:text-yellow-400 transition">Keuangan</Link>
            <Link href="/kegiatan" className="text-gray-300 hover:text-yellow-400 transition">Kegiatan</Link>
            {role === 'admin' && (
              <Link href="/users" className="text-gray-300 hover:text-yellow-400 transition">Kelola User</Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-white/5 hover:bg-white/10"
                >
                  {user?.foto_profil ? (
                    <Image
                      src={`http://localhost:8000/storage/${user.foto_profil}`}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-300" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#1A1614] border-white/10 text-white">
                <DropdownMenuLabel className="text-yellow-400">
                  {user?.nama || 'User'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="px-2 py-1.5 text-sm text-gray-400">
                  <p>{user?.email}</p>
                  <p className="capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-white/5 cursor-pointer"
                  onClick={() => router.push('/profil')}
                >
                  Detail Profil
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-500 hover:bg-white/5 cursor-pointer"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-[#1A1614] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-yellow-400">Konfirmasi Logout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin keluar dari sistem?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(false)}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                setShowLogoutDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar; 