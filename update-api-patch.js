const fs = require('fs');
const files = [
  { path: 'src/app/api/tasks/route.ts', model: 'task' },
  { path: 'src/app/api/events/route.ts', model: 'event' },
  { path: 'src/app/api/rooms/route.ts', model: 'room' }
];

for (const f of files) {
  if (fs.existsSync(f.path)) {
    let content = fs.readFileSync(f.path, 'utf8');
    if (!content.includes('export async function PATCH')) {
      const append = `\nexport async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  const body = await req.json();
  try {
    const updated = await db.${f.model}.update({ where: { id }, data: body });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Update failed' }, { status: 500 });
  }
}\n`;
      fs.appendFileSync(f.path, append);
      console.log('Added PATCH to ' + f.path);
    }
  }
}
