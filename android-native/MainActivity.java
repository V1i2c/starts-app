package com.starts.artstudent;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.util.ArrayList;
import java.util.List;

/**
 * Capacitor's WebView is a normal Android WebView under the hood, which means
 * getUserMedia() (used for in-app voice-note recording, and would also cover
 * a future live camera preview) needs its OWN grant on top of the regular
 * Android runtime permission — the OS permission dialog appearing is NOT
 * enough by itself; WebChromeClient.onPermissionRequest must also explicitly
 * grant the resource, or the WebView silently denies media access even after
 * the user taps "Allow". This class bridges the two.
 *
 * See: https://github.com/ionic-team/capacitor/issues (getUserMedia in
 * Capacitor Android threads) — this is a widely hit, easy-to-miss gap in the
 * default Capacitor template, not a hypothetical edge case.
 */
public class MainActivity extends BridgeActivity {

  private static final int MEDIA_PERMISSION_REQUEST_CODE = 7100;
  private PermissionRequest pendingWebRequest;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    getBridge()
        .getWebView()
        .setWebChromeClient(
            new BridgeWebChromeClient(getBridge()) {
              @Override
              public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(
                    () -> {
                      List<String> androidPermissionsNeeded = new ArrayList<>();
                      for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)
                            && !isGranted(Manifest.permission.CAMERA)) {
                          androidPermissionsNeeded.add(Manifest.permission.CAMERA);
                        }
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)
                            && !isGranted(Manifest.permission.RECORD_AUDIO)) {
                          androidPermissionsNeeded.add(Manifest.permission.RECORD_AUDIO);
                        }
                      }

                      if (androidPermissionsNeeded.isEmpty()) {
                        request.grant(request.getResources());
                        return;
                      }

                      pendingWebRequest = request;
                      ActivityCompat.requestPermissions(
                          MainActivity.this,
                          androidPermissionsNeeded.toArray(new String[0]),
                          MEDIA_PERMISSION_REQUEST_CODE);
                    });
              }
            });
  }

  private boolean isGranted(String permission) {
    return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED;
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    if (requestCode != MEDIA_PERMISSION_REQUEST_CODE || pendingWebRequest == null) {
      return;
    }

    boolean allGranted = true;
    for (int result : grantResults) {
      if (result != PackageManager.PERMISSION_GRANTED) {
        allGranted = false;
        break;
      }
    }

    if (allGranted) {
      pendingWebRequest.grant(pendingWebRequest.getResources());
    } else {
      pendingWebRequest.deny();
    }
    pendingWebRequest = null;
  }
}
