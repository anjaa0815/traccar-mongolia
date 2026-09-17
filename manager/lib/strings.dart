import 'dart:ui' as ui;

/// The app has no localization framework (no ARB files, no
/// flutter_localizations) since almost all visible UI comes from the web
/// dashboard loaded in the WebView. This covers the handful of strings
/// that are native to the app shell itself.
bool get _isMongolian => ui.PlatformDispatcher.instance.locale.languageCode == 'mn';

String tr(String en, String mn) => _isMongolian ? mn : en;
