// src/test.ts

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Definir `global` como `window` para resolver el error `global is not defined`
(window as any).global = window;

// Inicializar el entorno de pruebas de Angular.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Encontrar todos los archivos de pruebas existentes
declare const require: any;

try {
  const context = require.context('./', true, /\.spec\.ts$/);
  context.keys().forEach((key: string) => context(key));
} catch (error) {
  console.error("Webpack's require.context is not available or has issues.", error);
}
