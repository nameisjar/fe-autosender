import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

// 🔄 Core views - loaded synchronously (needed for initial render)
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import AddDevice from '../views/AddDevice.vue';
import SnippetView from '../views/SnippetView.vue';

// 🚀 Lazy loaded views - loaded on-demand for better performance
const ScheduleFeedback = () => import('../views/ScheduleFeedback.vue');
const ScheduleReminder = () => import('../views/ScheduleReminder.vue');
const ReminderAlgo = () => import('../views/ReminderAlgo.vue');
const Templates = () => import('../views/Templates.vue');
const MonthlyTemplates = () => import('../views/MonthlyTemplates.vue');
const MonthlyFeedback = () => import('../views/MonthlyFeedback.vue');
const AdminTutors = () => import('../views/AdminTutors.vue');
const AdminSentHistory = () => import('../views/AdminSentHistory.vue');
const AdminMonitoring = () => import('../views/AdminMonitoring.vue');
const SendMessage = () => import('../views/SendMessage.vue');
const Schedules = () => import('../views/Schedules.vue');
const Broadcasts = () => import('../views/Broadcasts.vue');
const Contacts = () => import('../views/Contacts.vue');
const Groups = () => import('../views/Groups.vue');
const CodeSnippets = () => import('../views/CodeSnippets.vue');

const routes = [
    { path: '/login', name: 'login', component: Login },
    // Public route for viewing shared snippets (no auth required)
    { path: '/snippet/:token', name: 'snippet-view', component: SnippetView },
    {
        path: '/',
        component: Dashboard,
        children: [
            { path: '', redirect: '/add-device' },
            { path: 'add-device', name: 'add-device', component: AddDevice },
            { path: 'contacts', name: 'contacts', component: Contacts },
            { path: 'groups', name: 'groups', component: Groups },
            { path: 'schedule-feedback', name: 'schedule-feedback', component: ScheduleFeedback },
            { path: 'schedule-reminder', name: 'schedule-reminder', component: ScheduleReminder },
            { path: 'reminder-algo', name: 'reminder-algo', component: ReminderAlgo },
            { path: 'schedules', name: 'schedules', component: Schedules },
            { path: 'broadcasts', name: 'broadcasts', component: Broadcasts },
            // Feedback Bulanan (Algo) - Accessible by Admin & Tutor
            {
                path: 'monthly-feedback',
                name: 'monthly-feedback',
                component: MonthlyFeedback,
            },
            // Code Snippets - Accessible by Admin & Tutor
            {
                path: 'code-snippets',
                name: 'code-snippets',
                component: CodeSnippets,
            },
            // keep legacy paths but protect as admin-only
            // removed: legacy 'sent-history' (admin-only)
            {
                path: 'templates',
                name: 'templates',
                component: Templates,
                meta: { requiresAdmin: true },
            },
            // admin routes
            {
                path: 'admin/tutors',
                name: 'admin-tutors',
                component: AdminTutors,
                meta: { requiresAdmin: true },
            },
            {
                path: 'admin/sent-history',
                name: 'admin-sent-history',
                component: AdminSentHistory,
                meta: { requiresAdmin: true },
            },
            {
                path: 'admin/monitoring',
                name: 'admin-monitoring',
                component: AdminMonitoring,
                meta: { requiresAdmin: true },
            },
            {
                path: 'admin/monthly-templates',
                name: 'admin-monthly-templates',
                component: MonthlyTemplates,
                meta: { requiresAdmin: true },
            },
            {
                path: 'send-message',
                name: 'send-message',
                component: SendMessage,
                meta: { requiresAdmin: true },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, _from, next) => {
    const token = localStorage.getItem('token');
    
    // Allow public routes without auth
    const publicRoutes = ['login', 'snippet-view'];
    if (publicRoutes.includes(to.name)) {
        // Redirect logged-in users from login page
        if (to.name === 'login' && token) {
            next({ name: 'add-device' });
            return;
        }
        next();
        return;
    }
    
    // Require auth for all other routes
    if (!token) {
        next({ name: 'login' });
        return;
    }

    if (to.meta && to.meta.requiresAdmin) {
        const auth = useAuthStore();

        // Optimasi: Gunakan data dari store jika sudah ada
        if (!auth.me) {
            await auth.fetchMe();
        }

        // Jika user tidak ditemukan (misal token expired), lempar ke login
        if (!auth.me) {
            next({ name: 'login' });
            return;
        }

        // Cek apakah admin menggunakan getter store
        if (!auth.isAdmin) {
            next({ name: 'add-device' });
            return;
        }
    }

    next();
});

export default router;
