import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
              <GraduationCap className="h-6 w-6" />
              <span>Campus<span className="text-foreground">Hire</span></span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
            <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            <a href="#features" className="transition-colors text-muted-foreground hover:text-primary">Features</a>
            <a href="#about" className="transition-colors text-muted-foreground hover:text-primary">About</a>
            <a href="#contact" className="transition-colors text-muted-foreground hover:text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register/student">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card py-6 md:py-12 mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Campus<span className="text-muted-foreground">Hire</span></span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for enterprise-grade campus placements.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="#" className="hover:underline">Privacy Policy</Link>
            <Link to="#" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
