package com.zdennu.jiggleclicker;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import org.json.JSONArray;

/** navigator.vibrate(ms | [pattern]) -> Vibrator (exposed to JS as window.AndroidHaptics). */
public class Haptics {
    private final Context ctx;
    public Haptics(Context c) { ctx = c; }
    @JavascriptInterface public void vibrate(String json) {
        try {
            Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null || !v.hasVibrator()) return;
            long[] p;
            Object o = new JSONArray("[" + json + "]").get(0);
            if (o instanceof JSONArray) { JSONArray a = (JSONArray) o; p = new long[a.length() + 1]; for (int i = 0; i < a.length(); i++) p[i + 1] = a.getLong(i); }
            else p = new long[]{0, ((Number) o).longValue()};
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(p, -1)); else v.vibrate(p, -1);
        } catch (Exception ignored) {}
    }
}
