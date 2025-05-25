import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { User, LogOut, DollarSign, Wallet, Calendar, Users } from 'lucide-react';
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3 text-xl font-bold text-white hover:opacity-90 transition-opacity">
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
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/donasi" className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium">
                <DollarSign className="h-4 w-4" />
                <span>Donasi</span>
              </Link>
              <Link href="/keuangan" className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium">
                <Wallet className="h-4 w-4" />
                <span>Keuangan</span>
              </Link>
              <Link href="/kegiatan" className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium">
                <Calendar className="h-4 w-4" />
                <span>Kegiatan</span>
              </Link>
              {role === 'admin' && (
                <Link href="/users" className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium">
                  <Users className="h-4 w-4" />
                  <span>Kelola User</span>
                </Link>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  {user?.foto_profil ? (
                    <Image
                      src={`http://localhost:8000/storage/${user.foto_profil}`}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-300" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#1A1614] border-white/10 text-white shadow-xl">
                <DropdownMenuLabel className="text-yellow-400 font-semibold">
                  {user?.nama || 'User'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="px-2 py-1.5 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Email: </span>
                    {user?.email}
                  </p>
                  <p className="text-yellow-400/80 capitalize font-medium">
                    <span className="text-gray-400">Role: </span>
                    {user?.role}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-500 hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-red-500"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-[#1A1614] border-white/10 text-white shadow-xl">
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