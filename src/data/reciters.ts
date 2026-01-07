
export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  image: string;
  audioBaseUrl: string;
  description: string;
}

export const reciters: Reciter[] = [
  {
    id: "yasser-dosari",
    name: "Yasser Al-Dosari",
    arabicName: "ياسر الدوسري",
    image: "https://www.assabile.com/media/photo/full_size/yasser-al-dossari-1093.jpg",
    audioBaseUrl: "https://server11.mp3quran.net/yasser",
    description: "إمام الحرم المكي الشريف",
  },
  {
    id: "maher-muaiqly",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    image: "https://www.assabile.com/media/photo/full_size/maher-al-mueaqly-120.jpg",
    audioBaseUrl: "https://server12.mp3quran.net/maher",
    description: "إمام المسجد الحرام",
  },
  {
    id: "minshawi",
    name: "Al-Minshawi",
    arabicName:  "محمد صديق المنشاوي",
    image: "https://www.assabile.com/media/person/200x256/mohamed-seddik-el-menchaoui.png",
    audioBaseUrl: "https://server10.mp3quran.net/minsh",
    description: "من أعظم قراء القرآن الكريم (رحمه الله)",
  },
  {
    id: "ahmed-kaseb",
    name: "Ahmed Al-Kaseb",
    arabicName: "أحمد الكاسب",
    description: "تلاوة هادئة تأخذك لعالم آخر",
    image: "https://imgs.search.brave.com/qR2YBdd3NDId0feESbx5g-MW7f2x0o4FWbJIz5Gp4qw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pMS5z/bmRjZG4uY29tL2Fy/dHdvcmtzLXoyVld5/ZkVRcUswbjFLb1ot/aVVuY253LXQxMDgw/eDEwODAuanBn", // تأكد من وضع الصورة في هذا المسار
    audioBaseUrl: "/audio/ahmed-kaseb", 
  },
  {
    id: "abdullah-kamel",
    name: "Abdullah Kamel",
    arabicName: "عبد الله كامل",
    description: "صوت شجي يلامس القلب (رحمه الله)",
    image: "https://tvquran.com/uploads/authors/images/%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D9%83%D8%A7%D9%85%D9%84.jpg",
    // Note: archive.org filenames include a trailing dash before the extension (e.g. `001-.mp3`).
    // The player now tries both `NNN.mp3` and `NNN-.mp3` and uses the first that responds.
    // ✅ رابط مباشر من الأرشيف: الملفات مسماة مثل 001-.mp3 لذا المشغل يجرب NNN.mp3 و NNN-.mp3
    audioBaseUrl: "https://archive.org/download/3abdalla.Kamel.uP.bY.ReDa.MoHamMeD",
  },
];
