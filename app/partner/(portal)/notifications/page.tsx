"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNotificationsForPartner, markAllNotificationsRead, markNotificationRead } from "@/lib/notifications";
import { PartnerNotification } from "@/lib/types";
import { usePartner } from "../layout";
import { BadgeCheck, CircleDollarSign } from "lucide-react";

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const TYPE_CONFIG = {
  published: {
    icon: <BadgeCheck size={16} />,
    color: "bg-blue-100 text-blue-600 border-blue-200",
    label: "Published",
  },
  sold: {
    icon: <CircleDollarSign size={16} />,
    color: "bg-green-100 text-green-600 border-green-200",
    label: "Sold",
  },
};

export default function PartnerNotificationsPage() {
  const { partner, refreshUnread } = usePartner();
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    const notifs = await getNotificationsForPartner(partner.id);
    setNotifications(notifs);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [partner.id]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(partner.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshUnread();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOne = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    refreshUnread();
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Updates</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">Notifications</h1>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <p className="text-sm text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 divide-y divide-gray-100">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.published;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-6 py-5 transition-colors ${!n.read ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
              >
                <div className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center ${cfg.color}`}>
                  {cfg.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#cc1111] shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-gray-400">{fmtTime(n.createdAt)}</p>
                    <Link
                      href={`/partner/units/${n.carId}`}
                      className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111] hover:underline"
                    >
                      View Unit →
                    </Link>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkOne(n.id)}
                    className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-700 transition-colors mt-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
