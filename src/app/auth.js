import axios from 'axios';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

const checkAuth = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userRole = localStorage.getItem('role');

  const PUBLIC_ROUTES = ['login', 'forgot-password', 'auth/reset-password', 'register', 'documentation'];
  const isPublicPage = PUBLIC_ROUTES.some(r => window.location.href.includes(r));

  if (!accessToken && !isPublicPage) {
    window.location.href = '/login';
    return;
  }

  if (userRole !== 'ADMIN' && !isPublicPage) {
    logout();
    return;
  }

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => {
      document.body.classList.remove('loading-indicator');
      return response;
    },
    async (error) => {
      document.body.classList.remove('loading-indicator');
      const originalRequest = error.config;

      if (!error.response || error.response.status !== 403 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      // Mark request as already retried
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axios(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post('https://quanbeo.duckdns.org/api/v1/auth/refresh-token', { token: refreshToken });
        
        console.log("Response Data:", response.data.data);

        const newAccessToken = response.data.data.accessToken;
        console.log('New accesstoken: ', newAccessToken)

        if (!newAccessToken) {
          console.error("accessToken missing from refresh response", response.data.data);
          return Promise.reject(new Error("Invalid refresh response"));
        }

        localStorage.setItem('accessToken', newAccessToken);

        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return accessToken;
};

export default checkAuth;