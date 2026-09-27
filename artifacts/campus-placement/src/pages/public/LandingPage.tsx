import { Button } from '@/components/ui/button';
import { ArrowRight, Building, GraduationCap, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40 relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl opacity-50" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                The Enterprise <span className="text-primary">Campus Placement</span> Platform
              </h1>
              <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed">
                Streamline university placements with a powerful, unified system for students, placement officers, and top-tier recruiters.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/register/student">
                <Button size="lg" className="w-full sm:w-auto font-medium h-12 px-8">
                  I'm a Student <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register/recruiter">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium h-12 px-8">
                  I'm a Recruiter
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              Used by <span className="font-semibold text-foreground">500+</span> Universities & <span className="font-semibold text-foreground">10,000+</span> Companies
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 border-y bg-card">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">98%</h3>
              <p className="text-sm font-medium text-muted-foreground">Placement Rate</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">50k+</h3>
              <p className="text-sm font-medium text-muted-foreground">Students Placed</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">2.5k</h3>
              <p className="text-sm font-medium text-muted-foreground">Active Recruiters</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">24hrs</h3>
              <p className="text-sm font-medium text-muted-foreground">Average Offer Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">Engineered for Efficiency</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Role-specific workflows designed to eliminate friction in the hiring process.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-start space-y-4 rounded-xl border p-8 shadow-sm transition-all hover:shadow-md bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">For Students</h3>
              <ul className="space-y-2 text-muted-foreground w-full">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Dynamic unified profiles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> One-click apply to drives</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Real-time application tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Interview scheduling alerts</li>
              </ul>
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-xl border p-8 shadow-sm transition-all hover:shadow-md bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">For Placement Officers</h3>
              <ul className="space-y-2 text-muted-foreground w-full">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Centralized student database</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Automated eligibility filtering</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Comprehensive analytics dashboard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Bulk notification system</li>
              </ul>
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-xl border p-8 shadow-sm transition-all hover:shadow-md bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">For Recruiters</h3>
              <ul className="space-y-2 text-muted-foreground w-full">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Streamlined drive posting</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Advanced applicant filtering</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Built-in shortlisting workflow</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Instant offer rollouts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
