// LocalStorage'dan verileri al
function getData() {
    const data = localStorage.getItem('satData');
    return data ? JSON.parse(data) : [];
}

// LocalStorage'a verileri kaydet
function saveData(data) {
    localStorage.setItem('satData', JSON.stringify(data));
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
document.getElementById('netForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const math = parseFloat(document.getElementById('math').value);
    const english = parseFloat(document.getElementById('english').value);
    const notes = document.getElementById('notes').value.trim();
    
    // Validasyon
    if (math < 0 || math > 58) {
        alert('Matematik neti 0-58 arasında olmalıdır!');
        return;
    }
    
    if (english < 0 || english > 52) {
        alert('İngilizce neti 0-52 arasında olmalıdır!');
        return;
    }
    
    // Yeni kayıt oluştur
    const newEntry = {
        id: Date.now(),
        date: date,
        math: math,
        english: english,
        total: math + english,
        notes: notes
    };
    
    // Verileri kaydet
    const data = getData();
    data.push(newEntry);
    saveData(data);
    
    // Formu temizle
    this.reset();
    
    // Bugünün tarihini varsayılan olarak ayarla
    document.getElementById('date').valueAsDate = new Date();
    
    // Sayfayı güncelle
    updateStats();
    renderHistory();
    
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
});

// İstatistikleri güncelle
function updateStats() {
    const data = getData();
    
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
    
    // Matematik istatistikleri
    const mathScores = data.map(d => d.math);
    const mathAvg = mathScores.reduce((a, b) => a + b, 0) / mathScores.length;
    const mathMax = Math.max(...mathScores);
    const mathMin = Math.min(...mathScores);
    
    // İngilizce istatistikleri
    const englishScores = data.map(d => d.english);
    const englishAvg = englishScores.reduce((a, b) => a + b, 0) / englishScores.length;
    const englishMax = Math.max(...englishScores);
    const englishMin = Math.min(...englishScores);
    
    // Son 7 günün ortalaması
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentData = data.filter(d => new Date(d.date) >= sevenDaysAgo);
    
    let mathWeekAvg = 0;
    let englishWeekAvg = 0;
    
    if (recentData.length > 0) {
        mathWeekAvg = recentData.reduce((sum, d) => sum + d.math, 0) / recentData.length;
        englishWeekAvg = recentData.reduce((sum, d) => sum + d.english, 0) / recentData.length;
    }
    
    // Toplam istatistikler
    const totalAvg = (mathAvg + englishAvg);
    const sortedByDate = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastTestDate = formatDate(sortedByDate[0].date);
    
    // İlerleme göstergesi
    let progressIcon = '📊';
    if (data.length >= 2) {
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
    
    document.getElementById('totalTests').textContent = data.length;
    document.getElementById('totalAvg').textContent = formatNumber(totalAvg);
    document.getElementById('lastTestDate').textContent = lastTestDate;
    document.getElementById('progress').textContent = progressIcon;
}

// Geçmişi render et
function renderHistory(filteredData = null) {
    const data = filteredData || getData();
    const historyList = document.getElementById('historyList');
    
    if (data.length === 0) {
        historyList.innerHTML = '<p class="empty-message">Henüz kayıt bulunmuyor. Yukarıdaki formdan net girişi yapabilirsiniz.</p>';
        return;
    }
    
    // Tarihe göre sırala (en yeni önce)
    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
function deleteEntry(id) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        let data = getData();
        data = data.filter(entry => entry.id !== id);
        saveData(data);
        updateStats();
        renderHistory();
    }
}

// Tüm kayıtları sil
document.getElementById('clearBtn').addEventListener('click', function() {
    if (confirm('⚠️ TÜM KAYITLARI SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!')) {
        if (confirm('Son kez soruyorum: Tüm veriler silinecek, emin misiniz?')) {
            localStorage.removeItem('satData');
            updateStats();
            renderHistory();
            alert('✅ Tüm kayıtlar silindi.');
        }
    }
});

// Verileri dışa aktar (CSV formatında)
document.getElementById('exportBtn').addEventListener('click', function() {
    const data = getData();
    
    if (data.length === 0) {
        alert('Dışa aktarılacak veri bulunmuyor!');
        return;
    }
    
    // CSV formatında veri oluştur
    let csv = 'Tarih,Matematik,İngilizce,Toplam,Notlar\n';
    data.forEach(entry => {
        csv += `${formatDate(entry.date)},${entry.math},${entry.english},${entry.total},"${entry.notes}"\n`;
    });
    
    // Dosyayı indir
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sat_netleri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ Veriler başarıyla dışa aktarıldı!');
});

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const data = getData();
    
    if (searchTerm === '') {
        applySortAndFilter(data);
        return;
    }
    
    const filtered = data.filter(entry => {
        const dateStr = formatDate(entry.date).toLowerCase();
        const notesStr = entry.notes.toLowerCase();
        return dateStr.includes(searchTerm) || notesStr.includes(searchTerm);
    });
    
    applySortAndFilter(filtered);
});

// Sıralama fonksiyonu
document.getElementById('sortSelect').addEventListener('change', function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let data = getData();
    
    // Önce arama filtresi uygula
    if (searchTerm !== '') {
        data = data.filter(entry => {
            const dateStr = formatDate(entry.date).toLowerCase();
            const notesStr = entry.notes.toLowerCase();
            return dateStr.includes(searchTerm) || notesStr.includes(searchTerm);
        });
    }
    
    applySortAndFilter(data);
});

// Sıralama ve filtreleme uygula
function applySortAndFilter(data) {
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
    
    renderHistory(sorted);
}

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', function() {
    // Bugünün tarihini varsayılan olarak ayarla
    document.getElementById('date').valueAsDate = new Date();
    
    // İstatistikleri ve geçmişi yükle
    updateStats();
    renderHistory();
});
