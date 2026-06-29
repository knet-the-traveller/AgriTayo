import re

with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add AlertTriangle to imports
if 'AlertTriangle' not in content:
    content = re.sub(
        r'(\nimport \{.*?)(\n\} from \'lucide-react\';)',
        r'\1, AlertTriangle\2',
        content,
        flags=re.DOTALL
    )

# 2. Add activeDeliveries state
state_search = r'const \[activeDeliveriesCount, setActiveDeliveriesCount\] = useState\(0\);'
state_replace = r'''const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);'''

if 'const [activeDeliveries, setActiveDeliveries]' not in content:
    content = re.sub(state_search, state_replace, content)

# 3. Update useEffect to set activeDeliveries
effect_search = r'setActiveDeliveriesCount\(activeForDriver\.length\);'
effect_replace = r'''setActiveDeliveriesCount(activeForDriver.length);
      setActiveDeliveries(activeForDriver);'''

if 'setActiveDeliveries(activeForDriver)' not in content:
    content = re.sub(effect_search, effect_replace, content)

# 4. Add driverAlerts right below feedItems definition
driver_alerts = '''
  const driverAlerts = feedItems
    .filter(item => item.severity === 'high' || item.severity === 'medium')
    .slice(0, 5);'''

if 'const driverAlerts' not in content:
    content = re.sub(
        r'(: AI_LIVE_FEED;)',
        r'\1' + driver_alerts,
        content
    )

# 5. Replace the bottom section entirely
bottom_section_search = r'\{\/\* Bottom Section - Analytics & Trends \*\/\}'

driver_panels = '''            {/* Bottom Section - Role Based */}
            {session?.role === 'driver' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                
                {/* Driver Panel 1: My Active Deliveries */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-600" />
                      My Active Deliveries
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {activeDeliveries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Truck className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No active deliveries</p>
                      </div>
                    ) : (
                      activeDeliveries.map((delivery) => (
                        <div key={delivery.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-800 text-sm">{delivery.crop} <span className="text-slate-500 font-normal">({delivery.quantity}kg)</span></div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                              {delivery.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="truncate max-w-[120px]">{delivery.pickupLocation || 'Farm'}</span>
                            <span className="text-slate-300 mx-1">→</span>
                            <span className="truncate max-w-[120px]">{delivery.deliveryLocation || 'Market'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Driver Panel 2: Recent Logistics Alerts */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-emerald-600" />
                      Recent Logistics Alerts
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {driverAlerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50 text-emerald-400" />
                        <p className="text-sm font-medium">No recent alerts</p>
                      </div>
                    ) : (
                      driverAlerts.map((alert) => (
                        <div key={alert.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              alert.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {alert.severity === 'high' ? 'URGENT' : 'WARNING'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{alert.timestamp}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
'''

# The rest of the content after `Bottom Section - Analytics & Trends` is preserved, we just need to replace the start and end of that block.
# Since we are wrapping it in a ternary, we need to find the end of the `div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6"` block.
# It ends with:
#               </div>
#             </div>
#           </div>
#         </main>
content = re.sub(
    r'\{\/\* Bottom Section - Analytics & Trends \*\/.*?<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">',
    driver_panels,
    content,
    flags=re.DOTALL
)

# And close the ternary right before `</div>\n          </div>\n        </main>`
content = re.sub(
    r'(              </div>\n\n            </div>\n\n          </div>\n        </main>)',
    r'            )}\n\n\1',
    content
)

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Dashboard bottom section.")
