import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/admin';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const lastSent = Number(localStorage.getItem('forgotPasswordLastSentAt') || '0');
    if (lastSent > 0) {
      const elapsed = Date.now() - lastSent;
      const remainingMs = 60000 - elapsed;
      if (remainingMs > 0) {
        setCooldownSeconds(Math.ceil(remainingMs / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = setInterval(() => {
      setCooldownSeconds((s) => (s > 1 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownSeconds]);

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!isEmailValid) {
      setEmailTouched(true);
      setIsLoading(false);
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await forgotPassword(email);
      setSuccess(response.message);
      localStorage.setItem('forgotPasswordLastSentAt', Date.now().toString());
      localStorage.setItem('resetPasswordEmail', email);
      setCooldownSeconds(60);
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setSuccess('');
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo and Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/ustp-logo.png"
            alt="USTP Logo" 
            className="h-16 mr-3"
          />
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-700">UNIVERSITY OF SCIENCE AND TECHNOLOGY</div>
            <div className="text-sm font-semibold text-gray-700">OF SOUTHERN PHILIPPINES</div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
        <p className="text-gray-600 text-sm">Enter your email to reset your password.</p>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
              inputMode="email"
              aria-invalid={emailTouched && !isEmailValid}
            />
            {emailTouched && !isEmailValid && (
              <div className="mt-2 text-sm text-red-600">Please enter a valid email address.</div>
            )}
          </div>

          {/* Reset Password */}
          <button
            type="submit"
            disabled={isLoading || cooldownSeconds > 0 || !isEmailValid}
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded-md transition duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Resetting Password...'
              : cooldownSeconds > 0
              ? `Try again in ${formatSeconds(cooldownSeconds)}`
              : 'Reset Password'}
          </button>
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-indigo-700 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        © 2025 NextLib System - USTP Jasaan. All rights reserved.
      </div>
    </div>
  );
}

export default ForgotPassword;
