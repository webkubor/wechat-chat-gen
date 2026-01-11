import { createRouter, createWebHistory } from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'
import CorpusView from '../views/CorpusView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'generator',
      component: GeneratorView
    },
    {
      path: '/corpus',
      name: 'corpus',
      component: CorpusView
    }
  ]
})

export default router
