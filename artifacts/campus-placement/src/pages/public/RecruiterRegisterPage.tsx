import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterRecruiter } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiErrorMessage } from '@/lib/api-error';

const recruiterSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  phone: z.string().optional(),
});

type RecruiterForm = z.infer<typeof recruiterSchema>;

export default function RecruiterRegisterPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<RecruiterForm>({
    resolver: zodResolver(recruiterSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      companyName: '',
      designation: '',
      phone: '',
    },
  });

  const registerMutation = useRegisterRecruiter();

  const onSubmit = (data: RecruiterForm) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          navigate('/recruiter/dashboard');
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl border-0 shadow-lg sm:border sm:shadow-sm">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold">Recruiter Registration</CardTitle>
          <CardDescription>
            Create an account to post placement drives and hire the best campus talent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {registerMutation.isError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{getApiErrorMessage(registerMutation.error, 'Unable to complete registration.')}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form.register('firstName')} />
                {form.formState.errors.firstName && <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...form.register('lastName')} />
                {form.formState.errors.lastName && <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" autoComplete="username" {...form.register('email')} />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...form.register('companyName')} />
                {form.formState.errors.companyName && <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Your Designation</Label>
                <Input id="designation" {...form.register('designation')} />
                {form.formState.errors.designation && <p className="text-sm text-destructive">{form.formState.errors.designation.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input id="phone" {...form.register('phone')} />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base mt-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
              ) : 'Register as Recruiter'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
