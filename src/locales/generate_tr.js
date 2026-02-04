const fs = require('fs');

const turkishTranslation = {
  "auth": {
    "login": {
      "tab_signin": "Giriş Yap",
      "tab_signup": "Hesap Oluştur",
      "label_email": "E-posta",
      "label_password": "Şifre",
      "label_name": "Ad Soyad",
      "label_confirm_password": "Şifre Tekrar",
      "button_signin": "Giriş Yap",
      "button_signup": "Kayıt Ol",
      "button_continue_google": "Google ile Devam Et",
      "button_continue_apple": "Apple ile Devam Et",
      "link_forgot_password": "Şifremi Unuttum?",
      "link_have_account": "Zaten hesabınız var mı?",
      "link_no_account": "Hesabınız yok mu?",
      "error_invalid_email": "Lütfen geçerli bir e-posta adresi girin",
      "error_password_required": "Şifre gereklidir",
      "error_password_min_length": "Şifre en az 6 karakter olmalıdır",
      "error_passwords_no_match": "Şifreler eşleşmiyor",
      "error_name_required": "Ad soyad gereklidir",
      "error_invalid_credentials": "Geçersiz e-posta veya şifre",
      "error_email_exists": "Bu e-posta adresi zaten kullanılıyor",
      "error_network": "Ağ hatası. Lütfen tekrar deneyin.",
      "success_signup": "Hesap başarıyla oluşturuldu!",
      "success_signin": "Tekrar hoş geldiniz!",
      "loading_signin": "Giriş yapılıyor...",
      "loading_signup": "Hesap oluşturuluyor..."
    },
    "forgot_password": {
      "title": "Şifremi Sıfırla",
      "description": "Sıfırlama talimatlarını almak için e-postanızı girin",
      "button_send": "Sıfırlama Bağlantısı Gönder",
      "button_back": "Girişe Dön",
      "success": "Sıfırlama bağlantısı e-postanıza gönderildi",
      "error": "Sıfırlama bağlantısı gönderilemedi"
    },
    "verification": {
      "title": "E-posta Doğrulama",
      "description": "Doğrulama kodunu şu adrese gönderdik:",
      "button_verify": "Doğrula",
      "button_resend": "Kodu Tekrar Gönder",
      "error_invalid_code": "Geçersiz doğrulama kodu",
      "success": "E-posta başarıyla doğrulandı!"
    }
  },
  "onboarding": {
    "welcome": {
      "title": "MyTaco AI'ya Hoş Geldiniz",
      "subtitle": "Kişisel yapay zeka dil öğretmeniniz",
      "button_get_started": "Başlayalım",
      "button_skip": "Atla"
    },
    "slides": {
      "slide1_title": "Doğal Şekilde Öğrenin",
      "slide1_description": "Hedef dilinizde yapay zeka öğretmenlerle gerçek konuşmalar yapın",
      "slide2_title": "İlerlemenizi Takip Edin",
      "slide2_description": "Her konuşmayla birlikte konuşma DNA'nızın gelişimini izleyin",
      "slide3_title": "Motive Kalın",
      "slide3_description": "XP kazanın, görevleri tamamlayın ve başarılarınızı kutlayın"
    },
    "benefits": {
      "pill_unlimited_practice": "Sınırsız Pratik",
      "pill_ai_tutor": "7/24 Yapay Zeka Öğretmen",
      "pill_real_conversations": "Gerçek Konuşmalar",
      "pill_instant_feedback": "Anlık Geri Bildirim"
    }
  },
  "dashboard": {
    "header": {
      "premium_badge": "Premium",
      "minutes_remaining": "{{minutes}} dk",
      "unlimited": "Sınırsız"
    },
    "tabs": {
      "learn": "Öğren",
      "explore": "Keşfet",
      "news": "Haberler",
      "profile": "Profil"
    },
    "greeting": {
      "morning": "Günaydın",
      "afternoon": "İyi günler",
      "evening": "İyi akşamlar",
      "night": "İyi geceler"
    },
    "quick_start": {
      "title": "Hızlı Başlat",
      "subtitle": "Öğrenme modunuzu seçin",
      "button_freestyle": "Serbest Sohbet",
      "button_topic": "Konulu Pratik",
      "button_news": "Haber Tartışması"
    },
    "streak": {
      "days": "{{count}} günlük seri",
      "days_plural": "{{count}} günlük seri"
    }
  },
  "practice": {
    "conversation": {
      "title": "Konuşma Pratiği",
      "subtitle": "Tercihlerinizi seçin",
      "label_language": "Dil",
      "label_level": "Seviye",
      "label_topic": "Konu",
      "button_start": "Pratiğe Başla",
      "button_end": "Oturumu Bitir",
      "placeholder_type_message": "Mesajınızı yazın...",
      "recording": "Kayıt ediliyor...",
      "processing": "İşleniyor...",
      "listening": "Dinleniyor..."
    },
    "languages": {
      "english": "İngilizce",
      "spanish": "İspanyolca",
      "french": "Fransızca",
      "german": "Almanca",
      "dutch": "Hollandaca",
      "portuguese": "Portekizce",
      "turkish": "Türkçe",
      "italian": "İtalyanca",
      "russian": "Rusça",
      "japanese": "Japonca",
      "korean": "Korece",
      "chinese": "Çince"
    },
    "levels": {
      "beginner": "Başlangıç",
      "elementary": "Temel",
      "intermediate": "Orta",
      "upper_intermediate": "Orta Üstü",
      "advanced": "İleri",
      "proficient": "Uzman"
    },
    "topics": {
      "travel": "Seyahat ve Turizm",
      "food": "Yemek ve Restoran",
      "business": "İş ve Kariyer",
      "culture": "Kültür ve Sanat",
      "sports": "Spor ve Fitness",
      "technology": "Teknoloji",
      "health": "Sağlık ve Yaşam",
      "education": "Eğitim",
      "family": "Aile ve Arkadaşlar",
      "shopping": "Alışveriş",
      "hobbies": "Hobiler ve İlgi Alanları",
      "environment": "Çevre",
      "freestyle": "Serbest Sohbet"
    }
  },
  "assessment": {
    "speaking": {
      "title": "Konuşma Değerlendirmesi",
      "subtitle": "Konuşma becerilerinizi değerlendirin",
      "instruction_record": "Mikrofona dokunun ve net bir şekilde konuşun",
      "instruction_reading": "Aşağıdaki metni sesli okuyun",
      "button_record": "Kaydı Başlat",
      "button_stop": "Kaydı Durdur",
      "button_submit": "Değerlendirmeyi Gönder",
      "recording_timer": "Kayıt: {{seconds}}s",
      "processing": "Konuşmanız analiz ediliyor...",
      "error_no_recording": "Lütfen önce yanıtınızı kaydedin",
      "error_too_short": "Kayıt çok kısa. En az 5 saniye konuşun."
    },
    "results": {
      "title": "Değerlendirme Sonuçları",
      "score_overall": "Genel Puan",
      "score_pronunciation": "Telaffuz",
      "score_fluency": "Akıcılık",
      "score_accuracy": "Doğruluk",
      "score_vocabulary": "Kelime Bilgisi",
      "label_excellent": "Mükemmel",
      "label_good": "İyi",
      "label_fair": "Orta",
      "label_needs_work": "Geliştirilmeli",
      "button_continue": "Öğrenmeye Devam Et",
      "button_retry": "Tekrar Dene"
    }
  },
  "profile": {
    "tabs": {
      "overview": "Genel",
      "progress": "İlerleme",
      "flashcards": "Kartlar",
      "dna": "DNA"
    },
    "overview": {
      "title": "Profil",
      "label_email": "E-posta",
      "label_name": "Ad",
      "label_member_since": "Üyelik Tarihi",
      "label_subscription": "Abonelik",
      "label_languages": "Öğrenilen Diller",
      "button_edit": "Profili Düzenle",
      "button_settings": "Uygulama Ayarları",
      "button_logout": "Çıkış Yap"
    },
    "settings": {
      "title": "Uygulama Ayarları",
      "section_general": "Genel",
      "section_notifications": "Bildirimler",
      "section_language": "Dil",
      "section_privacy": "Gizlilik",
      "label_app_language": "Uygulama Dili",
      "label_notifications_enabled": "Bildirimleri Etkinleştir",
      "label_sound_enabled": "Ses Efektleri",
      "label_haptics_enabled": "Titreşim Geri Bildirimi",
      "label_dark_mode": "Karanlık Mod",
      "button_save": "Değişiklikleri Kaydet",
      "button_cancel": "İptal"
    },
    "progress": {
      "title": "İlerlemeniz",
      "label_total_sessions": "Toplam Oturum",
      "label_practice_time": "Pratik Süresi",
      "label_words_learned": "Öğrenilen Kelimeler",
      "label_current_streak": "Güncel Seri",
      "label_longest_streak": "En Uzun Seri",
      "label_xp_earned": "Kazanılan XP",
      "chart_title_weekly": "Haftalık Aktivite",
      "chart_title_monthly": "Aylık İlerleme",
      "no_data": "Henüz ilerleme verisi yok. Pratik yapmaya başlayın!"
    },
    "dna": {
      "title": "Konuşma DNA'sı",
      "subtitle": "Benzersiz konuşma parmak iziniz",
      "label_select_language": "Dil Seçin",
      "strand_confidence": "Özgüven",
      "strand_vocabulary": "Kelime Bilgisi",
      "strand_accuracy": "Doğruluk",
      "strand_rhythm": "Ritim",
      "strand_learning": "Öğrenme",
      "strand_emotional": "Duygusal",
      "level_excellent": "MÜKEMMEl",
      "level_good": "İYİ",
      "level_fair": "ORTA",
      "level_developing": "GELİŞİYOR",
      "no_data": "Henüz DNA verisi yok. İlk değerlendirmenizi tamamlayın!",
      "button_track_progress": "İlerlemenizi Takip Edin"
    }
  },
  "explore": {
    "title": "Günlük Görevler",
    "subtitle": "Görevleri tamamlayarak bonus XP kazanın",
    "challenge_types": {
      "vocabulary": "Kelime Bilgisi",
      "pronunciation": "Telaffuz",
      "grammar": "Dilbilgisi",
      "listening": "Dinleme",
      "conversation": "Konuşma",
      "cultural": "Kültür"
    },
    "status": {
      "not_started": "Başlanmadı",
      "in_progress": "Devam Ediyor",
      "completed": "Tamamlandı"
    },
    "button_start": "Göreve Başla",
    "button_continue": "Devam Et",
    "button_retry": "Tekrar Dene",
    "reward": "+{{xp}} XP",
    "no_challenges": "Bugün için görev yok. Yarın tekrar bakın!"
  },
  "news": {
    "title": "Günlük Haberler",
    "subtitle": "Güncel olaylarla pratik yapın",
    "categories": {
      "world": "Dünya",
      "business": "İş Dünyası",
      "technology": "Teknoloji",
      "sports": "Spor",
      "entertainment": "Eğlence",
      "science": "Bilim"
    },
    "button_read": "Haberi Oku",
    "button_discuss": "Yapay Zeka ile Tartış",
    "reading_time": "{{minutes}} dk okuma",
    "published": "{{time}} yayınlandı",
    "no_news": "Haber makalesi bulunmuyor"
  },
  "flashcards": {
    "title": "Kelime Kartları",
    "subtitle": "Kelime dağarcığınızı gözden geçirin",
    "button_study": "Çalışmaya Başla",
    "button_add": "Kart Ekle",
    "label_front": "Ön Yüz",
    "label_back": "Arka Yüz",
    "label_difficulty": "Zorluk",
    "difficulty_easy": "Kolay",
    "difficulty_medium": "Orta",
    "difficulty_hard": "Zor",
    "status_mastered": "Öğrenildi",
    "status_learning": "Öğreniliyor",
    "status_new": "Yeni",
    "no_cards": "Henüz kelime kartı yok. İlk kartınızı ekleyin!"
  },
  "subscription": {
    "title": "Premium'a Yükseltin",
    "subtitle": "Sınırsız öğrenmenin kilidini açın",
    "features": {
      "unlimited_practice": "Sınırsız pratik oturumu",
      "speaking_dna": "Konuşma DNA analizi",
      "advanced_feedback": "Gelişmiş yapay zeka geri bildirimi",
      "priority_support": "Öncelikli destek",
      "offline_mode": "Çevrimdışı mod",
      "custom_topics": "Özel konular",
      "no_ads": "Reklamsız deneyim"
    },
    "plans": {
      "monthly": "Aylık",
      "yearly": "Yıllık",
      "lifetime": "Ömür Boyu"
    },
    "price_monthly": "₺349,99/ay",
    "price_yearly": "₺2.799,99/yıl",
    "price_yearly_savings": "%33 tasarruf",
    "price_lifetime": "₺10.499,99 tek seferlik",
    "button_subscribe": "Şimdi Abone Ol",
    "button_restore": "Satın Alımları Geri Yükle",
    "button_cancel": "Belki Sonra",
    "trial": "7 günlük ücretsiz deneme",
    "terms": "Hizmet Koşulları",
    "privacy": "Gizlilik Politikası",
    "auto_renew": "Dönem bitmeden 24 saat önce iptal edilmezse otomatik yenilenir"
  },
  "notifications": {
    "title": "Bildirimler",
    "empty": "Henüz bildirim yok",
    "mark_as_read": "Okundu Olarak İşaretle",
    "delete": "Sil",
    "swipe_instructions": "Silmek için sola, okundu olarak işaretlemek için sağa kaydırın",
    "types": {
      "system": "Sistem",
      "achievement": "Başarı",
      "reminder": "Hatırlatma",
      "update": "Güncelleme"
    }
  },
  "modals": {
    "confirm": {
      "title": "İşlemi Onayla",
      "button_confirm": "Onayla",
      "button_cancel": "İptal"
    },
    "error": {
      "title": "Hata",
      "button_ok": "Tamam",
      "button_retry": "Tekrar Dene",
      "default_message": "Bir şeyler yanlış gitti. Lütfen tekrar deneyin."
    },
    "success": {
      "title": "Başarılı",
      "button_ok": "Tamam"
    },
    "logout": {
      "title": "Çıkış Yap",
      "message": "Çıkış yapmak istediğinizden emin misiniz?",
      "button_logout": "Çıkış Yap",
      "button_cancel": "İptal"
    },
    "delete_account": {
      "title": "Hesabı Sil",
      "message": "Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.",
      "button_delete": "Hesabı Sil",
      "button_cancel": "İptal"
    },
    "end_session": {
      "title": "Oturumu Bitir",
      "message": "Bu pratik oturumunu bitirmek istediğinizden emin misiniz?",
      "button_end": "Oturumu Bitir",
      "button_continue": "Pratiğe Devam Et"
    }
  },
  "toasts": {
    "success_save": "Değişiklikler başarıyla kaydedildi",
    "success_delete": "Başarıyla silindi",
    "success_copy": "Panoya kopyalandı",
    "error_network": "Ağ hatası. Bağlantınızı kontrol edin.",
    "error_save": "Değişiklikler kaydedilemedi",
    "error_load": "Veriler yüklenemedi",
    "info_coming_soon": "Çok yakında!"
  },
  "empty_states": {
    "no_data": "Veri bulunmuyor",
    "no_results": "Sonuç bulunamadı",
    "no_sessions": "Henüz pratik oturumu yok",
    "no_progress": "İlerleme verisi yok",
    "no_flashcards": "Henüz kelime kartı yok",
    "no_challenges": "Görev bulunmuyor",
    "no_news": "Haber makalesi yok",
    "start_learning": "İlerlemenizi görmek için öğrenmeye başlayın"
  },
  "buttons": {
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "add": "Ekle",
    "remove": "Kaldır",
    "back": "Geri",
    "next": "İleri",
    "done": "Bitti",
    "skip": "Atla",
    "retry": "Tekrar Dene",
    "continue": "Devam Et",
    "start": "Başla",
    "stop": "Durdur",
    "close": "Kapat",
    "ok": "Tamam",
    "yes": "Evet",
    "no": "Hayır",
    "confirm": "Onayla",
    "submit": "Gönder",
    "send": "Gönder",
    "share": "Paylaş",
    "copy": "Kopyala",
    "paste": "Yapıştır",
    "learn_more": "Daha Fazla Bilgi"
  },
  "common": {
    "loading": "Yükleniyor...",
    "processing": "İşleniyor...",
    "saving": "Kaydediliyor...",
    "deleting": "Siliniyor...",
    "please_wait": "Lütfen bekleyin...",
    "or": "veya",
    "and": "ve",
    "of": "ile ilgili",
    "to": "için",
    "from": "dan/den",
    "in": "içinde",
    "at": "de/da",
    "on": "üzerinde",
    "by": "tarafından",
    "with": "ile",
    "for": "için"
  },
  "time": {
    "now": "şimdi",
    "minutes_ago": "{{count}} dakika önce",
    "minutes_ago_plural": "{{count}} dakika önce",
    "hours_ago": "{{count}} saat önce",
    "hours_ago_plural": "{{count}} saat önce",
    "days_ago": "{{count}} gün önce",
    "days_ago_plural": "{{count}} gün önce",
    "weeks_ago": "{{count}} hafta önce",
    "weeks_ago_plural": "{{count}} hafta önce",
    "months_ago": "{{count}} ay önce",
    "months_ago_plural": "{{count}} ay önce",
    "years_ago": "{{count}} yıl önce",
    "years_ago_plural": "{{count}} yıl önce"
  },
  "units": {
    "minutes": "{{count}} dakika",
    "minutes_plural": "{{count}} dakika",
    "hours": "{{count}} saat",
    "hours_plural": "{{count}} saat",
    "days": "{{count}} gün",
    "days_plural": "{{count}} gün",
    "weeks": "{{count}} hafta",
    "weeks_plural": "{{count}} hafta",
    "sessions": "{{count}} oturum",
    "sessions_plural": "{{count}} oturum",
    "words": "{{count}} kelime",
    "words_plural": "{{count}} kelime"
  },
  "achievements": {
    "title": "Başarılar",
    "unlocked": "Kazanıldı",
    "locked": "Kilitli",
    "progress": "{{current}}/{{total}}",
    "types": {
      "first_session": "İlk Oturum",
      "week_streak": "Haftalık Seri",
      "month_streak": "Aylık Seri",
      "hours_practiced": "Pratik Ustası",
      "words_learned": "Kelime Ustası",
      "challenges_completed": "Görev Ustası",
      "perfect_pronunciation": "Mükemmel Telaffuz"
    }
  },
  "gamification": {
    "xp": "XP",
    "level": "Seviye {{level}}",
    "next_level": "Sonraki Seviye",
    "xp_to_next_level": "Seviye {{level}} için {{xp}} XP",
    "xp_earned": "+{{xp}} XP",
    "milestone_reached": "Başarı Kazanıldı!",
    "level_up": "Seviye Atladınız!"
  },
  "voice": {
    "recording": "Kaydediliyor...",
    "processing": "Ses işleniyor...",
    "analyzing": "Konuşma analiz ediliyor...",
    "error_permission": "Mikrofon izni reddedildi",
    "error_recording": "Ses kaydedilemedi",
    "error_playback": "Ses oynatılamadı",
    "button_record": "Kaydet",
    "button_stop": "Durdur",
    "button_play": "Oynat",
    "button_pause": "Duraklat"
  },
  "errors": {
    "network": "Ağ hatası. Lütfen bağlantınızı kontrol edin.",
    "timeout": "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
    "unauthorized": "Oturum süresi doldu. Lütfen tekrar giriş yapın.",
    "forbidden": "Bu içeriğe erişim izniniz yok.",
    "not_found": "Kaynak bulunamadı.",
    "server_error": "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
    "unknown": "Beklenmeyen bir hata oluştu.",
    "validation": "Lütfen girişinizi kontrol edip tekrar deneyin.",
    "file_too_large": "Dosya çok büyük.",
    "invalid_format": "Geçersiz dosya formatı."
  }
};

fs.writeFileSync(__dirname + '/tr.json', JSON.stringify(turkishTranslation, null, 2), 'utf8');
console.log('Turkish translation file generated successfully at:', __dirname + '/tr.json');
