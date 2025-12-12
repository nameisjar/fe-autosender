<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-brand">
        <div class="brand-logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- Messages Square Icon - Multiple Chat Bubbles -->
            <path
              d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
            />
            <path
              d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"
            />
          </svg>
        </div>
        <h1>Autosender</h1>
      </div>

      <div class="login-header">
        <h2>Login</h2>
        <p>Masukkan email dan password untuk melanjutkan</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="identifier"
            type="email"
            placeholder="contoh@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? "Memproses..." : "Masuk" }}
        </button>
      </form>

      <div class="login-footer">
        <p>&copy; 2025 Autosender. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { userApi } from "../api/http.js";

const router = useRouter();
const identifier = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const login = async () => {
  error.value = "";
  loading.value = true;
  try {
    const { data } = await userApi.post("/auth/login", {
      identifier: identifier.value,
      password: password.value,
    });
    localStorage.setItem("token", data.accessToken);
    router.push("/");
  } catch (e) {
    error.value =
      (e && e.response && e.response.data && e.response.data.message) || "Login gagal";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.login-box {
  background: white;
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-brand {
  text-align: center;
  margin-bottom: 32px;
}

.brand-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.login-brand h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input::placeholder {
  color: #9ca3af;
}

.error-box {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 20px;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-login:hover:not(:disabled) {
  background: #2563eb;
}

.btn-login:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
  }

  .login-brand {
    margin-bottom: 28px;
  }

  .brand-logo {
    width: 48px;
    height: 48px;
  }

  .brand-logo svg {
    width: 28px;
    height: 28px;
  }

  .login-brand h1 {
    font-size: 22px;
  }

  .login-header h2 {
    font-size: 18px;
  }

  .login-header p {
    font-size: 13px;
  }
}
</style>
