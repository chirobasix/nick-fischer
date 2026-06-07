<?xml version="1.0" encoding="UTF-8"?>
<!--
  XSLT stylesheet for the sitemap files. Browsers apply this to render the XML
  as a styled HTML table — zero SEO value (search crawlers ignore XSL and read
  the raw XML), but useful when humans open a sitemap in a browser.

  Wired up via the `<?xml-stylesheet ?>` processing instruction that
  scripts/style-sitemap.mjs injects at the top of every sitemap after build.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,follow" />
        <title>XML Sitemap · Nick Fischer</title>
        <style>
          :root {
            --navy: #14253b;
            --brand: #2f6fb3;
            --brand-100: #e9f1f9;
            --gold: #e0a82e;
            --fg-1: #1f242c;
            --fg-2: #5a6573;
            --fg-3: #8a96a4;
            --bg-1: #fbfcfe;
            --bg-2: #f3f6fa;
            --border: #e3e8ef;
          }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            background: var(--bg-1);
            color: var(--fg-1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.5;
          }
          .wrap { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }
          header {
            display: flex; align-items: center; justify-content: space-between;
            gap: 24px; flex-wrap: wrap;
            padding: 0 0 24px 16px; border-bottom: 1px solid var(--border);
            border-left: 4px solid var(--gold);
          }
          h1 {
            font-size: 24px; font-weight: 800; letter-spacing: -0.01em;
            margin: 0; color: var(--navy);
          }
          .meta { font-size: 13px; color: var(--fg-2); }
          .meta strong { color: var(--brand); font-weight: 700; }
          .desc {
            font-size: 14px; color: var(--fg-2); margin: 16px 0 24px;
            max-width: 720px;
          }
          .desc code {
            background: var(--bg-2); padding: 2px 6px; border-radius: 4px;
            font-size: 12.5px; color: var(--brand);
          }
          table {
            width: 100%; border-collapse: collapse; margin-top: 8px;
            background: #fff; border: 1px solid var(--border); border-radius: 12px;
            overflow: hidden;
          }
          th {
            background: var(--bg-2); color: var(--fg-2);
            font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em;
            text-align: left; padding: 12px 16px; font-weight: 700;
            border-bottom: 1px solid var(--border);
          }
          td {
            padding: 12px 16px; border-bottom: 1px solid var(--border);
            font-size: 14px; vertical-align: top;
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: var(--bg-1); }
          td a { color: var(--brand); text-decoration: none; word-break: break-all; }
          td a:hover { text-decoration: underline; }
          .lastmod { color: var(--fg-3); font-size: 12.5px; font-variant-numeric: tabular-nums; }
          footer {
            margin-top: 32px; font-size: 12.5px; color: var(--fg-3);
            border-top: 1px solid var(--border); padding-top: 20px;
          }
          footer a { color: var(--brand); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <h1>
              <xsl:choose>
                <xsl:when test="sm:sitemapindex">XML Sitemap Index</xsl:when>
                <xsl:otherwise>XML Sitemap</xsl:otherwise>
              </xsl:choose>
            </h1>
            <div class="meta">
              <strong>
                <xsl:choose>
                  <xsl:when test="sm:sitemapindex"><xsl:value-of select="count(sm:sitemapindex/sm:sitemap)" /> sub-sitemaps</xsl:when>
                  <xsl:otherwise><xsl:value-of select="count(sm:urlset/sm:url)" /> URLs</xsl:otherwise>
                </xsl:choose>
              </strong>
            </div>
          </header>

          <p class="desc">
            <xsl:choose>
              <xsl:when test="sm:sitemapindex">
                This is the sitemap index for <code>nickfischer.me</code>. Each entry below is a sub-sitemap. Search engines fetch this index first, then each sub-sitemap.
              </xsl:when>
              <xsl:otherwise>
                The URLs below are pages on <code>nickfischer.me</code> eligible for indexing by search engines. The sitemap follows the <a href="https://www.sitemaps.org/protocol.html">sitemaps.org</a> protocol.
              </xsl:otherwise>
            </xsl:choose>
          </p>

          <xsl:if test="sm:sitemapindex">
            <table>
              <thead>
                <tr><th>Sitemap</th><th>Last Modified</th></tr>
              </thead>
              <tbody>
                <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                  <tr>
                    <td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td>
                    <td class="lastmod">
                      <xsl:choose>
                        <xsl:when test="sm:lastmod"><xsl:value-of select="sm:lastmod" /></xsl:when>
                        <xsl:otherwise>—</xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <xsl:if test="sm:urlset">
            <table>
              <thead>
                <tr><th>URL</th><th>Last Modified</th></tr>
              </thead>
              <tbody>
                <xsl:for-each select="sm:urlset/sm:url">
                  <tr>
                    <td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td>
                    <td class="lastmod">
                      <xsl:choose>
                        <xsl:when test="sm:lastmod"><xsl:value-of select="sm:lastmod" /></xsl:when>
                        <xsl:otherwise>—</xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <footer>
            Styled view of <a href="https://nickfischer.me">nickfischer.me</a>'s sitemap — this is for humans; search engines read the raw XML (View Source). Generated by Astro + <code>scripts/style-sitemap.mjs</code>.
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
