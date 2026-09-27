import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, User, Briefcase, FileText, Bell, 
  Users, Building, Settings, LogOut, Menu,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function DashboardLayout({ role }: { role: 'STUDENT' | 'PLACEMENT_OFFICER' | 'RECRUITER' }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navigation: Record<string, SidebarItem[]> = {
    STUDENT: [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', href: '/student/profile', icon: User },
      { name: 'Placement Drives', href: '/student/drives', icon: Briefcase },
      { name: 'Applications', href: '/student/applications', icon: FileText },
      { name: 'Notifications', href: '/student/notifications', icon: Bell },
    ],
    PLACEMENT_OFFICER: [
      { name: 'Analytics', href: '/plo/dashboard', icon: LayoutDashboard },
      { name: 'Students', href: '/plo/students', icon: GraduationCap },
      { name: 'Recruiters', href: '/plo/recruiters', icon: Users },
      { name: 'Companies', href: '/plo/companies', icon: Building },
      { name: 'Placement Drives', href: '/plo/drives', icon: Briefcase },
      { name: 'System Users', href: '/plo/users', icon: Settings },
    ],
    RECRUITER: [
      { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
      { name: 'Company Profile', href: '/recruiter/profile', icon: Building },
      { name: 'Posted Drives', href: '/recruiter/drives', icon: Briefcase },
      { name: 'Notifications', href: '/recruiter/notifications', icon: Bell },
    ]
  };

  const navItems = navigation[role] || [];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <GraduationCap className="h-6 w-6" />
          <span>Campus<span className="text-foreground">Hire</span></span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== `/${role === 'PLACEMENT_OFFICER' ? 'plo' : role.toLowerCase()}`);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border/50">
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-card md:block">
        <SidebarContent />
      </div>

      <div className="flex flex-col">
        {/* Mobile Header & Topbar */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 z-10 sticky top-0">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            {/* Title can go here, or search bar */}
            <h1 className="text-lg font-semibold md:hidden">CampusHire</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {role !== 'PLACEMENT_OFFICER' && (
                <DropdownMenuItem onClick={() => navigate(`/${role.toLowerCase()}/profile`)}>
                  Profile Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
