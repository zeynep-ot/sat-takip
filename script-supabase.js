// ===================================
// SUPABASE-ONLY VERSİYON (LocalStorage YOK)
// ===================================

// Kullanıcı ID'si - Gerçek uygulamada authentication ile gelecek
const USER_ID = 'nur_user_001'; // Şimdilik sabit ID kullanıyoruz

// Supabase'den verileri al
async function getData() {
    try {
        const { data, error } = await supabase
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
        // Supabase'e kaydet
        const { data, error } = await supabase
            .from('sat_scores')
            .insert([{
                user_id: USER_ID,
                date: entry.date,
                math_score: entry.math,
                english_score: entry.english,
                total_score: entry.total,
                notes: entry.notes
            }])
            .select();

        if (error) {
            console.error('Kayıt hatası:', error);
            alert('❌ Kayıt sırasında hata oluştu: ' + error.message);
            return false;
        }

        // Başarılı kayıt sonrası entry'ye ID ekle
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

// Supabase'den veri sil
async function deleteData(id) {
    try {
        const { error } = await supabase
            .from('sat_scores')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Silme hatası:', error);
            alert('❌ Silme sırasında hata oluştu: ' + error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Beklenmeyen hata:', err);
        return false;
    }
}

// Tüm verileri sil
async function clearAllData() {
    try {
        const { error } = await supabase
            .from('sat_scores')
            .delete()
            .eq('user_id', USER_ID);

        if (error) {
            console.error('Toplu silme hatası:', error);
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

// Form submit olayı
document.getElementById('netForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const math = parseFloat(document.getElementById('math').value);
    const english = parseFloat(document.getElementById('english').value);
    const notes = document.getElementById('notes').value.trim();

    // Validasyon - Sadece pozitif sayı kontrolü
    if (math < 0) {
        alert('Matematik neti 0 veya daha büyük olmalıdır!');
        return;
    }

    if (english < 0) {
        alert('İngilizce neti 0 veya daha büyük olmalıdır!');
        return;
    }

    // Yeni kayıt oluştur
    const newEntry = {
        date: date,
        math: math,
        english: english,
        total: math + english,
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

        // Başarı mesajı
        const motivationalMessages = [
            '✨ Harika gidiyorsun Nur! Gurur duyuyorum! 💕',
            '🌟 Bir adım daha ileri! Sen muhteşemsin aşkım! ❤️',
            '💫 Kaydedildi! Her gün biraz daha büyük başarılara! 💜',
            '🎯 Süpersin Nur! Hedeflerine yaklaşıyorsun! 💕',
            '⭐ Tebrikler! Çalışkan sevgilim benim! ❤️',
            '💝 Kaydedildi! Sen her şeyin en iyisini hak ediyorsun! 🌟'
        ];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        alert(randomMessage);
    }
});

// İstatistikleri güncelle
async function updateStats() {
    const data = await getData();

    if (data.length === 0) {
        // Veri yoksa sıfırları göster
        document.getElementById('mathAvg').textContent = '0.0';
        document.getElementById('mathMax').textContent = '0.0';
        document.getElementById('mathMin').textContent = '0.0';
        document.getElementById('mathWeekAvg').textContent = '0.0';

        document.getElementById('englishAvg').textContent = '0.0';
        document.getElementById('englishMax').textContent = '0.0';
        document.getElementById('englishMin').textContent = '0.0';
        document.getElementById('englishWeekAvg').textContent = '0.0';

        document.getElementById('totalTests').textContent = '0';
        document.getElementById('totalAvg').textContent = '0.0';
        document.getElementById('lastTestDate').textContent = '-';
        document.getElementById('progress').textContent = '📊';
        return;
    }

    // Supabase'den gelen veriler için field adlarını düzelt
    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
        notes: entry.notes
    }));

    // Matematik istatistikleri
    const mathScores = normalizedData.map(d => d.math);
    const mathAvg = mathScores.reduce((a, b) => a + b, 0) / mathScores.length;
    const mathMax = Math.max(...mathScores);
    const mathMin = Math.min(...mathScores);

    // İngilizce istatistikleri
    const englishScores = normalizedData.map(d => d.english);
    const englishAvg = englishScores.reduce((a, b) => a + b, 0) / englishScores.length;
    const englishMax = Math.max(...englishScores);
    const englishMin = Math.min(...englishScores);

    // Son 7 günün ortalaması
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentData = normalizedData.filter(d => new Date(d.date) >= sevenDaysAgo);

    let mathWeekAvg = 0;
    let englishWeekAvg = 0;

    if (recentData.length > 0) {
        mathWeekAvg = recentData.reduce((sum, d) => sum + d.math, 0) / recentData.length;
        englishWeekAvg = recentData.reduce((sum, d) => sum + d.english, 0) / recentData.length;
    }

    // Toplam istatistikler
    const totalAvg = (mathAvg + englishAvg);
    const sortedByDate = [...normalizedData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastTestDate = formatDate(sortedByDate[0].date);

    // İlerleme göstergesi
    let progressIcon = '📊';
    if (normalizedData.length >= 2) {
        const lastTwo = sortedByDate.slice(0, 2);
        if (lastTwo[0].total > lastTwo[1].total) {
            progressIcon = '📈 Yükseliş!';
        } else if (lastTwo[0].total < lastTwo[1].total) {
            progressIcon = '📉 Düşüş';
        } else {
            progressIcon = '➡️ Sabit';
        }
    }

    // HTML'e yazdır
    document.getElementById('mathAvg').textContent = formatNumber(mathAvg);
    document.getElementById('mathMax').textContent = formatNumber(mathMax);
    document.getElementById('mathMin').textContent = formatNumber(mathMin);
    document.getElementById('mathWeekAvg').textContent = formatNumber(mathWeekAvg);

    document.getElementById('englishAvg').textContent = formatNumber(englishAvg);
    document.getElementById('englishMax').textContent = formatNumber(englishMax);
    document.getElementById('englishMin').textContent = formatNumber(englishMin);
    document.getElementById('englishWeekAvg').textContent = formatNumber(englishWeekAvg);

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

    // Supabase'den gelen veriler için field adlarını düzelt
    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score || entry.math,
        english: entry.english_score || entry.english,
        total: entry.total_score || entry.total,
        notes: entry.notes
    }));

    // Tarihe göre sırala (en yeni önce)
    const sortedData = [...normalizedData].sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = sortedData.map(entry => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">📅 ${formatDate(entry.date)}</span>
                <button class="delete-btn" onclick="deleteEntry(${entry.id})">🗑️ Sil</button>
            </div>
            <div class="history-scores">
                <div class="score-item math">
                    <span class="score-label">Matematik</span>
                    <span class="score-value">${formatNumber(entry.math)}</span>
                </div>
                <div class="score-item english">
                    <span class="score-label">İngilizce</span>
                    <span class="score-value">${formatNumber(entry.english)}</span>
                </div>
                <div class="score-item total">
                    <span class="score-label">Toplam</span>
                    <span class="score-value">${formatNumber(entry.total)}</span>
                </div>
            </div>
            ${entry.notes ? `<div class="history-notes">📝 ${entry.notes}</div>` : ''}
        </div>
    `).join('');
}

// Kayıt sil
async function deleteEntry(id) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        // Silme sırasında loading göster
        const historyList = document.getElementById('historyList');
        const originalHTML = historyList.innerHTML;
        historyList.innerHTML = '<p class="empty-message">⏳ Siliniyor...</p>';

        const success = await deleteData(id);

        if (success) {
            await updateStats();
            await renderHistory();
        } else {
            // Hata durumunda eski içeriği geri yükle
            historyList.innerHTML = originalHTML;
        }
    }
}

// Tüm kayıtları sil
document.getElementById('clearBtn').addEventListener('click', async function() {
    if (confirm('⚠️ TÜM KAYITLARI SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!')) {
        if (confirm('Son kez soruyorum: Tüm veriler silinecek, emin misiniz?')) {
            // Silme sırasında loading göster
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '<p class="empty-message">⏳ Tüm kayıtlar siliniyor...</p>';

            const success = await clearAllData();

            if (success) {
                await updateStats();
                await renderHistory();
                alert('✅ Tüm kayıtlar silindi.');
            } else {
                alert('❌ Silme işlemi başarısız oldu!');
                await renderHistory();
            }
        }
    }
});

// Verileri dışa aktar (CSV formatında)
document.getElementById('exportBtn').addEventListener('click', async function() {
    // Export sırasında loading göster
    const originalText = this.textContent;
    this.textContent = '⏳ Yükleniyor...';
    this.disabled = true;

    const data = await getData();

    // Butonu eski haline getir
    this.textContent = originalText;
    this.disabled = false;

    if (data.length === 0) {
        alert('Dışa aktarılacak veri bulunmuyor!');
        return;
    }

    // Supabase'den gelen veriler için field adlarını düzelt
    const normalizedData = data.map(entry => ({
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
        notes: entry.notes || ''
    }));

    // CSV formatında veri oluştur
    let csv = 'Tarih,Matematik,İngilizce,Toplam,Notlar\n';
    normalizedData.forEach(entry => {
        csv += `${formatDate(entry.date)},${entry.math},${entry.english},${entry.total},"${entry.notes}"\n`;
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

    // Supabase'den gelen veriler için field adlarını düzelt
    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
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

    // Supabase'den gelen veriler için field adlarını düzelt
    const normalizedData = data.map(entry => ({
        id: entry.id,
        date: entry.date,
        math: entry.math_score,
        english: entry.english_score,
        total: entry.total_score,
        notes: entry.notes || ''
    }));

    // Önce arama filtresi uygula
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
        const { data, error } = await supabase.from('sat_scores').select('count').limit(1);
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

    console.log('✅ Uygulama hazır (Supabase-only mode)');
});