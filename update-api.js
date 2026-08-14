const fs = require('fs');
const files = [
  { path: 'src/app/api/videos/route.ts', model: 'video' },
  { path: 'src/app/api/tasks/route.ts', model: 'task' },
  { path: 'src/app/api/events/route.ts', model: 'event' },
  { path: 'src/app/api/rooms/route.ts', model: 'room' },
  { path: 'src/app/api/official-links/route.ts', model: 'officialLink' }
];

for (const f of files) {
  if (fs.existsSync(f.path)) {
    let content = fs.readFileSync(f.path, 'utf8');
    if (!content.includes('export async function DELETE')) {
      const append = `\nexport async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  try {
    await db.${f.model}.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Delete failed' }, { status: 500 });
  }
}\n`;
      fs.appendFileSync(f.path, append);
      console.log('Added to ' + f.path);
    }
  }
}
