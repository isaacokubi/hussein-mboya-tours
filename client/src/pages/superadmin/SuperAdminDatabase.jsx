export default function SuperAdminDatabase() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Database Administration</h1>

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {["Database Status", "Backup Management", "Data Cleanup"].map(
          (item) => (
            <div
              key={item}
              className="
bg-white
shadow
rounded-xl
p-6
"
            >
              <h2 className="font-bold">{item}</h2>

              <p>Enterprise database controls</p>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
