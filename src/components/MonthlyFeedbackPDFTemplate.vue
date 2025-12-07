<template>
  <div class="pdf-template">
    <!-- Header Banner (With Margin) -->
    <div class="header-banner">
      <img :src="images.header" alt="Student's Report Header" />
    </div>

    <!-- Content Container -->
    <div class="content-container">
      <!-- Info Section -->
      <div class="info-score-section">
        <div class="info-box">
          <h3 class="box-title">Informasi Siswa</h3>
          <div class="info-table">
            <div class="info-row">
              <div class="label">Nama :</div>
              <div class="value-wrapper">
                <div class="value">{{ data.studentName }}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="label">Kursus:</div>
              <div class="value-wrapper">
                <div class="value">{{ data.courseName }}</div>
              </div>
            </div>
            <div class="info-row last">
              <div class="label">Lama Pelatihan:</div>
              <div class="value-wrapper">
                <div class="value">{{ data.duration }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="score-box">
          <h3 class="box-title center">Skor Total</h3>
          <div class="level-text">{{ data.level }}</div>
          <div class="stars">{{ renderStars(data.rating || 5) }}</div>
        </div>
      </div>

      <!-- Project Section & Free Lesson (Side by Side) -->
      <div class="yellow-box-container">
        <div class="yellow-box-half">
          <div class="yellow-header-centered">
            <img :src="images.trophy" alt="Trophy" class="icon-img" />
            <h3>Proyek hasil Student</h3>
          </div>
          <div class="yellow-content-wrapper">
            <p class="yellow-text">Proyek akhir diakses melalui link dibawah ini:</p>
            <div class="link-row">
              <img :src="images.link" alt="Link" class="icon-img-small" />
              <a :href="data.youtubeLink" target="_blank">Proyek Akhir Bulan Ini</a>
            </div>
          </div>
        </div>

        <div class="yellow-box-half white-bg">
          <div class="yellow-header-centered">
            <img :src="images.skills" alt="Free Lesson" class="icon-img" />
            <h3>Free Lesson</h3>
          </div>
          <div class="yellow-content-wrapper">
            <p
              class="yellow-text"
              style="margin: 3px 0"
            >
              <img
                :src="images.freeLessonGift"
                alt="Gift"
                class="icon-img-inline"
              />
              <span>Mau dapatkan free lesson?</span>
            </p>
            <div class="link-row">
              <img :src="images.link" alt="Link" class="icon-img-small" />
              <a :href="data.referralLink" target="_blank"
                >Bagikan link ini dan dapatkan reward class gratis!</a
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Module & Skills Section -->
      <div class="two-columns">
        <div class="white-box">
          <div class="white-header-centered">
            <img :src="images.aboutModule" alt="Module" class="icon-img" />
            <h3>Tentang Modul Ini</h3>
          </div>
          <div class="content-box">
            <div class="module-row">
              <div class="module-label">Topik Modul</div>
              <div class="module-value">{{ data.topicModule }}</div>
            </div>
            <div class="field-border"></div>

            <div class="module-row">
              <div class="module-label">Hasil:</div>
              <div class="module-value">{{ data.result }}</div>
            </div>

            <div class="top-border"></div>
            <div class="completion-text">
              Menyelesaikan {{ data.month }} dari 9 bulan pembelajaran di level
              {{ data.level }} /9
            </div>
          </div>
        </div>

        <div class="white-box">
          <div class="white-header-centered">
            <img :src="images.skills" alt="Skills" class="icon-img" />
            <h3>Keahlian yang Didapatkan</h3>
          </div>
          <div class="content-box">
            <p class="content-text">{{ data.skillsAcquired }}</p>
          </div>
        </div>
      </div>

      <!-- Jalur Pendidikan & Tutor Feedback (Side by Side - Full Height) -->
      <div class="two-columns bottom-section-full">
        <!-- Jalur Pendidikan (No Title, No Separator) -->
        <div class="jalur-box">
          <img :src="images.jalurPendidikan" alt="Jalur Pendidikan" class="jalur-img" />
          <div class="jalur-footer">
            <p class="footer-label">
              Informasi lebih lanjut dapat diakses melalui link berikut :
            </p>
            <div class="link-row">
              <img :src="images.link" alt="Link" class="icon-img-2" />
              <a
                href="https://drive.google.com/drive/u/0/folders/1lErW_RKjHOkAgqCr9yymELg3yUZzvBEb"
                target="_blank"
                >Lihat Modul Lengkap</a
              >
            </div>
          </div>
        </div>

        <!-- Tutor Feedback -->
        <div class="white-box">
          <div class="white-header-centered">
            <img :src="images.feedback" alt="Feedback" class="icon-img" />
            <h3>Tutor's Feedback</h3>
          </div>
          <div class="content-box">
            <p class="feedback-text">{{ data.selectedComments || data.tutorComment }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="report-footer">
        <p>Laporan dibuat oleh: {{ data.reportBy || "Tutor" }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import images from "../utils/images.js";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const renderStars = (rating) => {
  const fullStars = "★".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);
  return fullStars + emptyStars;
};
</script>

<style scoped>
.pdf-template {
  width: 210mm;
  min-height: auto;
  height: auto;
  background: white;
  padding: 0;
  font-family: "Arial", "Helvetica", sans-serif;
  color: #000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Header - With Margin (Not Full Width) */
.header-banner {
  width: calc(100% - 20mm);
  margin: 5px auto 8px auto;
  border-radius: 0;
  overflow: hidden;
}

.header-banner img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

/* Content Container - Narrower than header */
.content-container {
  width: calc(100% - 40mm);
  margin: 0 auto;
  padding: 0 0 8mm 0;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Info & Score Section */
.info-score-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 6px;
}

.info-box,
.score-box {
  background: #d9d0e8;
  border: none;
  border-radius: 0;
  padding: 8px;
}

.box-title {
  text-align: center;
  font-size: 10pt;
  font-weight: 700;
  color: #352079;
  margin: 0 0 6px 0;
  padding: 0;
}

.box-title.center {
  text-align: center;
}

.info-table {
  width: 100%;
  padding-left: 20px;
}

.info-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
  border-bottom: 2px solid #5b88ef;
  padding-bottom: 3px;
  justify-content: center;
}

.info-row.last {
  border-bottom: none;
}

.info-row .label {
  font-weight: 700;
  font-size: 8.5pt;
  color: #352079;
  min-width: fit-content;
  padding-right: 10px;
  flex-shrink: 0;
}

.info-row .value-wrapper {
  flex: 1;
  display: flex;
}

.info-row .value {
  font-size: 8.5pt;
  color: #4e3583;
  font-weight: 400;
  flex: 1;
}

.score-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.level-text {
  font-size: 13pt;
  font-weight: 700;
  color: #352079;
  margin: 6px 0;
}

.stars {
  font-size: 22pt;
  color: #4e3583;
  letter-spacing: 0px;
  line-height: 1;
}

/* Yellow Box Container (Proyek & Free Lesson side by side) */
.yellow-box-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 6px;
}

.yellow-box-half {
  background: white;
  border: 2px solid #7c3aed;
  border-radius: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.yellow-box-half.white-bg {
  background: white;
}

.yellow-content-wrapper {
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 0;
  margin-top: auto;
}

/* Centered Headers for Yellow & White Boxes */
.yellow-header-centered,
.white-header-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 0;
  padding: 10px 8px 10px 8px;
}

.yellow-header-centered h3,
.white-header-centered h3 {
  font-size: 9.5pt;
  font-weight: 700;
  color: #000;
  margin: 0;
  text-align: center;
}

/* Field Border (for Topik Modul) */
.field-border {
  width: 100%;
  height: 2px;
  background: #5b88ef;
  margin: 4px 0;
}

/* Top Border (above completion text) */
.top-border {
  width: 100%;
  height: 1.5px;
  background: #5b88ef;
  margin: 6px 0 4px 0;
}

.icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
  background: transparent !important;
}

.icon-img-small {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
  background: transparent !important;
}
.icon-img-2 {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
  background: transparent !important;
}

.icon-img-inline {
  width: 14px;
  height: 14px;
  object-fit: contain;
  margin-right: 0;
  background: transparent !important;
  flex-shrink: 0;
  display: inline-block;
}

.yellow-text {
  text-align: center;
  font-size: 8pt;
  font-weight: 600;
  color: #000;
  margin: 3px 0;
  line-height: 1.3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.yellow-text span {
  display: inline;
}

.link-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  text-align: center;
  justify-content: center;
  width: 100%;
}

.link-row img {
  flex-shrink: 0;
}

.link-row a {
  color: #1e40af;
  text-decoration: underline;
  font-weight: 600;
  font-size: 7.5pt;
  word-break: break-word;
  line-height: 1.3;
  display: inline;
}

/* Two Columns */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 6px;
}

.two-columns.bottom-section-full {
  margin-bottom: 6px;
  flex: 1;
  display: grid;
  align-items: stretch;
}

/* White Boxes */
.white-box {
  background: white;
  border: 2px solid #7c3aed;
  border-radius: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.content-box {
  padding: 3px;
  background: #ffffff;
  flex: 1;
}

.label-text {
  font-size: 8pt;
  font-weight: 700;
  color: #000;
  margin: 3px 0 1px 0;
}

.content-text {
  font-size: 7.5pt;
  color: #000;
  line-height: 1.3;
  margin: 0 0 4px 0;
  white-space: pre-wrap;
  font-weight: 400;
}

.completion-text {
  background: transparent;
  border: none;
  padding: 4px 0;
  text-align: center;
  font-size: 7.5pt;
  font-weight: 600;
  color: #000;
  margin-top: 0;
}

/* Module Row Layout */
.module-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.module-label {
  font-size: 8pt;
  font-weight: 700;
  color: #000;
  min-width: 80px;
  flex-shrink: 0;
}

.module-value {
  font-size: 7.5pt;
  color: #000;
  line-height: 1.3;
  flex: 1;
  font-weight: 400;
}

.module-content-block {
  margin-top: 4px;
}

.module-content-block .label-text {
  margin-bottom: 2px;
}

.module-content-block .content-text {
  margin-top: 2px;
}

/* Jalur Pendidikan */
.jalur-box {
  background: #F8F8EB;
  border: 2px solid #7c3aed;
  border-radius: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.jalur-img {
  width: 100%;
  height: auto;
  max-height: 220px;
  display: block;
  border-radius: 0;
  object-fit: contain;
  object-position: center top;
  margin-bottom: 6px;
}

.jalur-footer {
  margin-top: auto;
}

.footer-label {
  font-size: 7.5pt;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.yellow-footer-wrapper {
  background: #fef3c7;
  padding: 6px 8px;
  border-radius: 4px;
}

.yellow-footer-wrapper .footer-label {
  font-size: 7.5pt;
  font-weight: 600;
  color: #000;
  margin-bottom: 3px;
}

.yellow-footer-wrapper .link-row {
  margin-top: 3px;
}

/* Feedback */
.feedback-text {
  font-size: 7.5pt;
  color: #000;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  font-weight: 400;
}

/* Report Footer */
.report-footer {
  margin-top: 6px;
  padding-top: 4px;
  border-top: 1.5px solid #e0e0e0;
}

.report-footer p {
  font-size: 7.5pt;
  font-style: italic;
  color: #000;
  margin: 0;
  text-align: left;
  font-weight: 400;
}

/* Print Styles */
@media print {
  .pdf-template {
    width: 210mm;
    min-height: auto;
    height: auto;
    padding: 0;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }
}
</style>
