import { useState, useEffect } from 'react';
import api from '../api';
import { UsersIcon, CheckCircleIcon, AlertCircleIcon, SettingsIcon, LockIcon, UnlockIcon, TrashIcon } from '../components/Icons';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [userActivity, setUserActivity] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users', {
        params: {
          search: searchTerm,
          sortBy,
          order: sortOrder
        }
      });
      setUsers(response.data.users);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`);
      setUserActivity(response.data.activity);
      setShowActivityModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user activity');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      setUpdatingUser(userId);
      await api.put(`/admin/users/${userId}`, { isActive });
      fetchUsers();
      setUpdatingUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
      setUpdatingUser(null);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const getActivityBadge = (status) => {
    const badges = {
      'active': { color: 'bg-green-100', textColor: 'text-green-800', label: 'Active Now' },
      'recently-active': { color: 'bg-blue-100', textColor: 'text-blue-800', label: 'Recently Active' },
      'active-today': { color: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'Active Today' },
      'active-week': { color: 'bg-purple-100', textColor: 'text-purple-800', label: 'This Week' },
      'inactive': { color: 'bg-gray-100', textColor: 'text-gray-800', label: 'Inactive' },
      'never-active': { color: 'bg-gray-100', textColor: 'text-gray-600', label: 'Never Active' }
    };
    return badges[status] || badges.inactive;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Monitor and manage all registered users on the platform</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{summary.active + summary.recentlyActive + summary.activeToday + summary.inactive}</p>
              </div>
              <div className="text-amber-700"><UsersIcon size={40} /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Now</p>
                <p className="text-3xl font-bold text-green-600">{summary.active}</p>
              </div>
              <div className="text-amber-700"><CheckCircleIcon size={40} /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Recently Active</p>
                <p className="text-3xl font-bold text-blue-600">{summary.recentlyActive}</p>
              </div>
              <div className="text-amber-700"><AlertCircleIcon size={40} /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Today</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.activeToday}</p>
              </div>
              <div className="text-amber-700"><SettingsIcon size={40} /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Inactive</p>
                <p className="text-3xl font-bold text-gray-600">{summary.inactive}</p>
              </div>
              <div className="text-amber-700"><AlertCircleIcon size={40} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            <option value="createdAt">Sort by Signup Date</option>
            <option value="lastLogin">Sort by Last Login</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-gold-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading users...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Login</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Signup Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => {
                  const activityBadge = getActivityBadge(user.activityStatus);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded flex items-center gap-1 w-fit">
                            <SettingsIcon size={14} /> Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${activityBadge.color} ${activityBadge.textColor}`}>
                          {activityBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(user.signupDate)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => fetchUserActivity(user._id)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors inline-flex items-center gap-1"
                        >
                          <SettingsIcon size={16} /> Activity
                        </button>
                        <button
                          onClick={() => updateUserStatus(user._id, !user.isActive)}
                          disabled={updatingUser === user._id}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {user.isActive ? (
                            <><LockIcon size={16} /> Deactivate</>
                          ) : (
                            <><UnlockIcon size={16} /> Activate</>
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors inline-flex items-center gap-1"
                        >
                          <TrashIcon size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && userActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-50 via-amber-50/80 to-rose-50/60 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-300/40">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-8 py-6 border-b border-amber-400/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-wide drop-shadow-sm">User Activity Details</h2>
                  <p className="text-sm text-amber-50 mt-1">Complete activity history and insights</p>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-white hover:text-amber-100 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto bg-gradient-to-b from-white to-amber-50/30">
              {/* User Info Section */}
              <div className="bg-white rounded-xl p-6 mb-6 border border-amber-200 shadow-md">
                <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-lg p-4 border border-amber-200">
                    <p className="text-xs text-amber-700 uppercase tracking-wider mb-1 font-medium">Full Name</p>
                    <p className="text-gray-900 font-semibold text-lg">{userActivity.userName}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-lg p-4 border border-amber-200">
                    <p className="text-xs text-amber-700 uppercase tracking-wider mb-1 font-medium">Email Address</p>
                    <p className="text-gray-900 font-medium text-sm break-all">{userActivity.email}</p>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div className="bg-white rounded-xl p-6 mb-6 border border-amber-200 shadow-md">
                <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                  Registration Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-amber-100">
                    <span className="text-sm text-gray-600 font-medium">Signup Date</span>
                    <span className="text-gray-900 font-semibold">{formatDate(userActivity.signupDate)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-amber-100">
                    <span className="text-sm text-gray-600 font-medium">Registration IP</span>
                    <span className="text-gray-900 font-mono text-sm bg-amber-100 px-3 py-1.5 rounded-md border border-amber-200">{userActivity.signupIp}</span>
                  </div>
                  <div className="flex items-start justify-between py-3">
                    <span className="text-sm text-gray-600 font-medium">Signup Device</span>
                    <span className="text-gray-700 text-xs text-right max-w-xs break-words">{userActivity.signupDevice}</span>
                  </div>
                </div>
              </div>

              {/* Login Activity */}
              <div className="bg-white rounded-xl p-6 mb-6 border border-amber-200 shadow-md">
                <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Login Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-amber-100">
                    <span className="text-sm text-gray-600 font-medium">Last Login</span>
                    <span className="text-gray-900 font-semibold">{userActivity.lastLogin ? formatDate(userActivity.lastLogin) : <span className="text-amber-600 italic">Never</span>}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-amber-100">
                    <span className="text-sm text-gray-600 font-medium">Last Login IP</span>
                    <span className="text-gray-900 font-mono text-sm bg-amber-100 px-3 py-1.5 rounded-md border border-amber-200">{userActivity.lastLoginIp}</span>
                  </div>
                  <div className="flex items-start justify-between py-3">
                    <span className="text-sm text-gray-600 font-medium">Last Login Device</span>
                    <span className="text-gray-700 text-xs text-right max-w-xs break-words">{userActivity.lastLoginDevice}</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 border border-amber-400 text-center shadow-lg">
                  <p className="text-xs text-amber-100 uppercase tracking-wider mb-2 font-semibold">Total Logins</p>
                  <p className="text-5xl font-bold text-white drop-shadow-sm">{userActivity.totalLogins}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl p-6 border border-yellow-400 text-center shadow-lg">
                  <p className="text-xs text-amber-100 uppercase tracking-wider mb-2 font-semibold">Member For</p>
                  <p className="text-5xl font-bold text-white drop-shadow-sm">{userActivity.daysSinceSignup}</p>
                  <p className="text-xs text-amber-100 mt-1 font-medium">days</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-8 py-4 border-t border-amber-300">
              <button
                onClick={() => setShowActivityModal(false)}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
