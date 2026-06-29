import re

# 1. Update mockData.tsx
with open('src/data/mockData.tsx', 'r', encoding='utf-8') as f:
    mock_content = f.read()

mock_search = r'''export const ANALYTICS_DATA: AnalyticsDataPoint\[\] = \['''

mock_replace = r'''export const SELLER_NOTIFICATIONS = [
  { id: 'sn1', type: 'NEW_ORDER', message: "Maria Clara Santos ordered 100kg of Pechay", time: "2 mins ago", unread: true },
  { id: 'sn2', type: 'DRIVER_ACCEPTED', message: "Hanzel Guevarra accepted delivery for Order #1042", time: "15 mins ago", unread: true },
  { id: 'sn3', type: 'ORDER_DELIVERED', message: "Order #1039 successfully delivered to Landmark Supermarket", time: "1 hr ago", unread: false },
  { id: 'sn4', type: 'URGENT_ALERT', message: "Urgent: Route 4 delayed — your shipment may arrive late", time: "3 hrs ago", unread: false },
  { id: 'sn5', type: 'PRICE_ALERT', message: "Tomato prices dropped 12% in Metro Manila markets", time: "5 hrs ago", unread: false },
];

export const ANALYTICS_DATA: AnalyticsDataPoint[] = ['''

if 'SELLER_NOTIFICATIONS' not in mock_content:
    mock_content = re.sub(mock_search, mock_replace, mock_content)
    with open('src/data/mockData.tsx', 'w', encoding='utf-8') as f:
        f.write(mock_content)


# 2. Update Dashboard.tsx
with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    dash_content = f.read()

# Add import
if 'import NotificationBell' not in dash_content:
    import_search = r'import \{ METRICS, AI_LIVE_FEED, ANALYTICS_DATA \} from \'\.\.\/data\/mockData\';'
    import_replace = r'''import { METRICS, AI_LIVE_FEED, ANALYTICS_DATA } from '../data/mockData';
import NotificationBell from './NotificationBell';'''
    dash_content = re.sub(import_search, import_replace, dash_content)

# Replace bell
bell_search = r'''            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1\.5 right-1\.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>'''

bell_replace = r'''            <NotificationBell role={session?.role} />'''

dash_content = re.sub(bell_search, bell_replace, dash_content)

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dash_content)

print("Updated mockData and Dashboard!")
