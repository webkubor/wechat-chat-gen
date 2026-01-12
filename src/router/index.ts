import { createRouter, createWebHistory } from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'
import CorpusView from '../views/CorpusView.vue'
import ChangelogView from '../views/ChangelogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    },
    {
      path: '/changelog',
      name: 'changelog',
      component: ChangelogView
    }
  ]
})

export default router
