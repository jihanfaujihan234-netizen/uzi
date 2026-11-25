export const profile = {
  name: 'Jihan Fauzi',
  firstName: 'Jihan',
  lastName: 'Fauzi',
  cvUrl: '/media/CV_Jihan_Fauzi.pdf',
  email: 'ipunkchester2@gmail.com',
  bio: 'Saya seorang junior developer yang bangun antarmuka interaktif dengan React, animasi halus, dan dunia 3D di browser.\n\nBelajar cepat, rapi dalam detail, dan selalu penasaran — kini menempuh pendidikan di SMK AL-HADIID 1 CILEUNGSI.',
}

export const projects = []

export const certificates = [
  {
    id: 'certificate-gemini',
    image: '/media/certs/gemini-certified-student.png',
    alt: 'Sertifikat Gemini Certified Student K12 - Jihan Fauzi',
  },
  {
    id: 'certificate-2',
    image: '/media/certs/cert-2.jpeg',
    alt: 'Sertifikat',
  },
]

export const awards = []

export const galleryPhotos = [
  {
    id: 'gallery-1',
    image: '/media/gallery/gallery-1.jpeg',
    alt: 'Foto bersama teman SMK membawa bendera',
  },
  {
    id: 'gallery-2',
    image: '/media/gallery/gallery-2.jpeg',
    alt: 'Foto kelas X TKJ 1',
  },
  {
    id: 'gallery-3',
    image: '/media/gallery/gallery-3.jpeg',
    alt: 'Kebersamaan di dalam kelas',
  },
  {
    id: 'gallery-4',
    image: '/media/gallery/gallery-4.jpeg',
    alt: 'Futsal bersama teman',
  },
  {
    id: 'gallery-5',
    image: '/media/gallery/gallery-5.jpeg',
    alt: 'Foto bersama di kelas',
  },
  {
    id: 'gallery-6',
    image: '/media/gallery/gallery-6.jpeg',
    alt: 'Foto malam bersama teman',
  },
  {
    id: 'gallery-7',
    image: '/media/gallery/gallery-7.jpeg',
    alt: 'Kemah bersama teman',
  },
  {
    id: 'gallery-8',
    image: '/media/gallery/gallery-8.jpeg',
    alt: 'Belajar kelompok di kelas',
  },
]

const myGalleryImages = import.meta.glob(
  '../assets/my-gallery/*/*.{jpeg,jpg,png,webp,avif,gif}',
  { eager: true, query: '?url', import: 'default' },
)

const myGalleryImageList = Object.entries(myGalleryImages)
  .map(([filePath, src]) => {
    const segments = filePath.split('/')
    const folder = segments[segments.length - 2]
    const fileName = segments[segments.length - 1]
    const alt = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim()

    return { id: filePath, folder, src, alt }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

export const myGalleryFolders = [
  { id: 'waktu-kecil-besar', label: 'Waktu Kecil-Besar' },
  { id: 'kenangan-smp', label: 'Kenangan SMP' },
  { id: 'kenangan-smk', label: 'Kenangan SMK' },
].map(folder => ({
  ...folder,
  images: myGalleryImageList.filter(image => image.folder === folder.id),
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
    map: {
      embed:
        'https://maps.google.com/maps?q=-6.408156,106.963831&hl=id&z=16&output=embed',
      link: 'https://www.google.com/maps/search/?api=1&query=SMK%20Alhadiid%201%20Cileungsi%2C%20Jl.%20Melati%20I%2C%20Perum%20Cileungsi%20Indah%2C%20Cileungsi%2C%20Bogor%2C%20Jawa%20Barat',
    },
  },
  {
    id: 'smp',
    org: 'SMP Almanar MBS',
    years: '2018 – 2021',
    role: 'Sekolah Menengah Pertama',
    place: 'Junior High School',
    tag: 'SMP',
    logo: '/media/smp.png',
    map: {
      embed:
        'https://maps.google.com/maps?q=-3.843618,104.934238&hl=id&z=16&output=embed',
      link: 'https://www.google.com/maps/search/?api=1&query=SMP%20Islam%20Al-Manar%2C%20Jl.%20Raya%20Kepayang%2C%20Lempuing%2C%20Ogan%20Komering%20Ilir%2C%20Sumatera%20Selatan',
    },
  },
  {
    id: 'sd',
    org: 'SDN 1 Burnai Mulya',
    years: '2012 – 2018',
    role: 'Sekolah Dasar',
    place: 'Elementary School',
    tag: 'SD',
    logo: '/media/sd.png',
    map: {
      embed:
        'https://maps.google.com/maps?q=-3.895521,104.818315&hl=id&z=16&output=embed',
      link: 'https://www.google.com/maps/search/?api=1&query=SDN%201%20Burnai%20Mulya%2C%20Burnai%20Mulya%2C%20Semendawai%20Timur%2C%20Ogan%20Komering%20Ulu%20Timur%2C%20Sumatera%20Selatan',
    },
  },
]

export const experience = [
  {
    id: 'mflash-jatibening',
    org: 'Mflash Jatibening',
    years: '2025 – 8 Januari 2026',
    role: 'Sales Admin (PKL)',
    place: 'Jatibening',
    tag: 'PKL',
    logoText: 'MF',
    points: [
      'Mengelola data penjualan dan administrasi toko.',
      'Membantu pencatatan transaksi serta pelayanan pelanggan.',
    ],
  },
  {
    id: 'mflash-cilangkap',
    org: 'Mflash Cilangkap',
    years: '16 Hari',
    role: 'Sales Admin (PKL)',
    place: 'Cilangkap',
    tag: 'PKL',
    logoText: 'MF',
    points: ['Membantu administrasi, penjualan, dan operasional toko.'],
  },
  {
    id: 'madinah-supervisor',
    org: 'PT Madinah Solusi Teknologi',
    years: '2026',
    role: 'Supervisor',
    tag: 'Supervisor',
    logoText: 'MT',
    points: [
      'Mengkoordinasikan tim dan mengatur jadwal kerja.',
      'Bertanggung jawab atas pencapaian target toko.',
    ],
  },
  {
    id: 'madinah-sales-retail',
    org: 'PT Madinah Solusi Teknologi',
    years: '2024–2025',
    role: 'Sales Retail',
    tag: 'Retail',
    logoText: 'MT',
    points: [
      'Melayani pelanggan dan melakukan penjualan produk.',
      'Memberikan informasi serta membantu kebutuhan pelanggan.',
    ],
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
