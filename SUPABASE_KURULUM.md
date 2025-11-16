# 🗄️ Supabase Kurulum Rehberi

## 📋 Adım 1: Supabase Hesabı Oluştur

1. [https://supabase.com](https://supabase.com) adresine git
2. "Start your project" butonuna tıkla
3. GitHub hesabınla giriş yap (veya e-posta ile kayıt ol)

## 🆕 Adım 2: Yeni Proje Oluştur

1. Dashboard'da "New project" butonuna tıkla
2. Proje bilgilerini doldur:
   - **Name**: `nur-sat-tracker` (veya istediğin isim)
   - **Database Password**: Güçlü bir şifre oluştur (kaydet!)
   - **Region**: `Europe (eu-central-1)` (en yakın bölgeyi seç)
3. "Create new project" butonuna tıkla
4. Projenin hazırlanmasını bekle (1-2 dakika sürebilir)

## 📊 Adım 3: Veritabanı Tablosu Oluştur

1. Sol menüden **"Table Editor"** sekmesine git
2. **"Create a new table"** butonuna tıkla
3. Aşağıdaki SQL sorgusunu çalıştır:

### SQL Sorgusu (Table Editor yerine SQL Editor kullan):

Sol menüden **"SQL Editor"** → **"New query"** → Aşağıdaki kodu yapıştır:

```sql
-- Nur'un SAT netleri için tablo oluştur
CREATE TABLE sat_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    math_score DECIMAL(5,2) NOT NULL,
    english_score DECIMAL(5,2) NOT NULL,
    total_score DECIMAL(6,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index oluştur (performans için)
CREATE INDEX idx_sat_scores_user_date ON sat_scores(user_id, date DESC);
CREATE INDEX idx_sat_scores_user_id ON sat_scores(user_id);

-- Updated_at otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sat_scores_updated_at 
    BEFORE UPDATE ON sat_scores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) politikalarını etkinleştir
ALTER TABLE sat_scores ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir, ekleyebilir, silebilir (basit politika)
CREATE POLICY "Enable all access for all users" ON sat_scores
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Daha güvenli alternatif (sadece kendi verilerini görsün)
-- CREATE POLICY "Users can view own scores" ON sat_scores
--     FOR SELECT
--     USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

4. **"Run"** butonuna tıkla (veya Ctrl+Enter)
5. Başarılı mesajı göreceksin: "Success. No rows returned"

## 🔑 Adım 4: API Anahtarlarını Al

1. Sol menüden **"Settings"** → **"API"** sekmesine git
2. Aşağıdaki bilgileri kopyala:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (uzun bir string)

## ⚙️ Adım 5: Projeyi Yapılandır

1. `supabase-config.js` dosyasını aç
2. Kopyaladığın bilgileri yapıştır:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co'; // Buraya Project URL'i yapıştır
const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Buraya anon public key'i yapıştır
```

3. Dosyayı kaydet

## 🔄 Adım 6: Script Dosyasını Değiştir

### Seçenek A: Supabase ile çalış (Önerilen)

`index.html` dosyasında script importunu değiştir:

```html
<!-- Eski (LocalStorage) -->
<script src="script.js"></script>

<!-- Yeni (Supabase) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="script-supabase.js"></script>
```

### Seçenek B: LocalStorage ile devam et (İnternet bağlantısı gerekmez)

Hiçbir şey değiştirme, mevcut `script.js` dosyası çalışmaya devam eder.

## ✅ Adım 7: Test Et

1. `index.html` dosyasını tarayıcıda aç
2. Bir net girişi yap
3. Supabase Dashboard → **Table Editor** → **sat_scores** tablosuna git
4. Verinin kaydedildiğini gör! 🎉

## 🔍 Tablo Yapısı Açıklaması

| Kolon          | Tip        | Açıklama                                    |
|----------------|------------|---------------------------------------------|
| id             | BIGSERIAL  | Otomatik artan benzersiz ID                 |
| user_id        | VARCHAR    | Kullanıcı ID'si (şimdilik: "nur_user_001") |
| date           | DATE       | Test tarihi                                 |
| math_score     | DECIMAL    | Matematik net sayısı                        |
| english_score  | DECIMAL    | İngilizce net sayısı                        |
| total_score    | DECIMAL    | Toplam net (math + english)                 |
| notes          | TEXT       | Notlar (opsiyonel)                          |
| created_at     | TIMESTAMP  | Kayıt oluşturulma zamanı                    |
| updated_at     | TIMESTAMP  | Son güncellenme zamanı                      |

## 📌 Önemli Notlar

### Soru Sınırlaması Kaldırıldı ✅
- Matematik ve İngilizce için maksimum sınır YOK
- İstediğin kadar net girebilirsin (0'dan sonsuza!)
- Sadece negatif sayı kontrolü var

### Güvenlik
- Şu an herkes tüm verileri görebilir (basit kullanım için)
- İleride authentication eklenebilir (kullanıcı girişi)
- RLS (Row Level Security) aktif

### Yedekleme
- Veriler hem Supabase'de hem LocalStorage'da saklanır
- İnternet kesilse bile LocalStorage'dan çalışır
- Supabase ücretsiz plan: 500 MB veritabanı

## 🆘 Sorun Giderme

### Bağlantı hatası alıyorum
- `supabase-config.js` dosyasındaki URL ve KEY'i kontrol et
- Tarayıcı konsolunu aç (F12) ve hata mesajlarına bak
- İnternet bağlantını kontrol et

### Veriler görünmüyor
- Supabase Dashboard'da Table Editor'e git
- `sat_scores` tablosunda veri var mı kontrol et
- Tarayıcı konsolunda hata var mı bak

### LocalStorage'a geri dönmek istiyorum
- `index.html` dosyasında script importlarını eski haline getir
- Sadece `<script src="script.js"></script>` kalsın

## 🚀 İleri Seviye Özellikler (İsteğe Bağlı)

### Kullanıcı Girişi Ekle
- Supabase Authentication kullanılabilir
- Her kullanıcı sadece kendi verilerini görsün

### Realtime Senkronizasyon
- Birden fazla cihazdan aynı anda erişim
- Değişiklikler anında yansısın

### Grafik Ekleme
- Chart.js veya Recharts ile grafik gösterimi
- Net gelişimini görsel olarak takip et

## 💝 Başarılar!

Artık Nur'un SAT netleri Supabase'de güvenle saklanıyor! 🎉

Sevgiyle hazırlandı ❤️
