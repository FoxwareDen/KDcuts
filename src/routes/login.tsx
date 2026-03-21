import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithAuth, signInWithEmail, signUpWithEmail, sendOTP } from "@/lib/db.fb";

export const Route = createFileRoute('/login')({
  component: () => {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    });

    const handleGoogleSignIn = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await signInWithAuth();
        if (res) router.navigate({ to: '/' });
      } catch (err) {
        setError('Failed to sign in with Google. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleResetPassword = async () => {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        if (!formData.email) throw new Error('Please enter your email address');
        const res = await sendOTP(formData.email);
        if (!res) throw new Error('Failed to send reset email');
        setSuccessMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setMode('login');
          resetForm();
        }, 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email');
      } finally {
        setIsLoading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      try {
        if (mode === 'reset') {
          await handleResetPassword();
          return;
        }
        if (mode === 'signup' && !formData.name) throw new Error('Please enter your full name');
        if (!formData.email) throw new Error('Please enter your email address');
        if (!formData.password) throw new Error('Please enter your password');

        let res;
        if (mode === 'login') {
          res = await signInWithEmail(formData.email, formData.password);
        } else {
          res = await signUpWithEmail(formData.name, formData.email, formData.password);
        }
        if (res) router.navigate({ to: '/' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    const resetForm = () => {
      setFormData({ name: '', email: '', password: '' });
      setError('');
      setSuccessMessage('');
    };

    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {mode === 'login' && 'Sign in to continue to your account'}
              {mode === 'signup' && 'Sign up to get started'}
              {mode === 'reset' && 'Enter your email to receive a reset link'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {mode !== 'reset' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-6 h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      resetForm();
                    }}
                    className="text-sm text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Email'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'login' && (
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); resetForm(); }} className="text-primary font-medium hover:underline" disabled={isLoading}>
                    Sign up
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); resetForm(); }} className="text-primary font-medium hover:underline" disabled={isLoading}>
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'reset' && (
                <p className="text-muted-foreground">
                  Remember your password?{' '}
                  <button type="button" onClick={() => { setMode('login'); resetForm(); }} className="text-primary font-medium hover:underline" disabled={isLoading}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>

          {mode === 'signup' && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          )}
        </div>
      </div>
    );
  }
});