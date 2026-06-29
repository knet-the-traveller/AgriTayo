import glob, re, os

files = glob.glob('src/app/**/*.tsx', recursive=True) + ['src/components/Dashboard.tsx']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'navItems =' not in content:
        continue
        
    print(f'Modifying {f}...')
    
    # 1. Inject Truck, Package into lucide-react imports if not present
    if 'Truck' not in content:
        content = re.sub(r'(import \{[^}]*?)( \}\s+from\s+[\'\"`]lucide-react[\'\"`])', r'\1, Truck, Package\2', content)
    elif 'Package' not in content:
        content = re.sub(r'(import \{[^}]*?)( \}\s+from\s+[\'\"`]lucide-react[\'\"`])', r'\1, Package\2', content)
        
    # 2. Add state variables below pendingOrdersCount
    state_injection = '''  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);'''
    
    if 'availableDeliveriesCount' not in content:
        content = re.sub(
            r'(const \[pendingOrdersCount, setPendingOrdersCount\] = useState\(0\);)',
            r'\1\n' + state_injection,
            content
        )
        
    # 3. Add logic to useEffect
    logic_injection = '''      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);'''
      
    if 'setAvailableDeliveriesCount(available.length)' not in content:
        content = re.sub(
            r'(setPendingOrdersCount\(pending\.length\);)',
            r'\1\n' + logic_injection,
            content
        )
        
    # 4. Update navItems definition
    new_nav = '''  const navItems = [
    { name: 'Dashboard Overview', icon: LayoutDashboard, href: '/' },
    ...(session?.role !== 'driver' ? [{ name: 'Market', icon: Store, href: '/market' }] : []),
    ...(session?.role === 'seller' ? [{ name: 'Post Harvest', icon: Sprout, href: '/post-harvest' }] : []),
    ...(session?.role === 'buyer' ? [{ name: 'My Orders', icon: ShoppingBag, href: '/my-orders' }] : []),
    ...(session?.role === 'driver' ? [
      { name: 'Available Deliveries', icon: Truck, href: '/available-deliveries' },
      { name: 'My Deliveries', icon: Package, href: '/my-deliveries' }
    ] : []),
    { name: 'Live Tracking', icon: MapIcon, href: '/live-tracking' },
    { name: 'Analytics', icon: BarChart3, href: '/analytics' },
    ...(session?.role === 'superadmin' ? [{ name: 'System Settings', icon: Settings, href: '/system-settings' }] : []),
    ...(session && session.role !== 'superadmin' ? [{ name: 'Profile', icon: User, href: '/profile' }] : []),
  ];'''
  
    content = re.sub(
        r'const navItems = \[\s*\{ name: \'Dashboard Overview\'.*?\];',
        new_nav,
        content,
        flags=re.DOTALL
    )
    
    # 5. Add badges in the render portion
    badges_injection = '''                    {item.name === 'My Orders' && pendingOrdersCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {pendingOrdersCount}
                      </span>
                    )}
                    {item.name === 'Available Deliveries' && availableDeliveriesCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {availableDeliveriesCount}
                      </span>
                    )}
                    {item.name === 'My Deliveries' && activeDeliveriesCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {activeDeliveriesCount}
                      </span>
                    )}'''
                    
    content = re.sub(
        r'\{item\.name === \'My Orders\'.*?\{pendingOrdersCount\}.*?</span>\s*\}',
        badges_injection,
        content,
        flags=re.DOTALL
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Done.')
