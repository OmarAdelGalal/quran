
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
    arabicName: "محمد صديق المنشاوي",
    image: "https://www.assabile.com/media/person/200x256/mohamed-seddik-el-menchaoui.png",
    audioBaseUrl: "https://server10.mp3quran.net/minsh",
    description: "من أعظم قراء القرآن الكريم",
  },
];
