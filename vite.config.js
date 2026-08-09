import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                services: resolve(__dirname, 'services.html'),
                contact: resolve(__dirname, 'contact.html'),
                testimonials: resolve(__dirname, 'testimonials.html'),
                blog: resolve(__dirname, 'blog.html'),
                'blog-best-gynecologist-south-delhi': resolve(__dirname, 'blog/best-gynecologist-south-delhi.html'),
                'blog-pcos-treatment-delhi': resolve(__dirname, 'blog/pcos-treatment-delhi.html'),
                'blog-laparoscopic-surgery-delhi': resolve(__dirname, 'blog/laparoscopic-surgery-delhi.html'),
                'blog-gynecologist-near-defence-colony-gk': resolve(__dirname, 'blog/gynecologist-near-defence-colony-gk.html'),
                'blog-menopause-symptoms-treatment': resolve(__dirname, 'blog/menopause-symptoms-treatment.html'),
                'blog-when-to-visit-gynecologist': resolve(__dirname, 'blog/when-to-visit-gynecologist.html'),
                'blog-cervical-cancer-screening-delhi': resolve(__dirname, 'blog/cervical-cancer-screening-delhi.html'),
                'blog-gynecologist-noida-ghaziabad': resolve(__dirname, 'blog/gynecologist-noida-ghaziabad.html'),
                'gynecologist-south-delhi': resolve(__dirname, 'gynecologist-south-delhi.html'),
                'gynecologist-noida-greater-noida': resolve(__dirname, 'gynecologist-noida-greater-noida.html'),
                'gynecologist-ghaziabad': resolve(__dirname, 'gynecologist-ghaziabad.html'),
                'fertility-score': resolve(__dirname, 'fertility-score.html'),
                'tools': resolve(__dirname, 'tools.html'),
            },
        },
        cssCodeSplit: false,
        minify: 'esbuild',
    },
    css: {
        devSourcemap: true,
    },
})
