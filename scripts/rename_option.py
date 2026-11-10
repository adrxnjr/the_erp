with open('frontend/src/components/Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = "{ to: '/reports', label: 'Bonafide & Certificates', icon: FileCheck },"
replacement = "{ to: '/reports', label: 'Reports & Analytics', icon: FileSpreadsheet },"

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/components/Sidebar.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Renamed option to Reports & Analytics successfully!")
else:
    print("Target not found!")

