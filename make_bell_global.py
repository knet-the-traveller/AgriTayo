import os
import glob
import re

files_to_check = glob.glob('src/app/**/*.tsx', recursive=True)

# Pattern for the bell button. 
# Sometimes it has a span badge, sometimes it doesn't.
bell_pattern1 = r'''            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">\n              <Bell className="w-5 h-5" />\n              <span className="absolute top-1\.5 right-1\.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />\n            </button>'''

bell_pattern2 = r'''            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">\n              <Bell className="w-5 h-5" />\n            </button>'''

bell_replace = r'''            <NotificationBell role={session?.role} />'''

for file_path in files_to_check:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Replace bell patterns
    content = re.sub(bell_pattern1, bell_replace, content)
    content = re.sub(bell_pattern2, bell_replace, content)
    
    # If we made a replacement and there is no import, add it
    if content != original_content and 'NotificationBell' in content and 'import NotificationBell' not in content:
        # Add import after import React
        import_replace = r"import React, { useState, useEffect } from 'react';\nimport NotificationBell from '../../components/NotificationBell';"
        content = content.replace("import React, { useState, useEffect } from 'react';", import_replace)
        
        # If it just uses import React
        import_replace_2 = r"import React from 'react';\nimport NotificationBell from '../../components/NotificationBell';"
        content = content.replace("import React from 'react';", import_replace_2)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated bell across all pages!")
