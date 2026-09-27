import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-error';

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const mutation = useResetPassword();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: searchParams.get('token') ?? '', password: '', confirmPassword: '' },
  });

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Choose a new password for your CampusHire account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(({ token, password }) => mutation.mutate({ data: { token, password } }))}
            className="space-y-4"
          >
            {mutation.isSuccess && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{mutation.data.message}</AlertDescription>
              </Alert>
            )}
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getApiErrorMessage(mutation.error, 'Unable to reset your password.')}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="token">Reset token</Label>
              <Input id="token" autoComplete="off" {...form.register('token')} />
              {form.formState.errors.token && <p className="text-sm text-destructive">{form.formState.errors.token.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
              {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : 'Reset password'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link to="/login" className="text-sm text-primary hover:underline">Back to sign in</Link>
        </CardFooter>
      </Card>
    </div>
  );
}