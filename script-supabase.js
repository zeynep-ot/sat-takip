// ===================================
// SUPABASE-ONLY VERSİYON (Soru Sayıları ve Başarı Oranı ile)
// ===================================

// Kullanıcı ID'si
const USER_ID = 'nur_user_001';

// Supabase'den verileri al
async function getData() {
    try {
        const { data, error } = await supabaseClient
            .from('sat_scores')
            .select('*')
            .eq('user_id', USER_ID)
            .order('date', { ascending: false });

        if (error) {
            console.error('Veri alma hatası:', error);
            alert('❌ Veri yüklenirken hata oluştu: ' + error.message);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Beklenmeyen hata:', err);
        alert('❌ Beklenmeyen bir hata oluştu!');
        return [];
    }
}

// Supabase'e veri kaydet
async function saveData(entry) {
    try {
        const { data, error } = await supabaseClient
            .from('sat_scores')
            .insert([{
                user_id: USER_ID,
                date: entry.date,
                math_score: entry.math,
                english_score: entry.english,
                total_score: entry.total,
                math_questions: entry.mathQuestions,
                english_questions: entry.englishQuestions,
                math_success_rate: entry.mathSuccessRate,
                english_success_rate: entry.englishSuccessRate,
                notes: entry.notes
            }])
            .select();

        if (error) {
            console.error('Kayıt hatası:', error);
            alert('❌ Kayıt sırasında hata oluştu: ' + error.message);
            return false;
        }

        if (data && data.length > 0) {
            entry.id = data[0].id;
        }

        return true;
    } catch (err) {
        console.error('Beklenmeyen hata:', err);
        alert('❌ Kayıt sırasında beklenmeyen bir hata oluştu!');
        return false;
    }
}

// Kayda yorum ekle/güncelle
async function updateReply(id, replyText) {
    try {
        const { error } = await supabaseClient
            .from('sat_scores')
            .update({ reply: replyText })
            .eq('id', id);

        if (error) {
            console.error('Yorum güncelleme hatası:', error);
            alert('❌ Yorum eklenirken hata oluştu: ' + error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Beklenmeyen hata:', err);
        return false;
    }
}

// Tarihi formatla (gün/ay/yıl)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Sayıyı formatla (virgülden sonra 1 basamak)
function formatNumber(num) {
    return Number(num).toFixed(1);
}

// Yüzde formatla
function formatPercent(num) {
    return Number(num).toFixed(1) + '%';
}

// Form submit olayı
document.getElementById('netForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const mathQuestions = parseInt(document.getElementById('mathQuestions').value);
    const math = parseFloat(document.getElementById('math').value);
    const englishQuestions = parseInt(document.getElementById('englishQuestions').value);
    const english = parseFloat(document.getElementById('english').value);
    const notes = document.getElementById('notes').value.trim();

    // Validasyon
    if (math < 0) {
        alert('❌ Matematik neti 0 veya daha büyük olmalıdır!');
        return;
    }

    if (english < 0) {
        alert('❌ İngilizce neti 0 veya daha büyük olmalıdır!');
        return;
    }

    if (math > mathQuestions) {
        alert('❌ Matematik neti, soru sayısından fazla olamaz!');
        return;
    }

    if (english > englishQuestions) {
        alert('❌ İngilizce neti, soru sayısından fazla olamaz!');
        return;
    }

    if (mathQuestions < 1 || englishQuestions < 1) {
        alert('❌ Soru sayıları en az 1 olmalıdır!');
        return;
    }

    // Başarı oranlarını hesapla
    const mathSuccessRate = (math / mathQuestions) * 100;
    const englishSuccessRate = (english / englishQuestions) * 100;

    // Yeni kayıt oluştur
    const newEntry = {
        date: date,
        math: math,
        english: english,
        total: math + english,
        mathQuestions: mathQuestions,
        englishQuestions: englishQuestions,
        mathSuccessRate: mathSuccessRate,
        englishSuccessRate: englishSuccessRate,
        notes: notes
    };

    // Kaydetme sırasında loading göster
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Kaydediliyor...';
    submitBtn.disabled = true;

    // Supabase'e kaydet
    const success = await saveData(newEntry);

    // Butonu eski haline getir
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    if (success) {
        // Formu temizle
        this.reset();

        // Bugünün tarihini varsayılan olarak ayarla
        document.getElementById('date').valueAsDate = new Date();

        // Sayfayı güncelle
        await updateStats();
        await renderHistory();

        // Başarı mesajı - Performansa göre özelleştirilmiş
        let message;
        const avgRate = (mathSuccessRate + englishSuccessRate) / 2;

        if (avgRate >= 90) {
            message = '🌟 MÜKEMMEL! %' + avgRate.toFixed(1) + ' başarı oranı! Harikasın aşkım! 💕';
        } else if (avgRate >= 80) {
            message = '✨ Çok iyi gidiyorsun Aşkım! %' + avgRate.toFixed(1) + ' başarı! Gurur duyuyorum! ❤️';
        } else if (avgRate >= 70) {
            message = '💫 Güzel! %' + avgRate.toFixed(1) + ' başarı oranı. İlerleyişin harika! 💜';
        } else if (avgRate >= 60) {
            message = '🎯 İyi! %' + avgRate.toFixed(1) + ' başarı. Devam et, gelişiyorsun! 💕';
        } else {
            message = '💪 Kaydedildi! Her gün biraz daha iyi olacaksın, pes etme! ❤️';
        }

        alert(message);
    }
});

// İstatistikleri güncelle
async function updateStats() {
    const data = await getData();

    if (data.length === 0) {
        // Veri yoksa sıfırları göster
        document.getElementById('mathAvg').textContent = '0.0';
        document.getElementById('mathSuccessRate').textContent = '0%';
        document.getElementById('mathMax').textContent = '0.0';
        document.getElementById('mathWeekRate').textContent = '0%';

        document.getElementById('englishAvg').textContent = '0.0';
        document.getElementById('englishSuccessRate').textContent = '0%';
        document.getElementById('englishMax').textContent = '0.0';
        document.getElementById('englishWeekRate').textContent = '0%';

        document.getElementById('totalTests').textContent = '0';
        document.getElementById('totalAvg').textContent = '0.0';
        document.getElementById('lastTestDate').textContent = '-';
        document.getElementById('progress').textContent = '📊';
        return;
    }

    // Verileri normalize et
    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
        mathQuestions: entry.math_questions,
        englishQuestions: entry.english_questions,
        mathSuccessRate: entry.math_success_rate,
        englishSuccessRate: entry.english_success_rate,
        notes: entry.notes
    }));

    // Matematik istatistikleri
    const mathScores = normalizedData.map(d => d.math);
    const mathAvg = mathScores.reduce((a, b) => a + b, 0) / mathScores.length;
    const mathMax = Math.max(...mathScores);

    // Matematik başarı oranı ortalaması
    const mathRates = normalizedData
        .filter(d => d.mathSuccessRate != null)
        .map(d => d.mathSuccessRate);
    const mathSuccessRateAvg = mathRates.length > 0 ?
        mathRates.reduce((a, b) => a + b, 0) / mathRates.length :
        0;

    // İngilizce istatistikleri
    const englishScores = normalizedData.map(d => d.english);
    const englishAvg = englishScores.reduce((a, b) => a + b, 0) / englishScores.length;
    const englishMax = Math.max(...englishScores);

    // İngilizce başarı oranı ortalaması
    const englishRates = normalizedData
        .filter(d => d.englishSuccessRate != null)
        .map(d => d.englishSuccessRate);
    const englishSuccessRateAvg = englishRates.length > 0 ?
        englishRates.reduce((a, b) => a + b, 0) / englishRates.length :
        0;

    // Son 7 günün verileri
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentData = normalizedData.filter(d => new Date(d.date) >= sevenDaysAgo);

    let mathWeekRate = 0;
    let englishWeekRate = 0;

    if (recentData.length > 0) {
        const recentMathRates = recentData
            .filter(d => d.mathSuccessRate != null)
            .map(d => d.mathSuccessRate);
        mathWeekRate = recentMathRates.length > 0 ?
            recentMathRates.reduce((sum, r) => sum + r, 0) / recentMathRates.length :
            0;

        const recentEnglishRates = recentData
            .filter(d => d.englishSuccessRate != null)
            .map(d => d.englishSuccessRate);
        englishWeekRate = recentEnglishRates.length > 0 ?
            recentEnglishRates.reduce((sum, r) => sum + r, 0) / recentEnglishRates.length :
            0;
    }

    // Toplam istatistikler
    const totalAvg = mathAvg + englishAvg;
    const sortedByDate = [...normalizedData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastTestDate = formatDate(sortedByDate[0].date);

    // İlerleme göstergesi - Başarı oranına göre
    let progressIcon = '📊';
    if (normalizedData.length >= 2) {
        const lastTwo = sortedByDate.slice(0, 2);

        // Son iki testin ortalama başarı oranlarını karşılaştır
        const lastRate = (lastTwo[0].mathSuccessRate + lastTwo[0].englishSuccessRate) / 2;
        const prevRate = (lastTwo[1].mathSuccessRate + lastTwo[1].englishSuccessRate) / 2;

        const rateDiff = lastRate - prevRate;

        if (rateDiff > 5) {
            progressIcon = '📈 Harika İlerleme! (+' + rateDiff.toFixed(1) + '%)';
        } else if (rateDiff > 0) {
            progressIcon = '📈 Yükseliş (+' + rateDiff.toFixed(1) + '%)';
        } else if (rateDiff < -5) {
            progressIcon = '📉 Düşüş (' + rateDiff.toFixed(1) + '%)';
        } else if (rateDiff < 0) {
            progressIcon = '📉 Hafif Düşüş (' + rateDiff.toFixed(1) + '%)';
        } else {
            progressIcon = '➡️ Sabit';
        }
    }

    // HTML'e yazdır
    document.getElementById('mathAvg').textContent = formatNumber(mathAvg);
    document.getElementById('mathSuccessRate').textContent = formatPercent(mathSuccessRateAvg);
    document.getElementById('mathMax').textContent = formatNumber(mathMax);
    document.getElementById('mathWeekRate').textContent = formatPercent(mathWeekRate);

    document.getElementById('englishAvg').textContent = formatNumber(englishAvg);
    document.getElementById('englishSuccessRate').textContent = formatPercent(englishSuccessRateAvg);
    document.getElementById('englishMax').textContent = formatNumber(englishMax);
    document.getElementById('englishWeekRate').textContent = formatPercent(englishWeekRate);

    document.getElementById('totalTests').textContent = normalizedData.length;
    document.getElementById('totalAvg').textContent = formatNumber(totalAvg);
    document.getElementById('lastTestDate').textContent = lastTestDate;
    document.getElementById('progress').textContent = progressIcon;
}

// Geçmişi render et
async function renderHistory(filteredData = null) {
    let data = filteredData || await getData();
    const historyList = document.getElementById('historyList');

    if (data.length === 0) {
        historyList.innerHTML = '<p class="empty-message">Henüz kayıt bulunmuyor. Yukarıdaki formdan net girişi yapabilirsiniz.</p>';
        return;
    }

    // Verileri normalize et
    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score || entry.math,
        english: entry.english_score || entry.english,
        total: entry.total_score || entry.total,
        mathQuestions: entry.math_questions || entry.mathQuestions,
        englishQuestions: entry.english_questions || entry.englishQuestions,
        mathSuccessRate: entry.math_success_rate || entry.mathSuccessRate,
        englishSuccessRate: entry.english_success_rate || entry.englishSuccessRate,
        notes: entry.notes,
        reply: entry.reply
    }));

    // Tarihe göre sırala (en yeni önce)
    const sortedData = [...normalizedData].sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = sortedData.map(entry => {
                const mathRate = entry.mathSuccessRate ? formatPercent(entry.mathSuccessRate) : 'N/A';
                const englishRate = entry.englishSuccessRate ? formatPercent(entry.englishSuccessRate) : 'N/A';
                const avgRate = entry.mathSuccessRate && entry.englishSuccessRate ?
                    formatPercent((entry.mathSuccessRate + entry.englishSuccessRate) / 2) :
                    'N/A';

                return `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">📅 ${formatDate(entry.date)}</span>
            </div>
            <div class="history-scores">
                <div class="score-item math">
                    <span class="score-label">Matematik</span>
                    <span class="score-value">${formatNumber(entry.math)} / ${entry.mathQuestions || '?'}</span>
                    <span class="score-rate">${mathRate}</span>
                </div>
                <div class="score-item english">
                    <span class="score-label">İngilizce</span>
                    <span class="score-value">${formatNumber(entry.english)} / ${entry.englishQuestions || '?'}</span>
                    <span class="score-rate">${englishRate}</span>
                </div>
                <div class="score-item total">
                    <span class="score-label">Toplam Net</span>
                    <span class="score-value">${formatNumber(entry.total)}</span>
                    <span class="score-rate">Ort: ${avgRate}</span>
                </div>
            </div>
            ${entry.notes ? `<div class="history-notes">📝 ${entry.notes}</div>` : ''}
            ${entry.reply ? `<div class="history-reply">❤️<strong>:</strong> ${entry.reply}</div>` : ''}
            <div class="reply-section">
                <button class="reply-btn" onclick="toggleReplyForm(${entry.id})">💬 Yorum Yaz</button>
                <div id="reply-form-${entry.id}" class="reply-form" style="display: none;">
                    <textarea id="reply-input-${entry.id}" class="reply-input" placeholder="Yorumunu buraya yaz..." rows="3">${entry.reply || ''}</textarea>
                    <div class="reply-actions">
                        <button class="btn-save-reply" onclick="saveReply(${entry.id})">💾 Kaydet</button>
                        <button class="btn-cancel-reply" onclick="toggleReplyForm(${entry.id})">❌ İptal</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Kayıt sil
// Yorum formunu aç/kapat
function toggleReplyForm(id) {
    const form = document.getElementById(`reply-form-${id}`);
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

// Yorum kaydet
async function saveReply(id) {
    const input = document.getElementById(`reply-input-${id}`);
    if (!input) return;

    const replyText = input.value.trim();
    
    if (replyText === '') {
        alert('⚠️ Yorum boş olamaz!');
        return;
    }

    // Kaydetme sırasında loading göster
    const originalValue = input.value;
    input.value = '⏳ Kaydediliyor...';
    input.disabled = true;

    const success = await updateReply(id, replyText);

    if (success) {
        // Formu kapat ve listeyi güncelle
        toggleReplyForm(id);
        await renderHistory();
        alert('✅ Yorum kaydedildi!');
    } else {
        // Hata durumunda eski değeri geri yükle
        input.value = originalValue;
        input.disabled = false;
    }
}

// Verileri dışa aktar (CSV formatında)
document.getElementById('exportBtn').addEventListener('click', async function() {
    const originalText = this.textContent;
    this.textContent = '⏳ Yükleniyor...';
    this.disabled = true;

    const data = await getData();

    this.textContent = originalText;
    this.disabled = false;

    if (data.length === 0) {
        alert('Dışa aktarılacak veri bulunmuyor!');
        return;
    }

    const normalizedData = data.map(entry => ({
        date: entry.date,
        math: entry.math_score,
        mathQuestions: entry.math_questions,
        mathRate: entry.math_success_rate,
        english: entry.english_score,
        englishQuestions: entry.english_questions,
        englishRate: entry.english_success_rate,
        total: entry.total_score,
        notes: entry.notes || ''
    }));

    // CSV formatında veri oluştur
    let csv = 'Tarih,Matematik Net,Mat Soru,Mat Başarı %,İngilizce Net,İng Soru,İng Başarı %,Toplam Net,Notlar\n';
    normalizedData.forEach(entry => {
        csv += `${formatDate(entry.date)},${entry.math},${entry.mathQuestions},${entry.mathRate?.toFixed(1) || ''},${entry.english},${entry.englishQuestions},${entry.englishRate?.toFixed(1) || ''},${entry.total},"${entry.notes}"\n`;
    });

    // Dosyayı indir
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nur_sat_netleri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Veriler başarıyla dışa aktarıldı!');
});

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', async function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const data = await getData();

    if (searchTerm === '') {
        await applySortAndFilter(data);
        return;
    }

    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
        mathQuestions: entry.math_questions,
        englishQuestions: entry.english_questions,
        mathSuccessRate: entry.math_success_rate,
        englishSuccessRate: entry.english_success_rate,
        notes: entry.notes || ''
    }));

    const filtered = normalizedData.filter(entry => {
        const dateStr = formatDate(entry.date).toLowerCase();
        const notesStr = entry.notes.toLowerCase();
        return dateStr.includes(searchTerm) || notesStr.includes(searchTerm);
    });

    await applySortAndFilter(filtered);
});

// Sıralama fonksiyonu
document.getElementById('sortSelect').addEventListener('change', async function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let data = await getData();

    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
        mathQuestions: entry.math_questions,
        englishQuestions: entry.english_questions,
        mathSuccessRate: entry.math_success_rate,
        englishSuccessRate: entry.english_success_rate,
        notes: entry.notes || ''
    }));

    if (searchTerm !== '') {
        data = normalizedData.filter(entry => {
            const dateStr = formatDate(entry.date).toLowerCase();
            const notesStr = entry.notes.toLowerCase();
            return dateStr.includes(searchTerm) || notesStr.includes(searchTerm);
        });
    } else {
        data = normalizedData;
    }

    await applySortAndFilter(data);
});

// Sıralama ve filtreleme uygula
async function applySortAndFilter(data) {
    const sortValue = document.getElementById('sortSelect').value;
    let sorted = [...data];

    switch(sortValue) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'math-desc':
            sorted.sort((a, b) => b.math - a.math);
            break;
        case 'english-desc':
            sorted.sort((a, b) => b.english - a.english);
            break;
        case 'total-desc':
            sorted.sort((a, b) => b.total - a.total);
            break;
    }

    await renderHistory(sorted);
}

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Uygulama başlatılıyor...');

    // Supabase bağlantısını test et
    try {
        const { data, error } = await supabaseClient.from('sat_scores').select('count').limit(1);
        if (error) {
            console.error('⚠️ Supabase bağlantı hatası:', error);
            alert('⚠️ Veritabanı bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin.');
        } else {
            console.log('✅ Supabase bağlantısı başarılı');
        }
    } catch (err) {
        console.error('❌ Bağlantı test hatası:', err);
        alert('❌ Supabase bağlantı testi başarısız! supabase-config.js dosyasını kontrol edin.');
    }

    // Bugünün tarihini varsayılan olarak ayarla
    document.getElementById('date').valueAsDate = new Date();

    // İstatistikleri ve geçmişi yükle
    await updateStats();
    await renderHistory();

    console.log('✅ Uygulama hazır (Supabase + Başarı Oranı sistemi)');
});