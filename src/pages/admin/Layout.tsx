import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../../components/layout/AdminNav';
import NotificationBell from '../../components/admin/NotificationBell';

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminNav />
      <div className="flex-1 bg-gray-50">
        <div className="p-4 bg-white shadow-sm flex justify-end">
          <NotificationBell />
        </div>
        <Outlet />
      </div>
    </div>
  );
}