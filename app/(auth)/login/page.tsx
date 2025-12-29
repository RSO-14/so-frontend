'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const query = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
              role
            }
          }
        }
      `;

      const variables = {
        input: { email, password }
      };

      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables }),
        credentials: 'include'
      });
      
      const { data, errors } = await res.json();
      
      if (errors) {
        setError(errors.map((e: any) => e.message).join(', '));
        return;
      }
      
      if (data?.login?.token) {
        const token = data.login.token;
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem('token', token);
        router.push('/profile');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <button type="submit" className="w-50 px-4 py-2 bg-blue-500 text-white rounded">
          Login
        </button>
        <br></br>
        <span className="text-sm text-gray-600">
          Don't have an account? <a href="/register">Register</a>
        </span>
      </form>
    </div>
  );
}