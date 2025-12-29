'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
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

    fetch('http://localhost:8000/graphql', {
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
      });

    // Connect to RabbitMQ via Server-Sent Events
    const eventSource = new EventSource('/api/rabbitmq/listen');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error('RabbitMQ error:', data.error);
      } else {
        // TODO - JSON parse message if needed
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

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <table className="mt-4 table-auto border-collapse border border-gray-300">
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">Email</td>
            <td className="border border-gray-300 px-4 py-2">{user.email}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">Address</td>
            <td className="border border-gray-300 px-4 py-2">{user.address}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">Region</td>
            <td className="border border-gray-300 px-4 py-2">{user.region}</td>
            <td><button>Edit</button></td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 font-medium">Phone Number</td>
            <td className="border border-gray-300 px-4 py-2">{user.phoneNumber}</td>
          </tr>
      </tbody>
      </table>
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  );
}