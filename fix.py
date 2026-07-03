import os
import re

directories = ['app', 'components']

fix_map = {
    r'\bpy-8\.5\b': 'py-2',
    r'\bpy-4\.5\b': 'py-1.5',
    r'\bpy-10\b': 'py-3',
    r'\bpy-6\b': 'py-3',
    r'\bpx-12\b': 'px-4',
    r'\bpx-8\b': 'px-4',
    r'\bgap-8\b': 'gap-3',
    r'\bgap-12\b': 'gap-4',
    r'\bgap-24\b': 'gap-6',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    for k, v in fix_map.items():
        content = re.sub(k, v, content)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                process_file(os.path.join(root, f))
