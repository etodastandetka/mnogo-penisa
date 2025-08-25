import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Отключаем sourcemap для продакшена
    minify: 'terser', // Используем terser для лучшей минификации
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделяем vendor библиотеки
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          utils: ['react-query', 'react-hot-toast'],
        },
        // Оптимизируем размер чанков
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Оптимизируем размер
    chunkSizeWarningLimit: 1000,
    target: 'es2015', // Поддержка современных браузеров
  },
  // Оптимизация для разработки
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});

