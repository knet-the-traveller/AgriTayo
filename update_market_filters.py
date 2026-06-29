import re

with open('src/app/market/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
state_search = r'  const \[activeFilter, setActiveFilter\] = useState\(\'All\'\);'
state_replace = r'''  const [activeFilter, setActiveFilter] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');

  const clearFilters = () => {
    setActiveFilter('All');
    setFilterLocation('All Locations');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterPriceMin('');
    setFilterPriceMax('');
  };'''
content = re.sub(state_search, state_replace, content)

# 2. Extract locations
# We'll do this inline in the render

# 3. Update filteredListings logic
filter_search = r'  const filteredListings = allListings\.filter\(item => \{\n    if \(activeFilter === \'All\'\) return true;\n    if \(activeFilter === \'Vegetables\' && item\.category === \'Vegetable\'\) return true;\n    if \(activeFilter === \'Root Crops\' && item\.category === \'Root\'\) return true;\n    if \(activeFilter === \'Fruits\' && item\.category === \'Fruit\'\) return true;\n    if \(activeFilter === \'Grains\' && item\.category === \'Grain\'\) return true;\n    return false;\n  \}\);'

filter_replace = r'''  const filteredListings = allListings.filter(item => {
    // Category
    if (activeFilter !== 'All') {
      if (activeFilter === 'Vegetables' && item.category !== 'Vegetable') return false;
      if (activeFilter === 'Root Crops' && item.category !== 'Root') return false;
      if (activeFilter === 'Fruits' && item.category !== 'Fruit') return false;
      if (activeFilter === 'Grains' && item.category !== 'Grain') return false;
    }

    // Location
    if (filterLocation !== 'All Locations' && item.location !== filterLocation) return false;

    // Date
    if (filterDateFrom || filterDateTo) {
      const itemDate = new Date(item.harvestDate || item.harvest);
      if (filterDateFrom && itemDate < new Date(filterDateFrom)) return false;
      if (filterDateTo && itemDate > new Date(filterDateTo)) return false;
    }

    // Price
    if (filterPriceMin && item.price < parseFloat(filterPriceMin)) return false;
    if (filterPriceMax && item.price > parseFloat(filterPriceMax)) return false;

    return true;
  });

  const uniqueLocations = ['All Locations', ...Array.from(new Set(allListings.map(l => l.location).filter(Boolean)))];'''

content = re.sub(filter_search, filter_replace, content)

# 4. Add UI
ui_search = r'                  \{filter\}\n                </button>\n              \}\)\}\n            </div>'
ui_replace = r'''                  {filter}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
              {/* Location */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <select 
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none bg-slate-50 hover:bg-white transition-colors"
                  >
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Harvest Date */}
              <div className="flex-1 min-w-[280px]">
                <label className="block text-xs font-bold text-slate-600 mb-1">Harvest Date</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors text-slate-600"
                  />
                  <span className="text-slate-400 font-bold text-sm">to</span>
                  <input 
                    type="date" 
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors text-slate-600"
                  />
                </div>
              </div>

              {/* Price / kg */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-600 mb-1">Price per kg (₱)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={filterPriceMin}
                    onChange={(e) => setFilterPriceMin(e.target.value)}
                    className="flex-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors"
                  />
                  <span className="text-slate-400 font-bold text-sm">-</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                    className="flex-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button 
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors h-[38px] border border-transparent hover:border-rose-200"
              >
                Clear Filters
              </button>
            </div>'''
content = re.sub(ui_search, ui_replace, content)

with open('src/app/market/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Market Page!")
