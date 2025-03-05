import axios from 'axios';

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

      if (error.response?.status === 401) {
        console.warn('Access Token expired! Attempting to refresh...');

        if (!refreshToken) {
          console.error('No refresh token found. Redirecting to login.');
          logout();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post('http://103.162.15.61:8080/api/v1/auth/refresh-token', { refreshToken });

          localStorage.setItem('accessToken', data.accessToken);

          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          console.error('Refresh Token failed. Redirecting to login.');
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return accessToken;
};

const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  window.location.href = '/login';
};

export default checkAuth;
