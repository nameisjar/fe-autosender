import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import AddDevice from '../views/AddDevice.vue';
import ScheduleFeedback from '../views/ScheduleFeedback.vue';
import ScheduleReminder from '../views/ScheduleReminder.vue';
import ReminderAlgo from '../views/ReminderAlgo.vue';
import Templates from '../views/Templates.vue';
import MonthlyTemplates from '../views/MonthlyTemplates.vue';
import MonthlyFeedback from '../views/MonthlyFeedback.vue';
import AdminTutors from '../views/AdminTutors.vue';
import AdminSentHistory from '../views/AdminSentHistory.vue';
import AdminMonitoring from '../views/AdminMonitoring.vue';
import SendMessage from '../views/SendMessage.vue';
import Schedules from '../views/Schedules.vue';
import Broadcasts from '../views/Broadcasts.vue';
import Contacts from '../views/Contacts.vue';
import Groups from '../views/Groups.vue';
import CodeSnippets from '../views/CodeSnippets.vue';
import SnippetView from '../views/SnippetView.vue';
import { useAuthStore } from '../stores/auth.js';

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
