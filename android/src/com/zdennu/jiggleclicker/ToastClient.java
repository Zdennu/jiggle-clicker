package com.zdennu.jiggleclicker;

import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;

/** After the game page loads, shows the pending 'Updated to vN' toast through window.jcToast. */
public class ToastClient extends WebViewClient {
    private final MainActivity a;
    public ToastClient(MainActivity a) { this.a = a; }
    @Override public void onPageFinished(WebView v, String url) {
        if (a.pendingToast == null) return;
        String js = "(function t(n){if(window.jcToast)jcToast(" + JSONObject.quote(a.pendingToast) + ");else if(n<40)setTimeout(function(){t(n+1)},250);})(0)";
        v.evaluateJavascript(js, null); a.pendingToast = null;
    }
}
