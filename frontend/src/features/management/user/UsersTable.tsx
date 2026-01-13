import { useEffect, useState } from 'react';
import { Edit, Trash2, Shield, UserCog } from 'lucide-react';
import { userApi } from '../../../api/endpoints/user.api';
import type { User } from '../../../api/endpoints/auth.api';
import EditUserModal from './EditUserModal';
import ChangeRoleModal from './ChangeRoleModal';
import { useToast } from '../../../components/common/ToastProvider';
import { formatUTC0DateToLocal } from '../../../utils/timezone';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';

interface Props {
    search?: string;
    roles?: string;
    isActive?: string;
    page?: number;
    limit?: number;
    onPageChange?: (nextPage: number) => void;
    onLimitChange?: (nextLimit: number) => void;
}

export default function UsersTable({ search = '', roles = '', isActive = '', page = 1, limit = 5, onPageChange, onLimitChange }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEdit, setShowEdit] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);
    const toast = useToast();
    const { user: currentUser } = useAuth();

    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await userApi.list({ search, roles, isActive, page, limit });
                if (!mounted) return;
                setUsers(res.items || []);
                setTotal(res.total || 0);
            } catch (err: any) {
                setError(err?.message || 'Failed to load users');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetch();

        return () => {
            mounted = false;
        };
    }, [search, roles, isActive, page, limit, refreshTrigger]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
                <div className="p-12 text-center text-gray-500">Đang tải...</div>
            ) : error ? (
                <div className="p-12 text-center text-red-600">Lỗi: {error}</div>
            ) : (
                <>
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                                        Không tìm thấy người dùng phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <tr key={user._id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('') : (user.username || '?')}
                                                </div>
                                                <p className="font-medium text-gray-800">{user.fullName || user.username || user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.phoneNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.roles?.includes('ADMIN') && <Shield size={16} className="text-yellow-500" />}
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.roles?.includes('ADMIN') ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {user.roles?.includes('ADMIN')
                                                        ? 'Admin'
                                                        : (user.roles && user.roles.length ? (user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)) : 'User')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatUTC0DateToLocal(user.createdAt, 'en-US')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setSelectedUser(user); setShowEdit(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit user">
                                                    <Edit size={18} />
                                                </button>
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => { setUserToChangeRole(user); setShowRoleModal(true); }}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Change roles"
                                                    >
                                                        <UserCog size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={deletingId === user._id}
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {showEdit && selectedUser && (
                        <EditUserModal
                            user={selectedUser}
                            onClose={() => { setShowEdit(false); setSelectedUser(null); }}
                            onUpdated={() => { setShowEdit(false); setSelectedUser(null); setRefreshTrigger(t => t + 1); }}
                        />
                    )}

                    {showRoleModal && userToChangeRole && (
                        <ChangeRoleModal
                            user={userToChangeRole}
                            onClose={() => { setShowRoleModal(false); setUserToChangeRole(null); }}
                            onUpdated={() => { setShowRoleModal(false); setUserToChangeRole(null); setRefreshTrigger(t => t + 1); }}
                        />
                    )}

                    <ConfirmModal
                        isOpen={showDeleteConfirm}
                        title="Xác nhận xóa người dùng"
                        message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.fullName || userToDelete?.username || userToDelete?.email}"? Hành động này không thể hoàn tác.`}
                        confirmText="Xóa"
                        cancelText="Hủy"
                        variant="danger"
                        onConfirm={async () => {
                            if (!userToDelete?._id) return;
                            try {
                                setDeletingId(userToDelete._id);
                                setShowDeleteConfirm(false);
                                await userApi.delete(userToDelete._id);
                                toast.push('Xoá người dùng thành công', 'success');
                                setRefreshTrigger(t => t + 1);
                            } catch (err: any) {
                                const msg = err?.message || 'Xoá thất bại';
                                toast.push(msg, 'error');
                            } finally {
                                setDeletingId(null);
                                setUserToDelete(null);
                            }
                        }}
                        onCancel={() => {
                            setShowDeleteConfirm(false);
                            setUserToDelete(null);
                        }}
                    />

                    <Pagination
                        page={page}
                        limit={limit}
                        total={total}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        onLimitChange={onLimitChange}
                        itemLabel="users"
                    />
                </>
            )}
        </div>
    );
}
