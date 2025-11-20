-- sat_scores tablosuna yorum (reply) kolonu ekle

ALTER TABLE sat_scores 
ADD COLUMN IF NOT EXISTS reply TEXT;

COMMENT ON COLUMN sat_scores.reply IS 'Kayda eklenen yorum/cevap (sevgiliden)';
