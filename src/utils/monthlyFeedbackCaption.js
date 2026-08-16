export const buildMonthlyFeedbackCaption = ({ studentName, reportBy } = {}) => {
  const name = String(studentName || '').trim() || 'Siswa';
  const tutor = String(reportBy || '').trim() || 'Tutor';

  return `Halo, Ayah/Bunda dari ${name}! 👋

Saya ${tutor}, tutor ${name} di Sekolah Pemrograman Internasional Algorithmics.

Saya ingin berbagi kabar tentang perkembangan ${name} selama satu bulan terakhir. Kami telah menilai kemajuan ${name} berdasarkan keterampilan yang dipelajari di kelas, serta upaya yang telah ditunjukkan dalam menyelesaikan berbagai tugas. 😊 Hasil lengkapnya bisa Anda lihat pada lampiran yang sudah kami sediakan 📄.

Penilaian ini meliputi bintang dan poin yang diperoleh ${name} atas kinerja dalam berbagai keterampilan utama yang diajarkan di kelas. Bintang tersebut merefleksikan seberapa baik ${name} menguasai materi dan menerapkan keterampilannya, baik dalam tugas rumah maupun tugas kelas. Poin tambahan juga diberikan sebagai penghargaan atas kerja keras dan ketekunan yang ditunjukkan oleh ${name}.

Jika ada hal yang ingin ditanyakan mengenai hasil ini atau tentang perkembangan ${name}, saya siap membantu menjelaskan lebih lanjut. Terima kasih atas dukungan Anda dalam proses belajar ${name}, dan mari kita terus bekerja sama untuk mencapai hasil yang lebih baik ke depannya! 💜`;
};
