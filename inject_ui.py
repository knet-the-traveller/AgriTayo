import re

with open('src/app/market/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

ui_search = r'''            \{\/\* Filter Bar \*\/\}\n            <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">\n              \{filters\.map\(filter => \(\n                <button\n                  key=\{filter\}\n                  onClick=\{\(\) => setActiveFilter\(filter\)\}\n                  className=\{\`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all \$\{\n                    activeFilter === filter\n                      \? \'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm\'\n                      : \'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:shadow-sm\'\n                  \}\`\}\n                >\n                  \{filter\}\n                </button>\n              \)\)\}\n            </div>'''

ui_replace = r'''            {/* Filter Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === filter
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end mb-2">
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

print("Injected the UI correctly!")
