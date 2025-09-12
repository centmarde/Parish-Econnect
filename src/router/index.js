import { /*getUserInformation,*/ supabase, isAuthenticated } from '@/utils/supabase'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import HomePage from '@/views/auth/HomePage.vue'
import BookEvent from '@/views/bookingEvents/BookEvent.vue'
import WeddingMassForm from '@/views/auth/WeddingMassView.vue'
import BaptismMass from '@/views/auth/BaptismMassView.vue'
import FuneralMass from '@/views/auth/FuneralMassView.vue'
import ThanksGivingMass from '@/views/auth/ThanksGivingMass.vue'
import TrialHeader from '@/views/TrialHeader.vue'
import AdminDashboard from '@/views/admin/AdminDashboardView.vue'
import AdminBookingsView from '@/views/adminOld/AdminBookingsView.vue'
import AdminMembersView from '@/views/adminOld/AdminMembersView.vue'
import AdminEventsView from '@/views/adminOld/AdminEventsView.vue'
import AdminAlertsView from '@/views/adminOld/AdminAlertsView.vue'
import NotFoundView from '@/views/error/NotFoundView.vue'
import ForbiddenView from '@/views/error/ForbiddenView.vue'
import TrialPage from '@/views/error/TrialPage.vue'
// import CameraView from '@/views/camera/CameraView.vue'
import Events from '@/views/events/EventsView.vue'
import Notifications from '@/views/notifications/NotificationsView.vue'
import Pending from '@/views/PendingView.vue'
import WeddingContinue from '@/views/contWedding/ContWeddingView.vue'
import WeddingContinue2 from '@/views/contWedding/CameraWeddingView.vue'
import FinnishView from '@/views/FinnishView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/trial-page',
      name: 'trial-page',
      component: TrialPage,
    },

    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: HomePage,
      meta: { requiresUserMode: true },
    },
    {
      path: '/book-event',
      name: 'book-event',
      component: BookEvent,
      meta: { requiresUserMode: true },
    },
    {
      path: '/pending',
      name: 'pending',
      component: Pending,
      meta: { requiresUserMode: true },
    },
    /*   {
      path: '/camera',
      name: 'camera',
      component: CameraView,
       meta: { requiresAuth: true, requiresUserMode: true },
    }, */
    {
      path: '/events',
      name: 'events',
      component: Events,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/wedding-mass-continue',
      name: 'wedding-mass-continue',
      component: WeddingContinue,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/wedding-mass-continue-2',
      name: 'wedding-mass-continue-2',
      component: WeddingContinue2,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/finnish',
      name: 'finnish',
      component: FinnishView,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notifications,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/wedding-mass-form',
      name: 'wedding-mass-form',
      component: WeddingMassForm,
      meta: { requiresUserMode: true },
    },
    {
      path: '/baptism-mass',
      name: 'baptism-mass',
      component: BaptismMass,
      meta: { requiresUserMode: true },
    },
    {
      path: '/funeral-mass',
      name: 'funeral-mass',
      component: FuneralMass,
      meta: { requiresUserMode: true },
    },
    {
      path: '/thanks-giving-mass',
      name: 'thanks-giving-mass',
      component: ThanksGivingMass,
      meta: { requiresUserMode: true },
    },
    {
      //path: '/admin/admin-dashboard',
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-booking-view',
      path: '/admin-booking-view',
      name: 'admin-booking-view',
      component: AdminBookingsView,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-members-view',
      path: '/admin-members-view',
      name: 'admin-members-view',
      component: AdminMembersView,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-events-view',
      path: '/admin-events-view',
      name: 'admin-events-view',
      component: AdminEventsView,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-alerts-view',
      path: '/admin-alerts-view',
      name: 'admin-alerts-view',
      component: AdminAlertsView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/trial-header',
      name: 'trial-header',
      component: TrialHeader,
    },
    {
      path: '/page-not-found',
      name: 'page-not-found',
      component: NotFoundView,
    },


    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'catch-all',
      redirect: '/page-not-found',
    },
  ],
})

router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to appropriate page if accessing home route
  if (to.name === 'home') {
    return isLoggedIn ? { name: 'homepage' } : { name: 'login' }
  }

  // If not logged in
  if (!isLoggedIn) {
    // Only allow access to login and register
    if (to.name === 'login' || to.name === 'register') {
      return true
    } else if (to.name === 'page-not-found' || to.name === 'forbidden') {
      return true
    } else {
      // any other page (even /homepage) = not allowed
      return { name: 'page-not-found' }
    }
  }

  // If logged in, prevent access to login or register pages
  if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    // Get the stored login mode to determine where to redirect
    const loginMode = sessionStorage.getItem('loginMode') || 'user'
    if (loginMode === 'admin') {
      return { name: 'admin-dashboard' }
    } else {
      return { name: 'homepage' }
    }
  }

  let userRole = null
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    userRole = roleData?.role
  }

  const isAdmin = userRole === 'admin'
  const loginMode = sessionStorage.getItem('loginMode') || 'user'

  // Check admin-only routes
  if (to.meta.requiresAdmin) {
    if (!isLoggedIn || !isAdmin || loginMode !== 'admin') {
      return '/forbidden'
    }
  }

  // Check user-mode-only routes
  if (to.meta.requiresUserMode) {
    if (loginMode === 'admin') {
      return '/forbidden'
    }
  }

  /*
  // Check user if the user is logged in or not admin
  if (isLoggedIn && !isAdmin) {
    if (to.path.startsWith('/admin/users')) {
      return { name: 'forbidden' }
    }
  }

  // If not logged in, prevent access to system pages
  if (!isLoggedIn && to.path.startsWith('/admin')) {
    // redirect the user to the login page
    return { name: 'login' }
  }
*/
  if (router.resolve(to).matched.length === 0) {
    return { name: 'page-not-found' }
  }
})

export default router
