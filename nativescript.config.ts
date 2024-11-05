import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.railwaygate',
  appPath: 'app',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    codeCache: true,
    maxLogcatObjectSize: 2048
  }
} as NativeScriptConfig;