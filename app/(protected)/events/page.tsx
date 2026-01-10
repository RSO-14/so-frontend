'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

interface Alert {
    id: string | number;
    type: string;
    area: string;
    headline: string;
    description: string;
    instruction: string;
    effective: string;
    expires: string;
    severity: 'low' | 'medium' | 'high';
    urgency: string;
    created_at: string;
    read?: boolean;
}

export default function EventsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
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
                }
            }
        `;

        fetch('http://34.77.25.197/users/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
            credentials: 'include',
        })
            .then((res) => res.ok ? res.json() : Promise.reject())
            .then(({ data }) => {
                setUser(data?.me);
                return fetch(`http://34.77.25.197/companies-filter/events/${data?.me?.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            })
            .then((res) => res.ok ? res.json() : Promise.reject())
            .then((data) => setAlerts(data || []))
            .catch(() => {
                localStorage.removeItem('token');
                router.push('/login');
            })
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Unauthorized</div>;

    return (
        <div className="min-h-screen">
            <Header pageTitle="Alerts" username={user?.email || 'User'} />

            <div className="p-8 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                    {alerts.length === 0 ? (
                        <p className="mt-4 text-gray-600">No alerts at this time.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-6 border-2 rounded-4xl ${
                                        alert.severity === 'high'
                                        ? 'border-red-500 bg-red-50'
                                        : alert.severity === 'medium'
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-blue-500 bg-blue-50'
                                    }`}
                                >
                                    <h3 className="font-semibold">{alert.headline}</h3>
                                    <p className="text-sm mt-1">{alert.description}</p>
                                    <p className="text-sm mt-1">{alert.instruction}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(alert.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}