
import React from 'react';

const mockUsers = [
  { id: 'usr_001', username: 'manhcuong', email: 'manhcuong@ctai.studio', status: 'Admin' },
  { id: 'usr_002', username: 'kien_truc_su_a', email: 'kts.a@example.com', status: 'Active' },
  { id: 'usr_003', username: 'designer_b', email: 'designer.b@example.com', status: 'Active' },
  { id: 'usr_004', username: 'sinh_vien_kien_truc', email: 'svkt@university.edu', status: 'Active' },
  { id: 'usr_005', username: 'user_tam_khoa', email: 'temp@example.com', status: 'Banned' },
  { id: 'usr_006', username: 'khach_hang_vip', email: 'vip.client@company.com', status: 'Active' },
  { id: 'usr_007', username: 'cong_tac_vien', email: 'ctv@designfirm.com', status: 'Active' },
];

const UserManagementView: React.FC = () => {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Banned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">Quản lý Người dùng</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Xem và quản lý tài khoản người dùng trong hệ thống.</p>
      </div>

      <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
            <thead className="text-xs text-zinc-700 uppercase bg-gray-100/50 dark:bg-zinc-700/50 dark:text-zinc-300">
                <tr>
                    <th scope="col" className="px-6 py-3">User ID</th>
                    <th scope="col" className="px-6 py-3">Username</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody>
                {mockUsers.map((user) => (
                <tr key={user.id} className="bg-white dark:bg-zinc-800/80 border-b dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{user.id}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">{user.username}</th>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                            {user.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => alert(`Chức năng sửa cho người dùng ${user.username} đang được phát triển.`)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Sửa</button>
                        <button onClick={() => alert(`Chức năng cấm/bỏ cấm cho người dùng ${user.username} đang được phát triển.`)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">{user.status === 'Banned' ? 'Bỏ cấm' : 'Cấm'}</button>
                        <button onClick={() => confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.username} không?`) && alert(`Chức năng xóa đang được phát triển.`)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Xóa</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
       <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 text-center italic">
            Lưu ý: Dữ liệu người dùng này chỉ là giả lập. Các hành động sẽ không được lưu lại.
        </p>
    </div>
  );
};

export default UserManagementView;
