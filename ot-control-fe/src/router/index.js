import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../components/layout/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/overtime'
        },
        {
          path: '/overtime',
          name: 'OvertimeList',
          component: () => import('../views/OvertimeList.vue')
        },
        {
          path: '/overtime/create',
          name: 'OvertimeCreate',
          component: () => import('../views/OvertimeCreate.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.path === '/login' && token) {
    next('/overtime')
    return
  }
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  next()
})

export default router 