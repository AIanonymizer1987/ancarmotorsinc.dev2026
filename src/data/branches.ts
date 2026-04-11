export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  mapEmbedUrl: string;
}

export const branches: Branch[] = [
  {
    id: 1,
    name: 'Main Location',
    city: 'Quezon City',
    address: 'Ground Floor, Azure Business Center, 1197-A Epifanio de los Santos Ave, 1105 Metro Manila',
    phone: '0969 488 7777',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl : 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d3859.9753729908025!2d121.01558447487041!3d14.657339075685474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3397b6ee2f6581e9%3A0x3425b59a3e17bae3!2sGround%20Floor%2C%20Ancar%20Motors%2C%20Inc.%2C%20Azure%20Business%20Center%2C%201197-A%20Epifanio%20de%20los%20Santos%20Ave%2C%20Quezon%20City%2C%201105%20Metro%20Manila!3m2!1d14.6573028!2d121.0181599!5e0!3m2!1sen!2sph!4v1724289921514!5m2!1sen!2sph'
  },
  {
    id: 2,
    name: 'Tullahan Branch',
    city: 'Quezon City',
    address: '14 Tullahan Rd, Caloocan, 1402 Metro Manila',
    phone: '0955 652 6927',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d3859.525365272581!2d121.0050154748708!3d14.68285637505793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3397b6b6f5164da1%3A0x205780cf56317568!2sAncar%20Motors%2C%2014%20Tullahan%20Rd%2C%20Caloocan%2C%201402%20Metro%20Manila!3m2!1d14.6828512!2d121.0075904!5e0!3m2!1sen!2sph!4v1724291972884!5m2!1sen!2sph'
  },
  {
    id: 3,
    name: 'Calasiao Branch',
    city: 'Pangasinan',
    address: '29C2+MQF, Judge Jose de Venecia Ave, Calasiao, Pangasinan',
    phone: '075 517 3922',
    hours: '8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d3834.87333593996!2d120.35186698404334!3d16.020107859332303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x339142b64a510e21%3A0x89e2837b1d71397b!2sAncar%20Motors%2C%20Judge%20Jose%20de%20Venecia%20Avenue%2C%20Calasiao%2C%20Pangasinan!3m2!1d16.0214632!2d120.3520291!5e0!3m2!1sen!2sph!4v1724292075208!5m2!1sen!2sph'
  },
  {
    id: 4,
    name: 'Isabela Branch',
    city: 'Santiago',
    address: '1, City of Santiago, Isabela',
    phone: '091 756 16362',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61145.710497552536!2d121.54199633042646!3d16.69654303798469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x33900719f42dbd09%3A0x6d1c232b32366fce!2sAncar%20Motors%20Inc%2C%201%2C%20Santiago%2C%20Isabela!3m2!1d16.6965137!2d121.5832015!5e0!3m2!1sen!2sph!4v1724292145586!5m2!1sen!2sph'
  },
  {
    id: 5,
    name: 'Pangasinan Branch',
    city: 'Urdaneta',
    address: 'McArthur Hi-way, Nancayasan, Urdaneta, Philippines, 2428',
    phone: '099 859 59182',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61377.685933139895!2d120.53436082687351!3d15.955872811117676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x33913efd0d7e3c67%3A0x83be0ec76cf2c0f9!2sANCAR%20MOTORS%2C%20Urdaneta%2C%20Pangasinan!3m2!1d15.9557942!2d120.5755607!5e0!3m2!1sen!2sph!4v1724292306301!5m2!1sen!2sph'
  },
  {
    id: 6,
    name: 'Tarlac Branch',
    city: 'Tarlac City',
    address: 'Tarlac City, Tarlac',
    phone: '097 723 00485',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61528.875853547186!2d120.5585881245785!3d15.454564925017106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3396c7fd210dd675%3A0xd662586099fe9e5b!2sAncar%20Motors%20Tarlac%2C%20Tarlac%20City%2C%20Tarlac!3m2!1d15.454486!2d120.59978799999999!5e0!3m2!1sen!2sph!4v1724292403930!5m2!1sen!2sph'
  },
  {
    id: 7,
      name: 'Benguet Branch',
      city: 'La Trinidad',
    address: 'FH7R+MPW KD27 Upper Cruz, La Trinidad, Benguet',
    phone: '(074) 422 7170',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239.1389433227529!2d120.59174681436384!3d16.464237499283136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3391a30057b3f331%3A0xb92f8f95a43768c8!2sAncar%20Motors%20Inc.%20LTB%20Branch%20(Ground%20Floor)!5e0!3m2!1sen!2sph!4v1775919156115!5m2!1sen!2sph'
  },
  {
    id: 8,
    name: 'La Union Branch',
    city: 'Bacnotan',
    address: 'Bacnotan, La Union',
    phone: '096 948 87777',
    hours: 'Mon-Sat: 8:30 AM–5:30 PM, Sun: Closed',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61144.047054218674!2d120.29837303045205!3d16.701738834626568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x33918d11799211bb%3A0x89c45fe3c0295712!2sAncar%20Motors%20Inc.%2C%20Bacnotan%2C%20La%20Union!3m2!1d16.7016706!2d120.3395395!5e0!3m2!1sen!2sph!4v1724292811531!5m2!1sen!2sph'
  }
];
