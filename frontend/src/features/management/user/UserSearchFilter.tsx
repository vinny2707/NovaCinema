import { Search } from 'lucide-react';

interface Props {
    q?: string;
    roles?: string;
    isActive?: string;
    onChange: (next: { q?: string; roles?: string; isActive?: string }) => void;
}

export default function UserSearchFilter({ q = '', roles = '', isActive = '', onChange }: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        value={q}
                        onChange={(e) => onChange({ q: e.target.value, roles, isActive })}
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
                <select value={roles} onChange={(e) => onChange({ q, roles: e.target.value, isActive })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                </select>
                <select value={isActive} onChange={(e) => onChange({ q, roles, isActive: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
        </div>
    );
}
