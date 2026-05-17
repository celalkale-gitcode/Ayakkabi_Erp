import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL ortam değişkeni tanımlı değil!');
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // GÜNCELLENDİ: Depo içi Wi-Fi kopmalarında uygulamanın donmaması için 15 sn zaman aşımı
  headers: {
    'Content-Type': 'application/json',
  },
});

// YENİ: Yarın bir gün JWT Token veya Cihaz ID doğrulaması eklemek isterseniz burası hazır
api.interceptors.request.use(
  (config) => {
    // Örn: const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// GÜNCELLENDİ: Hata Yönetimi El Terminali İçin Sağlamlaştırıldı
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Konsola detaylı log basıyoruz (Geliştirme aşaması için)
    console.error('API İletişim Hatası:', {
      url: error?.config?.url,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message,
    });

    // CRITICAL: Backend'den gelen özel hata objesini (Örn: PRODUCT_NOT_FOUND) 
    // catch bloklarında okuyabilmek için aynen yukarı paslıyoruz.
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }

    // Eğer network koptuysa veya backend çöktüyse standart bir yapı fırlatıyoruz
    return Promise.reject({
      success: false,
      message: error.message || 'Sunucu ile bağlantı kurulamadı.',
    });
  }
);
