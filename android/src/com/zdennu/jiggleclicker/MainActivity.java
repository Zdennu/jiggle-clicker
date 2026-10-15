package com.zdennu.jiggleclicker;

import android.app.Activity;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    // ==================== UPDATE CONFIG ====================
    // Public itch.io page of the game (no API key, nothing secret in the APK). On launch the app reads the page,
    // finds the HTML5 embed folder (https://html-classic.itch.zone/html/<id>/), fetches its version.json and, if
    // newer than what it has, downloads index.html (single-file build) and loads it right away.
    static final String ITCH_PAGE_URL = "https://uumar.itch.io/jiggle-clicker";
    // Optional: any static folder with index.html + version.json (used instead of itch when non-empty, must end with '/').
    static final String UPDATE_BASE_URL = "";
    static final int CHECK_TIMEOUT_MS = 3000;   // no network / slow -> straight into the game
    // =======================================================

    private WebView web;
    private FrameLayout root;
    private LinearLayout splash;
    private ProgressBar bar;
    String pendingToast;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        root = new FrameLayout(this);
        root.setBackgroundColor(0xFFF8C8DC);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setBackgroundColor(0xFFF8C8DC);
        web.addJavascriptInterface(new Haptics(this), "AndroidHaptics");
        web.setWebViewClient(new ToastClient(this));
        root.addView(web);
        root.addView(splash = buildSplash());
        setContentView(root);
        immersive();
        new Thread(this::checkThenStart).start();
    }

    private LinearLayout buildSplash() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL); l.setGravity(Gravity.CENTER);
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[]{0xFFFFF1F6, 0xFFF8C8DC, 0xFFF2B3CB});
        l.setBackground(bg);
        TextView t = new TextView(this); t.setText("\u2665 Jiggle Clicker \u2665"); t.setTextSize(28); t.setTextColor(0xFFC2457A); t.setGravity(Gravity.CENTER);
        TextView u = new TextView(this); u.setText("Updating\u2026 \u2728"); u.setTextSize(16); u.setTextColor(0xFF8A2A52); u.setGravity(Gravity.CENTER); u.setPadding(0, 24, 0, 24);
        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100); bar.setIndeterminate(true);
        bar.setProgressTintList(ColorStateList.valueOf(0xFFE0507C)); bar.setProgressBackgroundTintList(ColorStateList.valueOf(Color.WHITE));
        bar.setIndeterminateTintList(ColorStateList.valueOf(0xFFE0507C));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams((int) (220 * getResources().getDisplayMetrics().density), LinearLayout.LayoutParams.WRAP_CONTENT);
        l.addView(t); l.addView(u); l.addView(bar, lp);
        l.setVisibility(View.GONE);   // only shown when an update is actually downloading
        return l;
    }

    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }
    private void immersive() {
        root.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }

    // ---- bundle selection: newest downloaded bundle, else the copy shipped in the APK ----
    private int bundledVersion() {
        try (InputStream in = getAssets().open("www/version.json")) { return new JSONObject(read(in)).optInt("version", 1); }
        catch (Exception e) { return 1; }
    }
    private File currentDir() {
        try { String v = read(new FileInputStream(new File(getFilesDir(), "www/current.txt"))).trim();
              File d = new File(getFilesDir(), "www/" + v);
              if (new File(d, "index.html").isFile() && Integer.parseInt(v) > bundledVersion()) return d; }
        catch (Exception ignored) {}
        return null;
    }
    private int activeVersion() { File d = currentDir(); return d == null ? bundledVersion() : Integer.parseInt(d.getName()); }
    private String startUrl() {
        File d = currentDir();
        return d != null ? "file://" + new File(d, "index.html").getAbsolutePath() : "file:///android_asset/www/index.html";
    }
    private void start() { runOnUiThread(() -> { web.loadUrl(startUrl()); splash.setVisibility(View.GONE); }); }

    // ---- launch-time update: quick check (<=3 s), download with progress, load the new version right away ----
    private void checkThenStart() {
        try {
            String base = UPDATE_BASE_URL.isEmpty() ? itchEmbedBase() : UPDATE_BASE_URL;
            if (base == null) { start(); return; }
            int ver = new JSONObject(new String(get(base + "version.json", null), "UTF-8")).getInt("version");
            if (ver <= activeVersion()) { start(); return; }
            runOnUiThread(() -> splash.setVisibility(View.VISIBLE));
            byte[] html = get(base + "index.html", p -> runOnUiThread(() -> { bar.setIndeterminate(false); bar.setProgress(p); }));
            String s = new String(html, "UTF-8");
            if (html.length < 10000 || !s.contains("<canvas")) { start(); return; }   // sanity: must be our game
            File root = new File(getFilesDir(), "www"), dst = new File(root, String.valueOf(ver));
            del(dst); dst.mkdirs();
            write(new File(dst, "index.html"), html);
            write(new File(dst, "version.json"), ("{\"version\":" + ver + "}").getBytes("UTF-8"));
            write(new File(root, "current.txt"), String.valueOf(ver).getBytes("UTF-8"));
            pendingToast = "Updated to v" + ver + " \u2728";
        } catch (Exception ignored) { /* offline, timeout or bad bundle: keep what we have */ }
        start();
    }

    // Finds the HTML5 embed folder on the public itch page, e.g. https://html-classic.itch.zone/html/12345678/
    private static String itchEmbedBase() {
        try {
            String page = new String(get(ITCH_PAGE_URL, null), "UTF-8").replace("&quot;", "\"").replace("\\/", "/");
            Matcher m = Pattern.compile("(https?:)?//[a-z0-9.-]*itch\\.zone/html/[0-9]+/").matcher(page);
            if (!m.find()) return null;
            String u = m.group(); return u.startsWith("//") ? "https:" + u : u;
        } catch (Exception e) { return null; }
    }

    private static byte[] get(String url, Progress pr) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(CHECK_TIMEOUT_MS); c.setReadTimeout(pr == null ? CHECK_TIMEOUT_MS : 20000); c.setUseCaches(false);
        c.setRequestProperty("User-Agent", "JiggleClicker-Android");
        if (c.getResponseCode() != 200) throw new IOException("HTTP " + c.getResponseCode());
        int len = c.getContentLength();
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[16384]; int last = -1;
            for (int n; (n = in.read(b)) > 0; ) { o.write(b, 0, n);
                if (pr != null && len > 0) { int p = (int) (100L * o.size() / len); if (p != last) { last = p; pr.on(p); } } }
            return o.toByteArray();
        }
    }
    private static void write(File f, byte[] d) throws IOException { try (FileOutputStream o = new FileOutputStream(f)) { o.write(d); } }
    private static String read(InputStream in) throws IOException { ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[8192]; for (int n; (n = in.read(b)) > 0; ) o.write(b, 0, n); in.close(); return o.toString("UTF-8"); }
    private static void del(File f) { if (f.isDirectory()) for (File c : f.listFiles()) del(c); f.delete(); }
}
