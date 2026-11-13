export const profile = {
  name: 'Jihan Fauzi',
  firstName: 'Jihan',
  lastName: 'Fauzi',
  cvUrl:
    'https://drive.google.com/file/d/1_Isso2Qk9xqHtEG5ac5uCiDjaOsk49Yl/view?usp=drive_link',
  email: 'ipunkchester2@gmail.com',
  bio: 'Sebagai mahasiswa Fakultas Ilmu Komputer Universitas Brawijaya, Aku berfokus pada pengembangan teknologi yang tidak hanya fungsional, tetapi juga menghadirkan pengalaman digital yang menarik dan berdampak.',
}

export const projects = []

export const certificates = [
  {
    id: 'certificate-2',
    image: '/media/certs/cert-2.jpeg',
    alt: 'Sertifikat',
  },
]

export const awards = []

export const galleryPhotos = Array.from({ length: 9 }, (_, i) => ({
  id: `gallery-${i + 1}`,
  image: `/media/gallery/gallery-${i + 1}.jpeg`,
  alt: `Galeri kegiatan ${i + 1}`,
}))

export const education = [
  {
    id: 'smk',
    org: 'SMK Alhadiid 1 Cileungsi',
    years: '2021 – 2024',
    role: 'Teknik Komputer dan Jaringan (TKJ)',
    place: 'Vocational High School',
    tag: 'TKJ',
    logo: '/media/smk-alhadiid.png',
  },
  {
    id: 'smp',
    org: 'SMP Almanar MBS',
    years: '2018 – 2021',
    role: 'Sekolah Menengah Pertama',
    place: 'Junior High School',
    tag: 'SMP',
    logo: '/media/smp.png',
  },
  {
    id: 'sd',
    org: 'SDN 1 Burnai Mulya',
    years: '2012 – 2018',
    role: 'Sekolah Dasar',
    place: 'Elementary School',
    tag: 'SD',
    logo: '/media/sd.png',
  },
]

export const experience = [
  {
    id: 'google',
    org: 'Google Indonesia',
    years: '2026',
    role: 'Google Student Ambassador',
    place: 'Universitas Brawijaya',
    tag: 'Ambassador',
    logo: '/media/experience/google.jpg',
  },
  {
    id: 'gdg',
    org: 'Google Developer Groups (GDGs) on Campus Brawijaya University',
    years: '2025-2026',
    role: 'Member',
    place: 'Universitas Brawijaya',
    tag: 'Community',
    logo: '/media/experience/gdg.png',
  },
  {
    id: 'hology',
    org: 'Hology 9.0',
    years: '2026',
    role: 'Staff Technology | UI/UX Designer',
    place: 'FILKOM UB',
    tag: 'Committee',
    logo: '/media/experience/hology.png',
  },
  {
    id: 'filkom',
    org: 'Faculty of Computer Science (FILKOM) UB',
    years: '2026',
    role: 'Teaching Assistant : Basic Programming of Java',
    place: 'FILKOM UB',
    tag: 'Academic',
    logo: '/media/experience/filkom.jpg',
  },
  {
    id: 'dsi',
    org: 'SINAU BARENG DSI',
    years: '2026',
    role: 'Pemateri Pemrograman Dasar Java',
    place: 'FILKOM UB',
    tag: 'Speaker',
    logo: '/media/experience/dsi.jpg',
  },
  {
    id: 'raion',
    org: 'Raion Internship',
    years: '2026',
    role: 'UI/UX Designer',
    place: 'Malang',
    tag: 'Internship',
    logo: '/media/experience/raion.png',
  },
  {
    id: 'cubiespot',
    org: 'PT Cubiespot Pilar Data Nusantara',
    years: '2023',
    role: 'Network Management',
    place: 'Pasuruan',
    tag: 'Internship',
    logo: '/media/experience/cubiespot.png',
  },
]

export const socials = [
  {
    id: 'linkedin',
    label: "Let's Connect",
    handle: '@Mamang Jiung',
    href: 'https://www.linkedin.com/in/mamang-jiung-2914b8331',
    icon: '/media/linkedin.webp',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@mamang__31',
    href: 'https://www.instagram.com/mamang__31/',
    icon: '/media/instagram.webp',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@jihanfaujihan234-netizen',
    href: 'https://github.com/jihanfaujihan234-netizen',
    icon: '/media/github.png',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@mangggmang',
    href: 'https://www.tiktok.com/@mangggmang',
    icon: '/media/tiktok.svg',
  },
]

export const seedComments = []

export const folders = [
  {
    id: 'projects',
    label: 'Projects',
    count: projects.length,
    images: projects.slice(0, 3).map(project => project.image),
  },
  {
    id: 'certificates',
    label: 'Certificates',
    count: certificates.length,
    images: certificates.slice(0, 3).map(cert => cert.image),
  },
  {
    id: 'awards',
    label: 'Awards',
    count: awards.length,
    images: awards.slice(0, 3).map(award => award.image),
  },
]
