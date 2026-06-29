import re

with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r'(\nimport \{.*?)(\n\} from \'lucide-react\';)',
    r'\1, CheckCircle2, MapPin\2',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'import \{ APIProvider, Map as GoogleMap \} from \'@vis.gl/react-google-maps\';',
    r'import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap } from \'@vis.gl/react-google-maps\';',
    content
)

# 2. RouteLine
if 'const RouteLine' not in content:
    content = re.sub(
        r'import \{ METRICS, AI_LIVE_FEED, ANALYTICS_DATA \} from \'\.\./data/mockData\';\n',
        r'''import { METRICS, AI_LIVE_FEED, ANALYTICS_DATA } from '../data/mockData';

const RouteLine = ({ origin, destination }: { origin: any, destination: any }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !(window as any).google) return;
    const polyline = new (window as any).google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });
    polyline.setMap(map);
    return () => polyline.setMap(null);
  }, [map, origin, destination]);
  return null;
};
''',
        content
    )

# 3. State & Effect
state_replace = '''  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const [completedRoutesCount, setCompletedRoutesCount] = useState(0);
  const [activeRoute, setActiveRoute] = useState<any>(null);'''

content = re.sub(
    r'  const \[activeDeliveriesCount, setActiveDeliveriesCount\] = useState\(0\);',
    state_replace,
    content
)

effect_replace = '''      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);

      const completedForDriver = orders.filter((o: any) => o.driverId === user.id && o.status === 'delivered');
      setCompletedRoutesCount(completedForDriver.length);

      if (activeForDriver.length > 0) {
        setActiveRoute({
          origin: { lat: 15.4867, lng: 120.9664 },
          destination: { lat: 14.5990, lng: 120.9672 },
          isDelayed: Math.random() > 0.5
        });
      }
    }
  }, []);

  const driverCards = [
    { id: 'dc1', label: 'Assigned Tasks', value: activeDeliveriesCount, icon: <Package className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'dc2', label: 'Completed Routes', value: completedRoutesCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'dc3', label: 'Active ETA Status', value: activeRoute ? (activeRoute.isDelayed ? 'Delayed' : 'On Time') : 'No Active Route', trend: activeRoute?.isDelayed ? 'down' : 'up', trendValue: activeRoute?.isDelayed ? 'Check feed' : 'All good', icon: <Clock className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> }
  ];

  const feedItems = session?.role === 'driver' 
    ? AI_LIVE_FEED.filter(item => /logistic|route|dispatch|delay|weather/i.test(item.message))
    : AI_LIVE_FEED;'''

content = re.sub(
    r'      const activeForDriver = orders.filter\(\(o: any\) => o.driverId === user.id && o.status !== \'delivered\' && o.status !== \'cancelled\'\);\n      setActiveDeliveriesCount\(activeForDriver.length\);\n    }\n  }, \[\]\);',
    effect_replace,
    content
)

# 4. At-a-Glance Render
cards_replace = '''              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {(session?.role === 'driver' ? driverCards : METRICS).map((metric: any) => (
                  <div 
                    key={metric.id} 
                    className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200/60 transition-all duration-300 flex flex-col justify-between cursor-default hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-semibold text-slate-500 tracking-wide">{metric.label}</span>
                      <div className="bg-emerald-50/80 p-2.5 rounded-xl group-hover:bg-emerald-100/80 transition-colors duration-300">
                        {metric.icon}
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-emerald-950 transition-colors">{metric.value}</div>
                      {metric.trend && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className={`
                            ${metric.trend === 'up' || metric.trend === 'down' ? 'text-emerald-600' : 'text-slate-500'}
                          `}>
                            {metric.trendValue}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>'''

content = re.sub(
    r'              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">\n                \{METRICS\.map\(\(metric\) => \(.*?\)\)\}\n              </div>',
    cards_replace,
    content,
    flags=re.DOTALL
)

# 5. Map Render
map_replace = '''                <div className="flex-1 relative overflow-hidden bg-slate-100">
                  {/* SPARKFEST COMPLIANCE: Google Maps Platform Integration */}
                  <APIProvider apiKey="AIzaSyDRsOS4RXA2d0l8foUmFykK0L4-o7iOfd8">
                    <GoogleMap
                      defaultCenter={{ lat: 14.5995, lng: 120.9842 }} // Default to Manila
                      defaultZoom={11}
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      mapId="DEMO_MAP_ID"
                      className="w-full h-full"
                    >
                      {session?.role === 'driver' && activeRoute && (
                        <>
                          <RouteLine origin={activeRoute.origin} destination={activeRoute.destination} />
                          <AdvancedMarker position={activeRoute.origin}>
                            <Pin background={'#10b981'} glyphColor={'#fff'} borderColor={'#064e3b'} />
                          </AdvancedMarker>
                          <AdvancedMarker position={activeRoute.destination}>
                            <Pin background={'#ef4444'} glyphColor={'#fff'} borderColor={'#7f1d1d'} />
                          </AdvancedMarker>
                        </>
                      )}
                    </GoogleMap>
                  </APIProvider>
                  
                  {session?.role === 'driver' && !activeRoute && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
                      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm text-center">
                        <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active route</h3>
                        <p className="text-slate-500 text-center">Accept a new delivery dispatch from the Available Deliveries page to view live routing.</p>
                      </div>
                    </div>
                  )}
                </div>'''

content = re.sub(
    r'                <div className="flex-1 relative overflow-hidden bg-slate-100">.*?</div>\n              </div>',
    map_replace + '\n              </div>',
    content,
    flags=re.DOTALL
)

# 6. Feed Render
content = re.sub(
    r'\{AI_LIVE_FEED\.map\(\(item\) => \(',
    r'{feedItems.map((item) => (',
    content
)

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done.")
