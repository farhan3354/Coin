 = @(
    @{ path="src\app\api\videos\route.ts"; model="video" },
    @{ path="src\app\api\tasks\route.ts"; model="task" },
    @{ path="src\app\api\events\route.ts"; model="event" },
    @{ path="src\app\api\rooms\route.ts"; model="room" },
    @{ path="src\app\api\official-links\route.ts"; model="officialLink" }
)

foreach ( in ) {
    if (Test-Path .path) {
         = Get-Content .path -Raw
        if ( -notmatch "export async function DELETE") {
             = "
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  try {
    await db..delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Delete failed' }, { status: 500 });
  }
}
"
            Add-Content -Path .path -Value 
            Write-Host "Added DELETE to "
        } else {
            Write-Host "DELETE already exists in "
        }
    } else {
        Write-Host "File not found: "
    }
}
