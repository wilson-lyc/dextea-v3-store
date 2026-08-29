import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const FEATURES = ['auth', 'store', 'product', 'order', 'store-settings']

function featureLayer(name, allowedFeatures = []) {
  const blocked = FEATURES.filter(
    (other) => other !== name && !allowedFeatures.includes(other),
  )

  return {
    files: [`src/features/${name}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...blocked.flatMap((other) => [
              {
                group: [`@/features/${other}`],
                message: `features/${name} 不得直接依赖 features/${other}，跨领域依赖请走应用级 Provider 或在此显式加白名单`,
              },
              {
                group: [`@/features/${other}/*`],
                message: `features/${name} 不得直接依赖 features/${other}，跨领域依赖请走应用级 Provider 或在此显式加白名单`,
              },
            ]),
            {
              group: ['@/pages/*', '@/layouts/*'],
              message: '领域层不得依赖页面与布局',
            },
          ],
        },
      ],
    },
  }
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui 原语由 CLI 生成且需与上游保持一致，单个文件内同时导出组件与
    // 常量/管理器实例（如 toast）。HMR 粒度损失可接受，故不按此规则拆分文件。
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/pages/*', '@/layouts/*', '@/app/*'],
              message: 'shared 层与业务无关，不得反向依赖上层',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/layouts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/pages/*'],
              message: '布局不感知业务领域',
            },
          ],
        },
      ],
    },
  },
  featureLayer('auth'),
  // store 领域读取 auth 持有的会话缓存快照（门店信息落盘在会话中）
  featureLayer('store', ['auth']),
  featureLayer('product'),
  featureLayer('order'),
  // store-settings 复用 store 领域的门店读写接口，两者同属 /api/v1/store/* 契约
  featureLayer('store-settings', ['store']),
])
