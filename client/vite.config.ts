// vite.config.js/ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'
import IconsResolve from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => (['Tree'] as Array<string>).filter(t=>t==tag).length>0,
        }
      }
    }),
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
      dts:true
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true
    })
  ],
  base:'./',
})
