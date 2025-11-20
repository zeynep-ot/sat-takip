-- Mevcut sat_scores tablosuna soru sayıları kolonlarını ekle

-- Matematik soru sayısı kolonu
ALTER TABLE sat_scores 
ADD COLUMN IF NOT EXISTS math_questions INTEGER;

-- İngilizce soru sayısı kolonu
ALTER TABLE sat_scores 
ADD COLUMN IF NOT EXISTS english_questions INTEGER;

-- Matematik başarı oranı (hesaplanmış değer için - opsiyonel)
ALTER TABLE sat_scores 
ADD COLUMN IF NOT EXISTS math_success_rate DECIMAL(5,2);

-- İngilizce başarı oranı (hesaplanmış değer için - opsiyonel)
ALTER TABLE sat_scores 
ADD COLUMN IF NOT EXISTS english_success_rate DECIMAL(5,2);

-- Mevcut kayıtlar için varsayılan değerler (eğer varsa)
-- Bu kısmı çalıştırmazsan da olur, yeni kayıtlar otomatik olacak
UPDATE sat_scores 
SET 
    math_questions = 58,  -- Varsayılan SAT matematik soru sayısı
    english_questions = 52,  -- Varsayılan SAT ingilizce soru sayısı
    math_success_rate = ROUND((math_score / 58.0) * 100, 2),
    english_success_rate = ROUND((english_score / 52.0) * 100, 2)
WHERE math_questions IS NULL;

COMMENT ON COLUMN sat_scores.math_questions IS 'Çözülen matematik soru sayısı';
COMMENT ON COLUMN sat_scores.english_questions IS 'Çözülen ingilizce soru sayısı';
COMMENT ON COLUMN sat_scores.math_success_rate IS 'Matematik başarı oranı (%)';
COMMENT ON COLUMN sat_scores.english_success_rate IS 'İngilizce başarı oranı (%)';
