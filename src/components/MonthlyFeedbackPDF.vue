<template>
  <div id="pdf-content" class="pdf-container">
    <div class="pdf-page">
      <!-- Header with Banner Image -->
      <div class="header-banner">
        <img :src="images.header" alt="Student Report Banner" />
      </div>

      <!-- Student Information Section -->
      <div class="info-section">
        <div class="info-box">
          <h3>Informasi Siswa</h3>
          <div class="info-row">
            <label>Nama:</label>
            <span>{{ data.studentName }}</span>
          </div>
          <div class="info-row">
            <label>Kursus:</label>
            <span>{{ data.courseName }}</span>
          </div>
          <div class="info-row">
            <label>Lama Pelatihan:</label>
            <span>{{ data.duration }}</span>
          </div>
        </div>

        <div class="score-box">
          <h3>Skor Total</h3>
          <div class="level-text">{{ data.level }}</div>
          <div class="stars">★★★★★</div>
        </div>
      </div>

      <!-- Project Section -->
      <div class="project-section">
        <div class="section-title">
          <img :src="images.trophy" alt="icon" class="title-icon" />
          <h4>Proyek hasil Student</h4>
        </div>
        <div class="project-content">
          <p>Proyek akhir diakses melalui link dibawah ini:</p>
          <a :href="data.youtubeLink" target="_blank" class="project-link">
            <img :src="images.module" alt="icon" class="link-icon" />
            Proyek Akhir Bulan Ini
          </a>
        </div>
      </div>

      <!-- Free Lesson Section -->
      <div class="free-lesson-section">
        <div class="section-title">
          <img :src="images.gift" alt="icon" class="title-icon" />
          <h4>Free Lesson</h4>
        </div>
        <div class="lesson-content">
          <p>Mau dapatkan free lesson?</p>
          <a :href="data.referralLink" target="_blank" class="referral-link">
            <img :src="images.module" alt="icon" class="link-icon" />
            Bagikan link ini dan dapatkan reward class gratis!
          </a>
        </div>
      </div>

      <!-- Module Section -->
      <div class="module-section">
        <div class="section-row">
          <div class="module-left">
            <div class="section-title">
              <img :src="images.module" alt="icon" class="title-icon" />
              <h4>Tentang Modul Ini</h4>
            </div>
            <div class="module-content">
              <div class="module-field">
                <label>Topik Modul</label>
                <p>{{ data.topicModule }}</p>
              </div>
              <div class="module-field">
                <label>Hasil:</label>
                <p>{{ data.result }}</p>
              </div>
              <div class="progress-text">
                Menyelesaikan {{ data.month }} dari 9 bulan pembelajaran di
                {{ data.level }}
              </div>
            </div>
          </div>

          <div class="module-right">
            <div class="section-title">
              <img :src="images.skills" alt="icon" class="title-icon" />
              <h4>Keahlian yang Didapatkan</h4>
            </div>
            <div class="skills-content">
              <p>{{ data.skillsAcquired }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Journey Section -->
      <div class="journey-section">
        <img :src="images.skills" alt="Journey" class="journey-image" />
      </div>

      <!-- Tutor Feedback Section -->
      <div class="feedback-section">
        <div class="section-title">
          <img :src="images.feedback" alt="icon" class="title-icon" />
          <h4>Tutor's Feedback</h4>
        </div>
        <div class="feedback-content">
          <p>{{ data.tutorComment }}</p>
        </div>
      </div>

      <!-- Module Link Section -->
      <div class="module-link-section">
        <p>Informasi lebih lanjut dapat diakses melalui link berikut:</p>
        <a
          href="https://drive.google.com/drive/u/0/folders/1lErW_RKjHOkAgqCr9yymELg3yUZzvBEb"
          target="_blank"
          class="module-link"
        >
          <img :src="images.link" alt="icon" class="link-icon" />
          Lihat Modul Lengkap
        </a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Laporan dibuat oleh: Niko Muhamad Fajar</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import images from "../utils/images.js";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.pdf-container {
  background: white;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: "Manrope", Arial, sans-serif;
}

.pdf-page {
  padding: 20px;
  background: white;
}

.header-banner {
  width: 100%;
  margin-bottom: 20px;
}

.header-banner img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.info-box,
.score-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
}

.info-box h3,
.score-box h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 700;
  color: #351c75;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.info-row label {
  font-weight: 700;
  color: #351c75;
  min-width: 120px;
}

.info-row span {
  color: #333;
}

.score-box {
  text-align: center;
  background: linear-gradient(135deg, #d9d2e9 0%, #e8e0f5 100%);
}

.level-text {
  font-size: 20px;
  font-weight: 700;
  color: #351c75;
  margin: 10px 0;
}

.stars {
  font-size: 32px;
  color: #674ea7;
  letter-spacing: 4px;
}

.project-section,
.free-lesson-section {
  background: #fff2cc;
  padding: 16px;
  border-radius: 12px;
  border: 3px solid #9900ff;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.section-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

.title-icon {
  width: 24px;
  height: 24px;
}

.project-content,
.lesson-content {
  padding-left: 34px;
}

.project-link,
.referral-link,
.module-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-decoration: none;
  color: #1155cc;
  font-weight: 600;
  margin-top: 8px;
  transition: all 0.2s;
}

.project-link:hover,
.referral-link:hover,
.module-link:hover {
  background: #f0f0f0;
  transform: translateX(2px);
}

.link-icon {
  width: 20px;
  height: 20px;
}

.module-section {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.module-field {
  margin-bottom: 16px;
}

.module-field label {
  display: block;
  font-weight: 700;
  color: #351c75;
  margin-bottom: 6px;
  font-size: 14px;
}

.module-field p,
.skills-content p,
.feedback-content p {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.progress-text {
  background: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: #351c75;
  border: 1px solid #e0e0e0;
  margin-top: 16px;
}

.journey-section {
  margin: 20px 0;
  text-align: center;
}

.journey-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

.feedback-section {
  background: white;
  border: 2px solid #9900ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.feedback-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
}

.module-link-section {
  background: #f8f8eb;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.module-link-section p {
  margin: 0 0 12px 0;
  color: #333;
  font-weight: 600;
}

.footer {
  text-align: center;
  padding: 16px;
  color: #666;
  font-style: italic;
  font-size: 14px;
}

.footer p {
  margin: 0;
}
</style>
