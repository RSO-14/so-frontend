'use client';

import { useRouter } from 'next/navigation';
import UserMenu from './UserMenu';

interface HeaderProps {
    pageTitle: string;
    username?: string;
}

export default function Header({ pageTitle, username }: HeaderProps) {
    const router = useRouter();

    return (
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
            <button
                onClick={() => router.push('/events')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
                AlertHub
            </button>
            <h1 className="text-2xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
                {pageTitle}
            </h1>
            <UserMenu username={username} />
        </div>
    );
}