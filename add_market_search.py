import re

with open('src/app/market/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state and update clearFilters
state_search = r'''  const \[filterPriceMax, setFilterPriceMax\] = useState\(''\);

  const clearFilters = \(\) => \{
    setActiveFilter\('All'\);
    setFilterLocation\('All Locations'\);
    setFilterDateFrom\(''\);
    setFilterDateTo\(''\);
    setFilterPriceMin\(''\);
    setFilterPriceMax\(''\);
  \};'''

state_replace = r'''  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setActiveFilter('All');
    setFilterLocation('All Locations');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setSearchQuery('');
  };'''

content = re.sub(state_search, state_replace, content)


# 2. Update filtering logic
filter_search = r'''  const filteredListings = allListings\.filter\(item => \{
    \/\/ Category'''

filter_replace = r'''  const filteredListings = allListings.filter(item => {
    // Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = item.crop?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query);
      const matchFarmer = item.farmer?.toLowerCase().includes(query) || item.sellerName?.toLowerCase().includes(query);
      const matchCoop = item.coop?.toLowerCase().includes(query) || item.cooperative?.toLowerCase().includes(query);
      if (!matchName && !matchFarmer && !matchCoop) return false;
    }

    // Category'''

content = re.sub(filter_search, filter_replace, content)


# 3. Update UI
ui_search = r'''            \{\/\* Advanced Filters \*\/\}\n            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end mb-2">'''

ui_replace = r'''            {/* Advanced Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4 mb-2">
              {/* Search Bar */}
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search crops, farmers, cooperatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 hover:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-wrap gap-4 items-end">'''

content = re.sub(ui_search, ui_replace, content)

ui_close_search = r'''              </button>\n            </div>\n\n            \{\/\* Listings Grid \*\/\}\n            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'''
ui_close_replace = r'''              </button>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'''

content = re.sub(ui_close_search, ui_close_replace, content)

with open('src/app/market/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added market search filter!")
