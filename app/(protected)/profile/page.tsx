'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const query = `
      query Me {
        me {
          id
          email
          role
          address
          region
          phoneNumber
          createdAt
        }
      }
    `;

    fetch('https://34.77.25.197/users/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      credentials: 'include',
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(({ data }) => setUser(data?.me))
      .catch(() => {
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; max-age=0';
        router.push('/login');
      })
      .finally(() => setLoading(false));

    // Connect to RabbitMQ via Server-Sent Events
    const eventSource = new EventSource('/api/rabbitmq/listen');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error('RabbitMQ error:', data.error);
      } else {
        const messageData = data.message;
        if (messageData === 'high') {
          window.alert(`${messageData}`);
        }
        console.log(`Received message: ${data.message}`);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Unauthorized</div>;

  return (
    <div className="min-h-screen">
      <Header pageTitle="Profile" username={user?.email || 'User'} />

      <div className="p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-800">{user.email}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-medium text-gray-800">{user.role || 'N/A'}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-lg font-medium text-gray-800">{user.address || 'N/A'}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600">Region</p>
                <p className="text-lg font-medium text-gray-800">{user.region || 'N/A'}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-lg font-medium text-gray-800">{user.phoneNumber || 'N/A'}</p>
              </div>

              <div className="pb-4">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/logout')}
              className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}