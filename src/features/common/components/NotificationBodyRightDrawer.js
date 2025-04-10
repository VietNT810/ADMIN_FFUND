import React from 'react';
import { useNotifications } from '../../../context/NotificationContext';

function NotificationBodyRightDrawer() {

  const { notifications } = useNotifications();

  return (
    <div>
      {
        notifications.length > 0 ? (
          notifications.map((notification, i) => (
            <div
              key={i}
              className={`grid mt-3 card bg-base-200 rounded-box p-3 ${i < 5 ? 'bg-blue-100' : ''}`}
            >
              {/* Hiển thị thông báo thực tế */}
              <strong>{notification.title}</strong>
              <p>{notification.message || 'You have a new notification'}</p>
            </div>
          ))
        ) : (
          // Hiển thị thông báo mặc định nếu không có thông báo nào
          <div className="grid mt-3 card bg-base-200 rounded-box p-3">
            No notifications yet.
          </div>
        )
      }
    </div>
  );
}

export default NotificationBodyRightDrawer;
