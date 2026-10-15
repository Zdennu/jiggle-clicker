package com.zdennu.jiggleclicker;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class MainActivity extends Activity {
    // ==================== UPDATE CONFIG ====================
    // Base URL of the hosted web bundle (must end with '/'). The app fetches UPDATE_BASE_URL + "version.json":
    //   {"version": 2, "zip": "bundle-2.zip", "sha256": "<hex, optional>"}
    // and, if newer than what it has, downloads the zip (index.html + version.json at its root), verifies it,
    // unpacks it to private storage and uses it from the next launch. Empty string = updates disabled.
    static final String UPDATE_BASE_URL = "";
    // =======================================================

    private WebView web;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setBackgroundColor(0xFFF8C8DC);
        web.addJavascriptInterface(new Haptics(this), "AndroidHaptics");
        setContentView(web);
        immersive();
        web.loadUrl(startUrl());
        if (!UPDATE_BASE_URL.isEmpty()) new Thread(this::checkUpdate).start();
    }

    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }

    private void immersive() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }

    // ---- bundle selection: newest valid downloaded bundle, else the copy shipped in the APK ----
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

    private void checkUpdate() {
        try {
            JSONObject v = new JSONObject(new String(get(UPDATE_BASE_URL + "version.json"), "UTF-8"));
            int ver = v.getInt("version");
            if (ver <= activeVersion()) return;
            byte[] zip = get(UPDATE_BASE_URL + v.optString("zip", "bundle-" + ver + ".zip"));
            String want = v.optString("sha256", "");
            if (!want.isEmpty() && !want.equalsIgnoreCase(sha256(zip))) return;
            File root = new File(getFilesDir(), "www"), tmp = new File(root, "tmp"), dst = new File(root, String.valueOf(ver));
            del(tmp); tmp.mkdirs();
            unzip(zip, tmp);
            if (!new File(tmp, "index.html").isFile()) { del(tmp); return; }
            del(dst);
            if (!tmp.renameTo(dst)) return;
            try (FileOutputStream o = new FileOutputStream(new File(root, "current.txt"))) { o.write(String.valueOf(ver).getBytes("UTF-8")); }
            runOnUiThread(() -> Toast.makeText(this, "Update downloaded \u2728 restart to apply", Toast.LENGTH_LONG).show());
        } catch (Exception ignored) { /* offline or bad bundle: keep current */ }
    }

    private static byte[] get(String url) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(8000); c.setReadTimeout(20000); c.setUseCaches(false);
        if (c.getResponseCode() != 200) throw new IOException("HTTP " + c.getResponseCode());
        try (InputStream in = c.getInputStream()) { ByteArrayOutputStream o = new ByteArrayOutputStream(); copy(in, o); return o.toByteArray(); }
    }
    private static void unzip(byte[] zip, File dir) throws IOException {
        String base = dir.getCanonicalPath() + File.separator;
        try (ZipInputStream z = new ZipInputStream(new ByteArrayInputStream(zip))) {
            for (ZipEntry e; (e = z.getNextEntry()) != null; ) {
                File f = new File(dir, e.getName());
                if (!f.getCanonicalPath().startsWith(base)) throw new IOException("bad entry");   // zip-slip guard
                if (e.isDirectory()) { f.mkdirs(); continue; }
                f.getParentFile().mkdirs();
                try (FileOutputStream o = new FileOutputStream(f)) { copy(z, o); }
            }
        }
    }
    private static void copy(InputStream in, OutputStream o) throws IOException { byte[] b = new byte[16384]; for (int n; (n = in.read(b)) > 0; ) o.write(b, 0, n); }
    private static String read(InputStream in) throws IOException { ByteArrayOutputStream o = new ByteArrayOutputStream(); copy(in, o); in.close(); return o.toString("UTF-8"); }
    private static String sha256(byte[] d) throws Exception { StringBuilder s = new StringBuilder(); for (byte x : MessageDigest.getInstance("SHA-256").digest(d)) s.append(String.format("%02x", x)); return s.toString(); }
    private static void del(File f) { if (f.isDirectory()) for (File c : f.listFiles()) del(c); f.delete(); }

}
