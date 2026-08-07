# Hussein Mboya Tours repair tools

Run from the project root:

```bash
python audit_project.py --root .
python repair_project.py --root .
python verify_project.py --root .
```

The repair script is conservative and makes backups before changing files.

After that, verify the real application locally:

```bash
cd client
npm ci
npm run build
npm run lint

cd ../server
npm ci
npm start
```

A successful build does not prove MongoDB, M-Pesa, email, Cloudinary, OpenAI, or other external integrations are configured. Those need valid environment variables and runtime/integration tests.
