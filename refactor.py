import os
import re

directories = ['app', 'components']

size_map = {
    r'text-\[9px\]': 'text-xs',
    r'text-\[10px\]': 'text-sm',
    r'text-\[11px\]': 'text-base',
    r'text-\[12px\]': 'text-base',
    r'text-\[13px\]': 'text-lg',
    r'text-\[15px\]': 'text-xl',
    r'w-5 h-5': 'w-8 h-8',
    r'w-1\.5 h-1\.5': 'w-3 h-3',
    r'w-2\.5': 'w-4',
    r'w-60': 'w-80',
    r'w-52': 'w-72',
    r'gap-1\.5': 'gap-3',
    r'gap-1': 'gap-2',
    r'gap-2': 'gap-4',
    r'gap-3': 'gap-6',
    r'gap-4': 'gap-8',
}

pad_map = {
    r'\bpx-1\b': 'px-2',
    r'\bpx-2\b': 'px-4',
    r'\bpx-3\b': 'px-6',
    r'\bpx-4\b': 'px-8',
    r'\bpx-5\b': 'px-10',
    r'\bpx-6\b': 'px-12',
    r'\bpy-0\.5\b': 'py-1',
    r'\bpy-1\b': 'py-2',
    r'\bpy-1\.5\b': 'py-3',
    r'\bpy-2\b': 'py-4',
    r'\bpy-2\.5\b': 'py-5',
    r'\bpy-3\b': 'py-6',
    r'\bpy-4\b': 'py-8',
    r'\bpy-5\b': 'py-10',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # Text sizes and specific dimensions
    for k, v in size_map.items():
        content = re.sub(k, v, content)
        
    # Paddings/Margins
    for k, v in pad_map.items():
        content = re.sub(k, v, content)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                process_file(os.path.join(root, f))
