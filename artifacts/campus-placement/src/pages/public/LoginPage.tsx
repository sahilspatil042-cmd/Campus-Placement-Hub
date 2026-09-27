import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiErrorMessage } from '@/lib/api-error';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOfficerLogin = searchParams.get('role') === 'plo';
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          // Redirection handles automatically in ProtectedRoute, but we can push them here too
          const roleMap: Record<string, string> = {
            'STUDENT': '/student/dashboard',
            'PLACEMENT_OFFICER': '/plo/dashboard',
            'RECRUITER': '/recruiter/dashboard'
          };
          navigate(roleMap[res.user.role] || '/');
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Info */}
        <div className="hidden md:flex flex-col space-y-6 p-8 bg-primary text-primary-foreground rounded-2xl h-full justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-2xl tracking-tight">CampusHire</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">Welcome back to your placement portal.</h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              Access your dashboard to track applications, manage drives, or scout the best talent on campus.
            </p>
          </div>
          
          <div className="bg-primary-foreground/10 p-6 rounded-xl border border-primary-foreground/20">
            <h3 className="font-semibold mb-3">Demo Credentials</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/90 font-mono">
              <li>Student: student@campus.edu / Admin@123</li>
               <li>Placement Officer: admin@campus.edu / Admin@123</li>
              <li>Recruiter: recruiter@techcorp.example.com / Admin@123</li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <Card className="border-0 shadow-lg sm:border sm:shadow-sm">
          <CardHeader className="space-y-1">
             <CardTitle className="text-2xl font-bold">
               {isOfficerLogin ? 'Placement Officer / College Admin Login' : 'Sign in'}
             </CardTitle>
            <CardDescription>
               {isOfficerLogin
                 ? 'Use the account provided by your college placement cell.'
                 : 'Enter your email and password to access your account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {loginMutation.isError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                   <AlertDescription>{getApiErrorMessage(loginMutation.error, 'Invalid email or password.')}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                   <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                   </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                   autoComplete="current-password"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <div className="text-sm text-muted-foreground w-full flex justify-center items-center gap-1">
              <span>Don't have an account?</span>
            </div>
            <div className="flex gap-4 w-full">
              <Link to="/register/student" className="w-full">
                <Button variant="outline" className="w-full">Student</Button>
              </Link>
              <Link to="/register/recruiter" className="w-full">
                <Button variant="outline" className="w-full">Recruiter</Button>
              </Link>
            </div>
            <Link
              to="/login?role=plo"
              className="w-full rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Placement Officer / College Admin Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
