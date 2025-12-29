'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const query = `
        mutation Register($input: UserInput!) {
          register(input: $input) {
            token
            user {
              id
              email
              address
              region
              phoneNumber
              role
              createdAt
            }
          }
        }
      `;

      const variables = {
        input: {
          email,
          password,
          address,
          region,
          phoneNumber,
          role,
        },
      };

      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });

      const { data, errors } = await res.json();

      if (errors) {
        setError(errors[0].message);
      } else if (data?.register) {
        // Store token in localStorage or cookie
        localStorage.setItem('token', data.register.token);
        router.push('/login');
      }
    } catch (err) {
        console.error(err);
      setError('Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>
        {error && <p className="text-red-500">{error}</p>}
        
        <input
          type="email"
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
        
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        
        <input
          type="text"
          placeholder="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        
        <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded">
          Register
        </button>
        <br/>
        <span className="text-sm text-gray-600">
          Already have an account? <a href="/login">Login</a>
        </span>
      </form>
    </div>
  );
}