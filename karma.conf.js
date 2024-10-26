// karma.conf.js

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // Deja visible la salida de Jasmine Spec Runner en el navegador
      // Eliminada la configuración de Mocha ya que estamos usando Jasmine
    },
    files: [
      // Archivo polyfill que se carga primero
      { pattern: 'src/test/polyfills.js', included: true },
      // Incluye todos los archivos .spec.ts
      { pattern: './src/**/*.spec.ts', watched: false },
      // Excluir específicamente los archivos de pruebas que no existen
      { pattern: '!./src/app/payment-cancel/payment-cancel.component.spec.ts', watched: false },
      { pattern: '!./src/app/payment-modal/payment-modal.component.spec.ts', watched: false },
      { pattern: '!./src/app/payment-success/payment-success.component.spec.ts', watched: false },
      { pattern: '!./src/app/payment/payment.component.spec.ts', watched: false },
      { pattern: '!./src/app/payout/payout.component.spec.ts', watched: false },
      // ... otros archivos si es necesario
    ],
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/geekbank-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // Configura los navegadores para incluir Chrome Headless
    browsers: ['ChromeHeadlessNoSandbox'], // Usa el lanzador personalizado headless
    singleRun: false, // Cambia a true si deseas que Karma se detenga después de ejecutar las pruebas
    restartOnFileChange: true,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer']
      }
    }
  });
};
