// Cloudflare Pages Function middleware.
//
// Redirect the project's production .pages.dev alias to the real domain so the
// site has a single canonical home. Everything else — the custom domain
// (nickfischer.me) and per-deploy preview URLs (<hash>.nick-fischer.pages.dev) —
// passes through untouched. Runs at the edge; ships no client JS, and (unlike an
// advanced-mode _worker.js) leaves public/_headers and public/_redirects intact.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'nick-fischer.pages.dev') {
    url.hostname = 'nickfischer.me';
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
