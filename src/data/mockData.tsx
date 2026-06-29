import React from 'react';
import {
  Users,
  Box,
  TrendingUp as TrendingUpIcon,
  Truck
} from 'lucide-react';

export interface MetricData {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
}

export interface FeedItem {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface AnalyticsDataPoint {
  period: string;
  predicted: number;
  actual: number;
}

export const METRICS: MetricData[] = [
  {
    id: 'm1',
    label: 'Active Bulk Buy Groups',
    value: '84',
    trend: 'up',
    trendValue: '+12 this week',
    icon: <Users className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />,
  },
  {
    id: 'm2',
    label: 'Consolidated Yield Volume',
    value: '14,250 kg',
    trend: 'up',
    trendValue: '+2,400 kg vs last month',
    icon: <Box className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />,
  },
  {
    id: 'm3',
    label: 'Market Price Stability Index',
    value: '92.4%',
    trend: 'neutral',
    trendValue: 'Stable overall',
    icon: <TrendingUpIcon className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />,
  },
  {
    id: 'm4',
    label: 'Pending Delivery Dispatches',
    value: '28',
    trend: 'down',
    trendValue: '-5 overdue',
    icon: <Truck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />,
  },
];

export const AI_LIVE_FEED: FeedItem[] = [
  {
    id: 'f1',
    message: 'High demand for root crops flagged in City Market B. Recommend diverting excess supply.',
    severity: 'medium',
    timestamp: '2 mins ago',
  },
  {
    id: 'f2',
    message: 'Cooperative A logged 500kg of surplus tomatoes ready for bulk acquisition.',
    severity: 'low',
    timestamp: '14 mins ago',
  },
  {
    id: 'f3',
    message: 'Urgent: Logistics delay on Route 4 due to heavy rain. Dispatch 104 delayed by 2 hours.',
    severity: 'high',
    timestamp: '1 hr ago',
  },
  {
    id: 'f4',
    message: 'New bulk buy group formed in Sector 7 requesting 2 tons of premium rice.',
    severity: 'low',
    timestamp: '3 hrs ago',
  },
  {
    id: 'f5',
    message: 'Price anomaly detected: Onion prices dropped 15% below baseline in Southern markets.',
    severity: 'medium',
    timestamp: '5 hrs ago',
  },
];

export const SELLER_NOTIFICATIONS = [
  { id: 'sn1', type: 'NEW_ORDER', message: "Maria Clara Santos ordered 100kg of Pechay", time: "2 mins ago", unread: true },
  { id: 'sn2', type: 'DRIVER_ACCEPTED', message: "Hanzel Guevarra accepted delivery for Order #1042", time: "15 mins ago", unread: true },
  { id: 'sn3', type: 'ORDER_DELIVERED', message: "Order #1039 successfully delivered to Landmark Supermarket", time: "1 hr ago", unread: false },
  { id: 'sn4', type: 'URGENT_ALERT', message: "Urgent: Route 4 delayed — your shipment may arrive late", time: "3 hrs ago", unread: false },
  { id: 'sn5', type: 'PRICE_ALERT', message: "Tomato prices dropped 12% in Metro Manila markets", time: "5 hrs ago", unread: false },
];

export const ANALYTICS_DATA: AnalyticsDataPoint[] = [
  { period: 'Week 1', predicted: 4000, actual: 4100 },
  { period: 'Week 2', predicted: 4200, actual: 4050 },
  { period: 'Week 3', predicted: 4500, actual: 4600 },
  { period: 'Week 4', predicted: 4800, actual: 4750 },
];
