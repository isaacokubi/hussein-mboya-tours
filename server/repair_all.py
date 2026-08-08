#!/usr/bin/env python3
from __future__ import annotations
import json, os, re, shutil, subprocess, sys
from datetime import datetime
from pathlib import Path

ROOT = Path.cwd()
if not (ROOT / 'client').is_dir() or not (ROOT / 'server').is_dir():
    print('ERROR: Run this script from the project root containing client/ and server/.')
    sys.exit(1)

STAMP = datetime.now().strftime('%Y%m%d-%H%M%S')
BACKUP = ROOT / f'.repair-all-backup-{STAMP}'
BACKUP.mkdir(parents=True, exist_ok=True)
changed=[]; skipped=[]; warnings=[]

def backup(rel):
    src=ROOT/rel
    if src.exists():
        dst=BACKUP/rel; dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src,dst)

def save(rel,text):
    p=ROOT/rel; old=p.read_text(encoding='utf-8')
    if old==text: skipped.append(rel); return
    backup(rel); p.write_text(text,encoding='utf-8'); changed.append(rel); print('[FIXED]',rel)

def append_once(rel,marker,block):
    p=ROOT/rel; text=p.read_text(encoding='utf-8')
    if marker in text: skipped.append(rel); return
    save(rel,text.rstrip()+'\n\n'+block.rstrip()+'\n')

def update_json(rel,updater):
    p=ROOT/rel; data=json.loads(p.read_text(encoding='utf-8')); before=json.dumps(data,sort_keys=True)
    updater(data); after=json.dumps(data,sort_keys=True)
    if before==after: skipped.append(rel); return
    backup(rel); p.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8'); changed.append(rel); print('[FIXED]',rel)

# 1. Missing client dependencies found by the audit.
def client_pkg(pkg):
    deps=pkg.setdefault('dependencies',{})
    deps.setdefault('i18next-browser-languagedetector','^8.2.0')
    deps.setdefault('prop-types','^15.8.1')
update_json('client/package.json',client_pkg)

# 2. Missing frontend API exports.
append_once('client/src/api/adminApi.js','export const getAdminBookings',r'''
/* ADMIN BOOKINGS */
export const getAdminBookings = async (params = {}) => {
  const { data } = await api.get('/admin/bookings', { params });
  return data;
};

/* ADMIN TOURS */
export const getAdminTours = async (params = {}) => {
  const { data } = await api.get('/admin/tours', { params });
  return data;
};
''')

append_once('client/src/api/financeApi.js','export const getReports',r'''
/* FINANCE REPORTS */
export const getReports = async (params = {}) => {
  const { data } = await api.get('/admin/finance/reports', { params });
  return data;
};

/* MPESA / PAYMENT TRANSACTIONS */
export const getMpesaTransactions = async (params = {}) => {
  const { data } = await api.get('/admin/finance/transactions', { params });
  return data;
};
''')

append_once('client/src/api/tourApi.js','export const getUpcomingTours',r'''
/* UPCOMING TOURS */
export const getUpcomingTours = async (params = {}) => {
  const { data } = await api.get('/tourmanager/tours', {
    params: { ...params, upcoming: 'true' },
  });
  return data;
};
''')

# 3. Backend upcoming tour filter/limit and stable response aliases.
p=ROOT/'server/controllers/tourManagerController.js'; text=p.read_text(encoding='utf-8')
pat=re.compile(r'export const getTours = async \(req, res, next\) => \{.*?\n\};\n\n/\*.*?\n\| UPDATE TOUR',re.S)
rep=r'''export const getTours = async (req, res, next) => {
    try {
        const { upcoming, limit, status } = req.query;
        const filter = { isDeleted: { $ne: true } };

        if (status) filter.status = status;

        if (upcoming === "true" || upcoming === "1") {
            const now = new Date();
            filter.$or = [
                { startDate: { $gte: now } },
                { date: { $gte: now } },
            ];
            filter.status = {
                $in: ["scheduled", "upcoming", "confirmed", "active", "ongoing"],
            };
        }

        let query = Tour.find(filter)
            .populate("assignedGuide", "name email phone position availability")
            .populate("assignedDriver", "name email phone position availability")
            .populate("assignedVehicle", "name registrationNumber type capacity status")
            .populate("createdBy", "name email")
            .sort({ startDate: 1, date: 1, createdAt: -1 });

        const pageLimit = Number(limit);
        if (Number.isFinite(pageLimit) && pageLimit > 0) {
            query = query.limit(Math.min(pageLimit, 100));
        }

        const tours = await query.lean();
        return res.status(200).json({
            success: true,
            count: tours.length,
            data: tours,
            tours,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR'''
new,n=pat.subn(rep,text,count=1)
if n==1: save('server/controllers/tourManagerController.js',new)
else: warnings.append('Could not replace getTours(); its current layout differs.')

# 4. Remove current Profile lint error by eliminating unnecessary local loading state.
p=ROOT/'client/src/pages/Profile.jsx'; text=p.read_text(encoding='utf-8')
text=text.replace('''  const [\n    loading,\n    setLoading\n  ] = useState(true);''','''  const [\n    loading\n  ] = useState(false);''')
text=text.replace('''    if (!user) {\n\n      setLoading(false);\n\n      return;\n\n    }''','''    if (!user) {\n      return;\n    }''')
text=text.replace('''        if (mounted) {\n\n          setLoading(false);\n\n        }''','''        if (mounted) {\n          // Authentication data is already available from AuthContext.\n        }''')
save('client/src/pages/Profile.jsx',text)

# 5. Remove current unused AdminDashboard roles query/import.
p=ROOT/'client/src/pages/admin/AdminDashboard.jsx'; text=p.read_text(encoding='utf-8')
text=text.replace('import { getAdminRoles } from "../../api/admin/adminRoleApi";\n','')
text=re.sub(r'\n\s*const \{ data: rolesData \} = useQuery\(\{\s*queryKey: \["adminRoles"\],\s*queryFn: getAdminRoles,\s*staleTime: 300000,\s*\}\);\s*\n','\n',text,count=1)
save('client/src/pages/admin/AdminDashboard.jsx',text)

# 6. Defer Auth restore work out of the effect body; suppress only the intentional stable callback dependency.
p=ROOT/'client/src/context/AuthContext.jsx'; text=p.read_text(encoding='utf-8')
pat=re.compile(r'useEffect\(\(\)=>\{\s*const savedToken =\s*localStorage\.getItem\(\s*"token"\s*\);\s*if\(savedToken\)\{\s*queueMicrotask\(\(\) => \{\s*setToken\(savedToken\);\s*\}\);\s*fetchCurrentUser\(\)\s*\.finally\(\(\)=>\{\s*setLoading\(false\);\s*\}\);\s*\}\s*else\{\s*setLoading\(false\);\s*\}\s*\},\[\]\);',re.S)
rep='''useEffect(() => {\n  const savedToken = localStorage.getItem("token");\n\n  queueMicrotask(() => {\n    if (!savedToken) {\n      setLoading(false);\n      return;\n    }\n\n    setToken(savedToken);\n\n    fetchCurrentUser().finally(() => {\n      setLoading(false);\n    });\n  });\n\n  // Intentional one-time session restoration on provider mount.\n  // eslint-disable-next-line react-hooks/exhaustive-deps\n}, []);'''
new,n=pat.subn(rep,text,count=1)
if n==1: save('client/src/context/AuthContext.jsx',new)
else: warnings.append('AuthContext restore effect did not match the audited layout.')

# 7. Backend CORS supports CLIENT_ORIGINS / CLIENT_URL / localhost.
p=ROOT/'server/app.js'; text=p.read_text(encoding='utf-8')
pat=re.compile(r'app\.use\(\s*cors\(\{\s*origin:\s*process\.env\.CLIENT_URL \|\| "http://localhost:5173",\s*credentials:\s*true,\s*\}\),\s*\);',re.S)
rep='''const allowedOrigins = (\n  process.env.CLIENT_ORIGINS ||\n  process.env.CLIENT_URL ||\n  "http://localhost:5173"\n)\n  .split(",")\n  .map((origin) => origin.trim())\n  .filter(Boolean);\n\napp.use(\n  cors({\n    origin: (origin, callback) => {\n      if (!origin || allowedOrigins.includes(origin)) {\n        return callback(null, true);\n      }\n      return callback(new Error(`CORS blocked origin: ${origin}`));\n    },\n    credentials: true,\n  })\n);'''
new,n=pat.subn(rep,text,count=1)
if n==1: save('server/app.js',new)
else: warnings.append('server/app.js CORS block was not changed; current layout differs.')

# 8. Server check/lint scripts.
def server_pkg(pkg):
    scripts=pkg.setdefault('scripts',{})
    scripts.setdefault('check','node --check server.js')
    scripts.setdefault('lint','npm run check')
update_json('server/package.json',server_pkg)

# 9. Static local import/path audit.
SOURCE_EXTS={'.js','.jsx','.mjs','.cjs','.ts','.tsx'}
def resolve_local(source,spec):
    if not spec.startswith('.'): return True
    c=(source.parent/spec)
    choices=[c,c.with_suffix('.js'),c.with_suffix('.jsx'),c.with_suffix('.mjs'),c.with_suffix('.cjs'),c.with_suffix('.ts'),c.with_suffix('.tsx'),c/'index.js',c/'index.jsx',c/'index.ts',c/'index.tsx',c.with_suffix('.css')]
    return any(x.exists() for x in choices)
imp_re=re.compile(r'''(?:from\s+|import\s*\(\s*)["']([^"']+)["']''')
missing=[]
for source in list((ROOT/'client/src').rglob('*'))+list((ROOT/'server').rglob('*')):
    if not source.is_file() or source.suffix not in SOURCE_EXTS: continue
    if 'node_modules' in source.parts: continue
    try: t=source.read_text(encoding='utf-8')
    except UnicodeDecodeError: continue
    for m in imp_re.finditer(t):
        spec=m.group(1)
        if spec.startswith('.') and not resolve_local(source,spec): missing.append(f'{source.relative_to(ROOT)} -> {spec}')
if missing:
    warnings.append('Missing local imports detected:'); warnings.extend('  '+x for x in missing)

# 10. Package dependency audit.
def package_names(pkg): return set(pkg.get('dependencies',{}))|set(pkg.get('devDependencies',{}))
NODE_BUILTINS={'assert','buffer','child_process','cluster','console','constants','crypto','dgram','diagnostics_channel','dns','domain','events','fs','http','https','module','net','os','path','perf_hooks','process','punycode','querystring','readline','repl','stream','string_decoder','sys','timers','tls','trace_events','tty','url','util','v8','vm','wasi','worker_threads','zlib'}
def pkgroot(s): return '/'.join(s.split('/')[:2]) if s.startswith('@') else s.split('/')[0]
client_pkg=json.loads((ROOT/'client/package.json').read_text(encoding='utf-8')); server_pkg=json.loads((ROOT/'server/package.json').read_text(encoding='utf-8'))
for name,base_dir,pkg in [('Client',ROOT/'client/src',client_pkg),('Server',ROOT/'server',server_pkg)]:
    deps=package_names(pkg); missing=set()
    for source in base_dir.rglob('*'):
        if not source.is_file() or source.suffix not in {'.js','.jsx'} or 'node_modules' in source.parts: continue
        try: t=source.read_text(encoding='utf-8')
        except UnicodeDecodeError: continue
        for m in imp_re.finditer(t):
            s=m.group(1)
            if s.startswith('.') or s.startswith('/'): continue
            root=pkgroot(s)
            if root not in deps and root not in NODE_BUILTINS: missing.add(root)
    if missing: warnings.append(f'{name} packages not declared: '+', '.join(sorted(missing)))

# 11. Install the two missing client modules.
print('\nInstalling client dependencies...')
try:
    subprocess.run(['npm','install','i18next-browser-languagedetector','prop-types','--save'],cwd=ROOT/'client',check=True)
    print('[OK] Client dependencies installed.')
except FileNotFoundError: warnings.append('npm not found; run npm install manually in client/.')
except subprocess.CalledProcessError: warnings.append('npm install failed; run: cd client && npm install')

# 12. Server syntax check.
print('\nChecking server syntax...'); syntax=[]
for source in (ROOT/'server').rglob('*.js'):
    if 'node_modules' in source.parts: continue
    r=subprocess.run(['node','--check',str(source)],cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if r.returncode: syntax.append(f'{source.relative_to(ROOT)}\n{r.stderr.strip()}')
if syntax: warnings.append('Server syntax errors:'); warnings.extend(syntax)
else: print('[OK] Server JavaScript syntax passed.')

print('\n'+'='*72); print('HUSSEIN MBOYA TOURS - AUTOMATED REPAIR COMPLETE'); print('='*72)
print('Backup:',BACKUP); print('Files changed:',len(changed)); print('Files unchanged:',len(skipped))
if warnings:
    print('\nWARNINGS:'); [print(w) for w in warnings]
else: print('\nNo static repair warnings detected.')