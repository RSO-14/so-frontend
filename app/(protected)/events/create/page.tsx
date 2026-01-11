'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


interface EventInput {
    type: string;
    area: string;
    headline: string;
    description: string;
    instruction: string;
    effective: string;
    expires: string;
    severity: string;
    urgency: string;
}

export default function CreateEventPage() {
    const [organizationName, setOrganizationName] = useState('');
    const [events, setEvents] = useState<EventInput[]>([
        { type: '', area: '', headline: '', description: '', instruction: '', effective: '', expires: '', severity: '', urgency: '' },
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const query = `query Me { me { id } }`;
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
                router.push('/login');
            });
    }, [router]);

    const handleEventChange = (index: number, field: string, value: string) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEvents(newEvents);
    };

    const handleAddEvent = () => {
        setEvents([...events, { type: '', area: '', headline: '', description: '', instruction: '', effective: '', expires: '', severity: '', urgency: '' }]);
    };

    const handleRemoveEvent = (index: number) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organizationName || events.some(e => !e.type || !e.area || !e.headline || !e.expires)) {
            setMessage('Please fill in all required fields (Organization Name, Type, Area, Headline, Expires)');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://34.77.25.197/companies-sync/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    organization_name: organizationName,
                    events: events.map(e => ({
                        type: e.type,
                        area: e.area,
                        headline: e.headline,
                        description: e.description,
                        instruction: e.instruction,
                        effective: e.effective,
                        expires: e.expires,
                        severity: e.severity,
                        urgency: e.urgency,
                    })),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(`Success! ${data.results.length} event(s) processed.`);
                setOrganizationName('');
                setEvents([{ type: '', area: '', headline: '', description: '', instruction: '', effective: '', expires: '', severity: '', urgency: '' }]);
            } else {
                setMessage(`Error: ${data.detail || 'Failed to create events'}`);
            }
        } catch (error) {
            setMessage('Error submitting events');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-6">Create Events</h1>

            <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-6 rounded-lg border">
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Organization Name *</label>
                    <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold mb-4">Events</h2>
                    {events.map((event, index) => (
                        <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Type *</label>
                                    <input
                                        type="text"
                                        value={event.type}
                                        onChange={(e) => handleEventChange(index, 'type', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Area *</label>
                                    <input
                                        type="text"
                                        value={event.area}
                                        onChange={(e) => handleEventChange(index, 'area', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-semibold mb-1">Headline *</label>
                                <input
                                    type="text"
                                    value={event.headline}
                                    onChange={(e) => handleEventChange(index, 'headline', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea
                                    value={event.description}
                                    onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    rows={2}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-semibold mb-1">Instruction</label>
                                <textarea
                                    value={event.instruction}
                                    onChange={(e) => handleEventChange(index, 'instruction', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Effective</label>
                                    <input
                                        type="datetime-local"
                                        value={event.effective}
                                        onChange={(e) => handleEventChange(index, 'effective', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Expires *</label>
                                    <input
                                        type="datetime-local"
                                        value={event.expires}
                                        onChange={(e) => handleEventChange(index, 'expires', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Severity</label>
                                    <input
                                        type="text"
                                        value={event.severity}
                                        onChange={(e) => handleEventChange(index, 'severity', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="e.g., low, medium, high"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Urgency</label>
                                    <input
                                        type="text"
                                        value={event.urgency}
                                        onChange={(e) => handleEventChange(index, 'urgency', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="e.g., low, medium, high"
                                    />
                                </div>
                            </div>

                            {events.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEvent(index)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Remove Event
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAddEvent}
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        + Add Event
                    </button>
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 disabled:bg-gray-400"
                >
                    {loading ? 'Submitting...' : 'Submit Events'}
                </button>
            </form>
        </div>
    );
}