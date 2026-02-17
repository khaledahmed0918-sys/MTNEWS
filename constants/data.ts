import { Thread, ImageData, LinkData, CreditPerson, MapObjectItem, MapObjectGroup, VoteCharacter } from '../types';

export const defaultStreamersList = [
    "https://kick.com/2mzx", "https://kick.com/twlf", "https://kick.com/i3mmar", "https://kick.com/almullaa8", 
    "https://kick.com/RealWeEp", "https://kick.com/i_dom", "https://kick.com/haibtking", "https://kick.com/otnxx", 
    "https://kick.com/ysad", "https://kick.com/xtroet", "https://kick.com/iica", "https://kick.com/azeez", 
    "https://kick.com/nkstr", "https://kick.com/saad", "https://kick.com/mahasnco", "https://kick.com/ckiv", 
    "https://kick.com/abuswe7l", "https://kick.com/okhaledx", "https://kick.com/majah92", "https://kick.com/i3sw", 
    "https://kick.com/brof2", "https://kick.com/abokyan", "https://kick.com/rpwy", "https://kick.com/7omah", 
    "https://kick.com/fahad", "https://kick.com/virus", "https://kick.com/mo7agame", "https://kick.com/itsog", 
    "https://kick.com/sxb", "https://kick.com/xeid", "https://kick.com/alneratzory", "https://kick.com/azzz", 
    "https://kick.com/1mlr", "https://kick.com/00_2", "https://kick.com/cREAD", "https://kick.com/YSMO", 
    "https://kick.com/xMussad", "https://kick.com/hnodyy", "https://kick.com/OSAMAH", "https://kick.com/1SBS", 
    "https://kick.com/iABS", "https://kick.com/JASER", "https://kick.com/L1ith", "https://kick.com/frl", 
    "https://kick.com/mody", "https://kick.com/jntel", "https://kick.com/molo101", "https://kick.com/rchx", 
    "https://kick.com/DRAXR", "https://kick.com/iiklaus", "https://kick.com/c2mmm", "https://kick.com/lirx", 
    "https://kick.com/alfhdyQ8", "https://kick.com/s6mito", "https://kick.com/ghed", "https://kick.com/rareFAISAL", 
    "https://kick.com/1Rwi", "https://kick.com/IBrahem", "https://kick.com/JustCARRY", "https://kick.com/DrFx", 
    "https://kick.com/mjod1", "https://kick.com/imeshari4", "https://kick.com/mjrm", "https://kick.com/xlxwi", 
    "https://kick.com/eqgle", "https://kick.com/z7lion", "https://kick.com/Zeeyadx", "https://kick.com/Mesh7", 
    "https://kick.com/tmnaa", "https://kick.com/inq", "https://kick.com/brg2022", "https://kick.com/akoma1", 
    "https://kick.com/szlw", "https://kick.com/foraziz", "https://kick.com/kingsoul", "https://kick.com/klo25", 
    "https://kick.com/muvxn", "https://kick.com/IAbdullahh", "https://kick.com/1saq", "https://kick.com/Carizmaa", 
    "https://kick.com/im911", "https://kick.com/fawaz", "https://kick.com/stafks", "https://kick.com/oflag", 
    "https://kick.com/welly_20", "https://kick.com/ab2dy", "https://kick.com/Vilon", "https://kick.com/basamlv", 
    "https://kick.com/iabo3abd", "https://kick.com/d7mx", "https://kick.com/sult", "https://kick.com/1zaro", 
    "https://kick.com/vSaleh", "https://kick.com/dark12", "https://kick.com/yMT3B", "https://kick.com/ABOMISHAL", 
    "https://kick.com/FFIGHTER", "https://kick.com/drakOola", "https://kick.com/bigboss", "https://kick.com/2abo3abd"
];

export const mapObjectsData: MapObjectItem[] = [
  {
    id: 'snr',
    name: 'Snr Bunz',
    icon: 'https://i.postimg.cc/k5YQLw5Y/burger.png',
    locations: [
      { x: 3445, y: 2165 },
    ]
  },
  {
    id: 'police',
    name: 'Police Stations',
    icon: 'https://i.postimg.cc/50HBJvHP/police-badge.png', 
    locations: [
      { x: 4960, y: 5110 },
      { x: 4050, y: 2020 },
    ]
  },
  {
    id: 'hospital',
    name: 'Hospitals',
    icon: 'https://i.postimg.cc/mDcY4Mcn/medicine.png',
    locations: [
      { x: 3550, y: 2260 },
      { x: 4400, y: 4430 },
    ]
  },
  {
    id: 'rehab',
    name: 'Reahb Center',
    icon: 'https://i.postimg.cc/wvtXzJyH/mental-health.png',
    locations: [
      { x: 2730, y: 3225 },
    ]
  },
  {
    id: 'cia',
    name: 'CIA Central',
    icon: 'https://i.postimg.cc/vHZFbZ8T/00WZrbng.png',
    locations: [
      { x: 3840, y: 2176 },
    ]
  },
    {
    id: 'media',
    name: 'Media Central',
    icon: 'https://i.postimg.cc/W3DGVrFs/tower.png',
    locations: [
      { x: 3580, y: 2832 },
    ]
  },
  {
    id: 'court',
    name: 'Court',
    icon: 'https://i.postimg.cc/ZR98m392/finance.png',
    locations: [
      { x: 3475, y: 3435 },
    ]
  },
  {
    id: 'blaine',
    name: 'Blaine County Banks',
    icon: 'https://i.postimg.cc/5NGsdbFW/bank.png',
    locations: [
      { x: 4122, y: 4420 },
      { x: 4862, y: 5890 },
      { x: 5425, y: 2920 },
      { x: 1675, y: 3425 }
    ]
  },
  {
    id: 'maze',
    name: 'Maze Bank',
    icon: 'https://i.postimg.cc/5NGsdbFW/bank.png',
    locations: [
      { x: 2870, y:2130 }
    ]
  },
  {
    id: 'jew',
    name: 'Jewelry',
    icon: 'https://i.postimg.cc/Hky7JCZN/diamond_2.png',
    locations: [
      { x: 3255, y: 2565 },
    ]
  },
  {
    id: 'cash',
    name: 'Cash Exchange',
    icon: 'https://i.postimg.cc/CxqfZVPN/money_exchange.png',
    locations: [
      { x: 3850, y: 1780 },
      { x: 4050, y: 1420 },
    ]
  },
  {
    id: 'money',
    name: 'Money Laundering',
    icon: 'https://i.postimg.cc/YCWm4wnX/money_laundering.png',
    locations: [
      { x: 3820, y: 1620 },
    ]
  },
  {
    id: 'blacksite',
    name: 'Black Site',
    icon: 'https://i.postimg.cc/YCWm4wnZ/sign.png',
    locations: [
      { x: 2255, y: 4810 },
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics Base',
    icon: 'https://i.postimg.cc/x1zbkSx4/pallet.png',
    locations: [
      { x: 1750, y: 4910 },
    ]
  },
  {
    id: 'do1',
    name: 'DO (1)',
    icon: 'https://i.postimg.cc/6pvG7NjD/garage.png',
    locations: [
      { x: 4200, y: 3030 },
    ]
  },
  {
    id: 'do2',
    name: 'DO (2)',
    icon: 'https://i.postimg.cc/kgbtVdY3/bunker.png',
    locations: [
      { x: 5330, y: 2950 },
    ]
  },
  {
    id: 'van',
    name: 'Vandam Base',
    icon: 'https://i.postimg.cc/4x9hKT2T/hacker.png',
    locations: [
      { x: 3435, y: 1705 },
    ]
  },
  {
    id: 'culti',
    name: 'Cultivation Place',
    icon: 'https://i.postimg.cc/ZqzvpD2X/gardening.png',
    locations: [
      { x: 5115, y: 5940 }
    ]
  },
  {
    id: 'harvest',
    name: 'Harvest Place',
    icon: 'https://i.postimg.cc/MGJfVrgM/vegetables.png',
    locations: [
      { x: 4935, y: 5705 }
    ]
  },
  {
    id: 'tow',
    name: 'Tow Job',
    icon: 'https://i.postimg.cc/Xv6BdDtF/tow_truck.png',
    locations: [
      { x: 4150, y: 2720 },
    ]
  },
  {
    id: 'taxi',
    name: 'Taxi Job',
    icon: 'https://i.postimg.cc/RFM3bJM2/taxi_stop.png',
    locations: [
      { x: 4345, y: 2565 },
    ]
  },
  {
    id: 'cleaning',
    name: 'Cleaning Job',
    icon: 'https://i.postimg.cc/hjSJ3QSH/truck.png',
    locations: [
      { x: 3520, y: 1655 },
    ]
  },
  {
    id: 'oil',
    name: 'Oil Job',
    icon: 'https://i.postimg.cc/qvmpLwJB/oil-barrel.png',
    locations: [
      { x: 3055, y: 1335 },
    ]
  },
  {
    id: 'ikea',
    name: 'IKEA',
    icon: 'https://i.postimg.cc/Jn1ydHrC/carts.png',
    locations: [
      { x: 5500, y: 4830 },
    ]
  },
  {
    id: 'impound',
    name: 'Impound',
    icon: 'https://i.postimg.cc/SsyXtYSx/apartments.png',
    locations: [
      { x: 4450, y: 4430 },
      { x: 3940, y: 2450 }
    ]
  },
  {
    id: 'weapons',
    name: 'CHAI Store (Weapons)',
    icon: 'https://i.postimg.cc/gJYwBLzp/weapon.png',
    locations: [
      { x: 3770, y: 1935 },
    ]
  },
  {
    id: 'repair',
    name: 'Cars Workbench',
    icon: 'https://i.postimg.cc/262qpjyf/car_service.png',
    locations: [
      { x: 3540, y: 2570 },
    ]
  },
  {
    id: 'shows',
    name: 'Car Shows',
    icon: 'https://i.postimg.cc/cHsK5txd/showroom.png',
    locations: [
      { x: 3310, y: 2475 },
      { x: 3750, y: 1565 },
    ]
  },
  {
    id: 'digital',
    name: 'Digital Store',
    icon: 'https://i.postimg.cc/tT210RJV/gadgets.png',
    locations: [
      { x: 3435, y: 2850 },
    ]
  },
];

export const mapObjectGroupsData: MapObjectGroup[] = [
  {
    id: 'politics',
    name: 'Politic Cetners',
    icon: '',
    objectIds: ['police', 'rehab', 'hospital', 'cia', 'media', 'snr', 'court']
  },
  {
    id: 'roberies',
    name: 'Roberies',
    icon: '',
    objectIds: ['blaine', 'maze', 'jew', 'cash', 'money']
  },
  {
    id: 'bases',
    name: 'Bases',
    icon: '',
    objectIds: ['blacksite', 'logistics', 'do1', 'do2', 'van']
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: '',
    objectIds: ['culti', 'harvest', 'tow', 'taxi', 'cleaning', 'oil']
  },
  {
    id: 'services',
    name: 'Services',
    icon: '',
    objectIds: ['ikea', 'impound', 'weapons', 'repair', 'shows', 'digital']
  },
];


export const imagesData: ImageData[] = [
  { id: 'img-1', url: 'https://i.postimg.cc/KYVDZtRY/IMG-3577.jpg', tags: ['Special'] },
  { id: 'img-2', url: 'https://i.postimg.cc/DzDP218n/IMG-4257.jpg', tags: ['Special'] },
  { id: 'img-3', url: 'https://i.postimg.cc/B6KcttK1/IMG-4259.jpg', tags: ['Special'] },
  { id: 'img-4', url: 'https://i.postimg.cc/wBPQ6D7X/IMG-4263.jpg', tags: ['Special'] },
  { id: 'img-5', url: 'https://i.postimg.cc/ZqgxT6Ch/IMG-4265.jpg', tags: ['Special'] },
  { id: 'img-6', url: 'https://i.postimg.cc/LX1Bhh1L/IMG-7616.jpg', tags: ['Special'] },
  { id: 'img-7', url: 'https://i.postimg.cc/XvXgSs7j/IMG-7639.jpg', tags: ['Special'] },
  { id: 'img-8', url: 'https://i.postimg.cc/FzvcRpm7/IMG-4249.png', tags: ['Gangs'] },
  { id: 'img-9', url: 'https://i.postimg.cc/KzBBxwXh/IMG-4261.jpg', tags: ['Gangs'] },
  { id: 'img-10', url: 'https://i.postimg.cc/6qKR3cwd/IMG-7566.jpg', tags: ['Gangs'] },
  { id: 'img-11', url: 'https://i.postimg.cc/PJHZxyhX/IMG-7601.jpg', tags: ['Gangs'] },
  { id: 'img-12', url: 'https://i.postimg.cc/fysXLCZY/IMG-7627.jpg', tags: ['Gangs'] },
  { id: 'img-13', url: 'https://i.postimg.cc/L5SfXDRY/IMG-7642.jpg', tags: ['Gangs'] },
  { id: 'img-14', url: 'https://i.postimg.cc/j2TN5cKJ/IMG-7672.jpg', tags: ['Gangs'] },
  { id: 'img-15', url: 'https://i.postimg.cc/DZrJtGsV/brave-b0FMjmuz-A3-more-Detail-8k-7615x8192-2pass-more-Detail-enhanced.jpg', tags: ['Police'] },
  { id: 'img-16', url: 'https://i.postimg.cc/sxKB2Rwh/Gqd-Jc-c-XIAEWnb-G.png', tags: ['Police'] },
  { id: 'img-17', url: 'https://i.postimg.cc/SNT2FkXp/image-enhanced-1.png', tags: ['Police'] },
  { id: 'img-18', url: 'https://i.postimg.cc/T1TLGPq3/IMG-20240902-173118.jpg', tags: ['Police'] },
  { id: 'img-19', url: 'https://i.postimg.cc/dttkxLVm/IMG-2169.jpg', tags: ['Police'] },
  { id: 'img-20', url: 'https://i.postimg.cc/BbJLsvcD/IMG-4218.jpg', tags: ['Police'] },
  { id: 'img-21', url: 'https://i.postimg.cc/SQGYdWkZ/IMG-4258.jpg', tags: ['Police'] },
  { id: 'img-22', url: 'https://i.postimg.cc/nrnjZLYr/IMG-4260.jpg', tags: ['Police'] },
  { id: 'img-23', url: 'https://i.postimg.cc/ZKKBMC5D/IMG-4266.jpg', tags: ['Police'] },
  { id: 'img-24', url: 'https://i.postimg.cc/MT7MhBBd/IMG-4267.jpg', tags: ['Police'] },
  { id: 'img-25', url: 'https://i.postimg.cc/vTX1md39/IMG-4269.jpg', tags: ['Police'] },
  { id: 'img-26', url: 'https://i.postimg.cc/pTfhgj8R/IMG-4271.jpg', tags: ['Police'] },
  { id: 'img-27', url: 'https://i.postimg.cc/RCTJdc43/IMG-5400.jpg', tags: ['Police'] },
  { id: 'img-28', url: 'https://i.postimg.cc/LXKgCDJG/IMG-5515.jpg', tags: ['Police'] },
  { id: 'img-29', url: 'https://i.postimg.cc/Ss62w98y/IMG-5517.jpg', tags: ['Police'] },
  { id: 'img-30', url: 'https://i.postimg.cc/PJdphqzq/IMG-5526.jpg', tags: ['Police'] },
  { id: 'img-31', url: 'https://i.postimg.cc/xCvJWmHD/IMG-7125.png', tags: ['Police'] },
  { id: 'img-32', url: 'https://i.postimg.cc/j2RwKjQq/IMG-7625.jpg', tags: ['Police'] },
  { id: 'img-33', url: 'https://i.postimg.cc/WbWFLTDR/IMG-7673.jpg', tags: ['Police'] },
  { id: 'img-34', url: 'https://i.postimg.cc/BvcJ3Bhk/GS-LP-1WAAAf-Eki.png', tags: ['CIA'] },
  { id: 'img-35', url: 'https://i.postimg.cc/VNBzwW7t/image.png', tags: ['CIA'] },
  { id: 'img-36', url: 'https://i.postimg.cc/76HwZJcB/IMG-7529.jpg', tags: ['CIA'] },
  { id: 'img-37', url: 'https://i.postimg.cc/xdy9Q3sW/IMG-7559.jpg', tags: ['CIA'] },
  { id: 'img-38', url: 'https://i.postimg.cc/0QkPyK3c/IMG-7564.jpg', tags: ['CIA'] },
  { id: 'img-39', url: 'https://i.postimg.cc/1tms3VTC/IMG-7579.jpg', tags: ['CIA'] },
  { id: 'img-40', url: 'https://i.postimg.cc/VNBzwW7H/IMG-7595.jpg', tags: ['CIA'] },
  { id: 'img-41', url: 'https://i.postimg.cc/pdYPvJ0C/IMG-7604.jpg', tags: ['CIA'] },
  { id: 'img-42', url: 'https://i.postimg.cc/XvcnWk21/IMG-7613.jpg', tags: ['CIA'] },
  { id: 'img-43', url: 'https://i.postimg.cc/3wC3hFSM/IMG-7622.jpg', tags: ['CIA'] },
  { id: 'img-44', url: 'https://i.postimg.cc/cJNdPbcJ/IMG-7635.jpg', tags: ['CIA'] },
  { id: 'img-45', url: 'https://i.postimg.cc/FKghvVPy/IMG-7636.jpg', tags: ['CIA'] },
  { id: 'img-46', url: 'https://i.postimg.cc/d1swVZpY/IMG-7643.jpg', tags: ['CIA'] },
  { id: 'img-47', url: 'https://i.postimg.cc/bJypwSMM/IMG-7664.jpg', tags: ['CIA'] },
  { id: 'img-48', url: 'https://i.postimg.cc/MT6qpfNk/IMG-7671.jpg', tags: ['CIA'] },
  { id: 'img-49', url: 'https://i.postimg.cc/0QkPyKF1/IMG-7800.jpg', tags: ['CIA'] },
  { id: 'img-50', url: 'https://i.postimg.cc/B6S4nPyw/IMG-7801.jpg', tags: ['CIA'] },
  { id: 'img-51', url: 'https://i.postimg.cc/Pqkd0RMx/IMG-7849.jpg', tags: ['CIA'] },
  { id: 'img-52', url: 'https://i.postimg.cc/Gp1b65jd/IMG-7853.jpg', tags: ['CIA'] },
  { id: 'img-53', url: 'https://i.postimg.cc/0Nd9v0t4/IMG-7867.jpg', tags: ['CIA'] },
  { id: 'img-54', url: 'https://i.postimg.cc/0Nd9v0td/IMG-7891.jpg', tags: ['CIA'] },
  { id: 'img-55', url: 'https://i.postimg.cc/RZxr0nJp/IMG-5518.jpg', tags: ['James Arthur', 'P5'] },
  { id: 'img-56', url: 'https://i.postimg.cc/P5nGq8v6/IMG-7637.jpg', tags: ['James Arthur', 'P5'] },
  { id: 'img-57', url: 'https://i.postimg.cc/htRFG7Qp/IMG-7650.jpg', tags: ['James Arthur', 'P5'] },
  { id: 'img-58', url: 'https://i.postimg.cc/sgCF2ZG0/IMG-7659.jpg', tags: ['James Arthur', 'P5'] },
  { id: 'img-59', url: 'https://i.postimg.cc/Kcdcnjgz/aa2b5477a8af5e2f.jpg', tags: ['ALPHA'] },
  { id: 'img-60', url: 'https://i.postimg.cc/BZdZxb1w/image.jpg', tags: ['ALPHA'] },
  { id: 'img-61', url: 'https://i.postimg.cc/9X4FRZzR/IMG-7497.jpg', tags: ['ALPHA'] },
  { id: 'img-62', url: 'https://i.postimg.cc/Y2J210m1/IMG-7498.jpg', tags: ['ALPHA'] },
  { id: 'img-63', url: 'https://i.postimg.cc/CMWMj5fL/IMG-7531.jpg', tags: ['ALPHA'] },
  { id: 'img-64', url: 'https://i.postimg.cc/pVgVDrnZ/IMG-7560.jpg', tags: ['ALPHA'] },
  { id: 'img-65', url: 'https://i.postimg.cc/y6JYgcW6/IMG-7568.jpg', tags: ['ALPHA'] },
  { id: 'img-66', url: 'https://i.postimg.cc/nV6VvrQ0/IMG-7583.jpg', tags: ['ALPHA'] },
  { id: 'img-67', url: 'https://i.postimg.cc/3rPrgNDk/IMG-7584.png', tags: ['ALPHA'] },
  { id: 'img-68', url: 'https://i.postimg.cc/c1V1QC8Y/IMG-7589.jpg', tags: ['ALPHA'] },
  { id: 'img-69', url: 'https://i.postimg.cc/gcwkX8rP/IMG-7592.jpg', tags: ['ALPHA'] },
  { id: 'img-70', url: 'https://i.postimg.cc/tRLRhJV3/IMG-7600.jpg', tags: ['ALPHA'] },
  { id: 'img-71', url: 'https://i.postimg.cc/VsSLrn5N/IMG-7608.jpg', tags: ['ALPHA'] },
  { id: 'img-72', url: 'https://i.postimg.cc/59Z9wyFz/IMG-7609.jpg', tags: ['ALPHA'] },
  { id: 'img-73', url: 'https://i.postimg.cc/3ryJ4mW0/IMG-7615.jpg', tags: ['ALPHA'] },
  { id: 'img-74', url: 'https://i.postimg.cc/y6w6FxSk/IMG-7626.jpg', tags: ['ALPHA'] },
  { id: 'img-75', url: 'https://i.postimg.cc/RC3V6KqV/IMG-7641.jpg', tags: ['ALPHA'] },
  { id: 'img-76', url: 'https://i.postimg.cc/44r4zyhy/IMG-7649.jpg', tags: ['ALPHA'] },
  { id: 'img-77', url: 'https://i.postimg.cc/zDLXbK3v/IMG-7852.jpg', tags: ['ALPHA'] },
  { id: 'img-78', url: 'https://i.postimg.cc/8kqkhcrZ/IMG-8035.jpg', tags: ['ALPHA'] },
  { id: 'img-79', url: 'https://i.postimg.cc/8kWggHj6/IMG-3577.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-80', url: 'https://i.postimg.cc/xT2Dfzzv/IMG-4257.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-81', url: 'https://i.postimg.cc/L5jckHrC/IMG-4259.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-82', url: 'https://i.postimg.cc/cJbG0kRb/IMG-4263.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-83', url: 'https://i.postimg.cc/VsMPPRdr/IMG-4265.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-84', url: 'https://i.postimg.cc/9Mw5MP15/IMG-7616.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-85', url: 'https://i.postimg.cc/VvXx9Y3h/IMG-7639.jpg', tags: ['Tyros Mutchado', 'Mr T'] },
  { id: 'img-86', url: 'https://i.postimg.cc/25P90sdt/IMG-7593.jpg', tags: ['Vladimir Antonios'] },
  { id: 'img-87', url: 'https://i.postimg.cc/XvT1sRKL/IMG-7602.jpg', tags: ['Vladimir Antonios'] },
  { id: 'img-88', url: 'https://i.postimg.cc/L8Qb1YJ5/IMG-7605.jpg', tags: ['Vladimir Antonios'] },
  { id: 'img-89', url: 'https://i.postimg.cc/1zgYcmFc/IMG-7620.jpg', tags: ['Vladimir Antonios'] },
  { id: 'img-90', url: 'https://i.postimg.cc/jjG3Mp6M/IMG-7885.png', tags: ['Vladimir Antonios'] },
  { id: 'img-91', url: 'https://i.postimg.cc/9fGyjs5n/7A91AF7C-39FD-4428-8137-1810B4EC20ED.png', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-92', url: 'https://i.postimg.cc/4y8zStks/G3T9unp-X0AA8Dk8.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-93', url: 'https://i.postimg.cc/kMwFGrVH/IMG-1299.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-94', url: 'https://i.postimg.cc/jq8PKzmT/IMG-1302.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-95', url: 'https://i.postimg.cc/sXs7fK3S/IMG-1808.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-96', url: 'https://i.postimg.cc/tJR3kkcF/IMG-3412.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-97', url: 'https://i.postimg.cc/L501TpLk/IMG-3627.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-98', url: 'https://i.postimg.cc/Dzq1KRkt/IMG-3628.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-99', url: 'https://i.postimg.cc/QdvqDpBJ/IMG-3690.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-100', url: 'https://i.postimg.cc/0jHwfsD2/IMG-3691.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-101', url: 'https://i.postimg.cc/yNq0ts5v/IMG-4270.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-102', url: 'https://i.postimg.cc/9fTYQrTv/IMG-4274.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-103', url: 'https://i.postimg.cc/Tw0mKmPq/IMG-4403.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-104', url: 'https://i.postimg.cc/8P0Rdhmy/IMG-4726.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-105', url: 'https://i.postimg.cc/5N6vtXWP/IMG-7109.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-106', url: 'https://i.postimg.cc/FRpcYcK1/IMG-7132.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-107', url: 'https://i.postimg.cc/zvdncWZV/IMG-7133.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-108', url: 'https://i.postimg.cc/HsRM8TTh/IMG-7134.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-109', url: 'https://i.postimg.cc/HxdXW3dR/IMG-7135.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-110', url: 'https://i.postimg.cc/Fs8SkhhC/IMG-7531.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-111', url: 'https://i.postimg.cc/FKj0Qw5M/IMG-7533.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-112', url: 'https://i.postimg.cc/WzpG88Kc/IMG-7534.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-113', url: 'https://i.postimg.cc/QxH5MFZN/IMG-7535.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-114', url: 'https://i.postimg.cc/0Ng7FP3j/IMG-7536.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-115', url: 'https://i.postimg.cc/bJhHDpHW/IMG-7578.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-116', url: 'https://i.postimg.cc/QCnTb31M/IMG-7581.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-117', url: 'https://i.postimg.cc/LszjMGKC/IMG-7587.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-118', url: 'https://i.postimg.cc/L8GVSzqp/IMG-7591.png', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-119', url: 'https://i.postimg.cc/kGhbcmKd/IMG-7607.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-120', url: 'https://i.postimg.cc/pX6fQDJ1/IMG-7608.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-121', url: 'https://i.postimg.cc/43hBH8Cp/IMG-7618.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-122', url: 'https://i.postimg.cc/HxdXW3Ty/IMG-7621.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-123', url: 'https://i.postimg.cc/wxFcMKtV/IMG-7623.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-124', url: 'https://i.postimg.cc/bNsbvZfN/IMG-7624.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-125', url: 'https://i.postimg.cc/W4M0PxcT/IMG-7626.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-126', url: 'https://i.postimg.cc/BbhxVDWk/IMG-7631.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-127', url: 'https://i.postimg.cc/kXzSR77h/IMG-7633.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-128', url: 'https://i.postimg.cc/yNF0z2CK/IMG-7634-2.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-129', url: 'https://i.postimg.cc/JnLcDMcf/IMG-7638.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-130', url: 'https://i.postimg.cc/QCnTb31V/IMG-7644.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-131', url: 'https://i.postimg.cc/0Np7qhRt/IMG-7647.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-132', url: 'https://i.postimg.cc/Y026RRVH/IMG-7652.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-133', url: 'https://i.postimg.cc/NFPH4cmv/IMG-7653.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-134', url: 'https://i.postimg.cc/k5rWzqZN/IMG-7663.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-135', url: 'https://i.postimg.cc/RZ2Tmc3m/IMG-7799.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-136', url: 'https://i.postimg.cc/j5cNDNj2/IMG-7802.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-137', url: 'https://i.postimg.cc/8zfhZjyT/IMG-7850.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-138', url: 'https://i.postimg.cc/K815C9YY/IMG-7873.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-139', url: 'https://i.postimg.cc/qRwnNn7h/IMG-7878.jpg', tags: ['Abdulsamad Alqurashi', 'SSF', 'DO', 'Falcon'] },
  { id: 'img-140', url: 'https://i.postimg.cc/76ZhQRxh/IMG-1300.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-141', url: 'https://i.postimg.cc/rw5DdWnM/IMG-1301.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-142', url: 'https://i.postimg.cc/TPGpnwBM/IMG-1898.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-143', url: 'https://i.postimg.cc/0y7z6mWN/IMG-3413.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-144', url: 'https://i.postimg.cc/pLKm98Gz/IMG-3627.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-145', url: 'https://i.postimg.cc/xdRq5QSd/IMG-3628.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-146', url: 'https://i.postimg.cc/CKYzb1Xk/IMG-4043.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-147', url: 'https://i.postimg.cc/MGxv1TNQ/IMG-4221.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-148', url: 'https://i.postimg.cc/dtb7tn9X/IMG-4268.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-149', url: 'https://i.postimg.cc/fTttN1Yk/IMG-4272.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-150', url: 'https://i.postimg.cc/cJZrfH2c/IMG-4273.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-151', url: 'https://i.postimg.cc/Nf99cZR9/IMG-7126.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-152', url: 'https://i.postimg.cc/QdcFB54q/IMG-7127.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-153', url: 'https://i.postimg.cc/nzSr81zP/IMG-7128.png', tags: ['SSF', 'DO'] },
  { id: 'img-154', url: 'https://i.postimg.cc/G2gt0jtL/IMG-7130.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-155', url: 'https://i.postimg.cc/HnJxT7cF/IMG-7131.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-156', url: 'https://i.postimg.cc/rmwsYH8x/IMG-7569.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-157', url: 'https://i.postimg.cc/26SyXtzV/IMG-7571.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-158', url: 'https://i.postimg.cc/wvjMbr6X/IMG-7580.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-159', url: 'https://i.postimg.cc/vmzDhydD/IMG-7660.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-160', url: 'https://i.postimg.cc/0QyjH487/IMG-7665.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-161', url: 'https://i.postimg.cc/c4pK4Tmq/IMG-7866.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-162', url: 'https://i.postimg.cc/tRmZ89nh/IMG-7946.jpg', tags: ['SSF', 'DO'] },
  { id: 'img-163', url: 'https://i.postimg.cc/J0B1fVSb/IMG-7645.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-164', url: 'https://i.postimg.cc/2yBzsRgL/IMG-7646.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-165', url: 'https://i.postimg.cc/PJ8tgs0p/IMG-7670.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-166', url: 'https://i.postimg.cc/mkFbvfKN/IMG-7803.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-167', url: 'https://i.postimg.cc/MpQ8zJZq/c4228f.jpg', tags: ['ALPHA', 'Alexander Mahon', 'CIA'] },
  { id: 'img-168', url: 'https://i.postimg.cc/RZHzvxCB/G5PF6pr-XUAA6-X9.jpg', tags: ['ALPHA', 'Alexander Mahon', 'CIA'] },
  { id: 'img-169', url: 'https://i.postimg.cc/wjmd9Yxz/G7r-Iev1Xc-AAvptd.jpg', tags: ['ALPHA', 'Alexander Mahon', 'CIA'] },
  { id: 'img-170', url: 'https://i.postimg.cc/KjRHQtRk/image-(41).png', tags: ['Mjod'] },
  { id: 'img-171', url: 'https://i.postimg.cc/zBdQnxD7/image-(42).png', tags: ['Mjod'] },
  { id: 'img-172', url: 'https://i.postimg.cc/cLSN15v4/2025-10-14-22-43-17-NVIDIA-Ge-Force-Overlay.png', tags: ['Abdulsamad Alqurashi', 'DO', 'SSF', 'Falcon'] },
  { id: 'img-173', url: 'https://i.postimg.cc/2jgDM5rR/G43V7Rv-Xk-AAUPWZ.jpg', tags: ['Abdulsamad Alqurashi', 'DO', 'SSF', 'Falcon'] },
  { id: 'img-174', url: 'https://i.postimg.cc/CLDggVx0/Go-H8QPy-Wk-AASTVr.jpg', tags: ['Abdulsamad Alqurashi', 'DO', 'SSF', 'Falcon'] },
  { id: 'img-175', url: 'https://i.postimg.cc/NfTccwfJ/IMG-1981.jpg', tags: ['Abdulsamad Alqurashi', 'DO', 'SSF', 'Falcon'] },
  { id: 'img-176', url: 'https://i.postimg.cc/4NtggTxk/IMG-7644.jpg', tags: ['Abdulsamad Alqurashi', 'DO', 'SSF', 'Falcon'] },
  { id: 'img-177', url: 'https://i.postimg.cc/KYpVT98n/2025-07-05-194829.png', tags: ['Chaimon'] },
  { id: 'img-178', url: 'https://i.postimg.cc/13PL1ndT/2ADEF5C7-3B73-450A-84C3-A3FF9E083380.jpg', tags: ['Chaimon'] },
  { id: 'img-179', url: 'https://i.postimg.cc/4yVFrsbV/987070.png', tags: ['Chaimon'] },
  { id: 'img-180', url: 'https://i.postimg.cc/5tKGzPtc/image-(3).png', tags: ['Chaimon'] },
  { id: 'img-181', url: 'https://i.postimg.cc/mrpq9dg5/image-(39).png', tags: ['Chaimon'] },
  { id: 'img-182', url: 'https://i.postimg.cc/tRxf1NQN/image-(59).png', tags: ['Chaimon'] },
  { id: 'img-183', url: 'https://i.postimg.cc/jj39f8SN/image-(8).png', tags: ['Chaimon'] },
  { id: 'img-184', url: 'https://i.postimg.cc/rsxYvMCC/Screenshot-8.png', tags: ['Chaimon'] },
  { id: 'img-185', url: 'https://i.postimg.cc/wxLfxxLC/Ga-Vhe-M1Wk-AAWs-So.png', tags: ['Jacson Martin'] },
  { id: 'img-186', url: 'https://i.postimg.cc/wTkwJWWT/image-(64).png', tags: ['Jacson Martin'] },
  { id: 'img-187', url: 'https://i.postimg.cc/Kvb91X51/image-(65).png', tags: ['Jacson Martin'] },
  { id: 'img-188', url: 'https://i.postimg.cc/kg4vS76p/2024-09-22-025104.png', tags: ['Adbullah Al mhna'] },
  { id: 'img-189', url: 'https://i.postimg.cc/Dy5cmSZ5/Gk6Fd-Sb-Wc-AA5x-q.jpg', tags: ['Adbullah Al mhna'] },
  { id: 'img-190', url: 'https://i.postimg.cc/6p3fZB4t/IMG-3833.png', tags: ['Adbullah Al mhna'] },
  { id: 'img-191', url: 'https://i.postimg.cc/8z5mvTJ2/IMG-4260.jpg', tags: ['Adbullah Al mhna'] },
  { id: 'img-192', url: 'https://i.postimg.cc/rFy16qJp/image-(1).webp', tags: ['Abo Jasrah'] },
  { id: 'img-193', url: 'https://i.postimg.cc/qMBsfpLC/image-(59).png', tags: ['Abo Jasrah'] },
  { id: 'img-194', url: 'https://i.postimg.cc/B6gjN1Rr/image-(10).webp', tags: ['Frank Peter', 'SSF', 'DO'] },
  { id: 'img-195', url: 'https://i.postimg.cc/CLdRH57Z/image-(28).png', tags: ['Frank Peter', 'SSF', 'DO'] },
  { id: 'img-196', url: 'https://i.postimg.cc/MTDntjhJ/image-(9).webp', tags: ['Frank Peter', 'SSF', 'DO'] },
  { id: 'img-197', url: 'https://i.postimg.cc/FH3sDLLL/image-(54).png', tags: ['Vandam'] },
  { id: 'img-198', url: 'https://i.postimg.cc/cCCLmkRN/image-(8).webp', tags: ['Vandam'] },
  { id: 'img-199', url: 'https://i.postimg.cc/Z5pKVdd9/Screenshot-2024-12-10-225819.png', tags: ['Vandam'] },
  { id: 'img-200', url: 'https://i.postimg.cc/rmmTX0DX/image-(20).png', tags: ['Rip Done'] },
  { id: 'img-201', url: 'https://i.postimg.cc/xCCQDJXY/image-(21).png', tags: ['Rip Done'] },
  { id: 'img-202', url: 'https://i.postimg.cc/7LLPDQRg/Chat-GPT-Image-Oct-26-2025-12-38-13-PMyfnʿfn.png', tags: ['Saif Bin Khangar'] },
  { id: 'img-203', url: 'https://i.postimg.cc/15xz6B8j/image-(25).png', tags: ['Saif Bin Khangar'] },
  { id: 'img-204', url: 'https://i.postimg.cc/284SxWvS/image-(26).png', tags: ['Saif Bin Khangar'] },
  { id: 'img-205', url: 'https://i.postimg.cc/zffD5PQ6/image-(29).png', tags: ['Saif Bin Khangar'] },
  { id: 'img-206', url: 'https://i.postimg.cc/13QfxBPK/Screenshot-365.png', tags: ['Saif Bin Khangar'] },
  { id: 'img-207', url: 'https://i.postimg.cc/Qx5DcKwF/Gx76be-QWUAAIBe-U.jpg', tags: ['Tyros Mutchado', 'Mr.T'] },
  { id: 'img-208', url: 'https://i.postimg.cc/FKFQtWRL/Screenshot-2024-12-21-212533.png', tags: ['Tyros Mutchado', 'Mr.T'] },
  { id: 'img-209', url: 'https://i.postimg.cc/rpyL6nmv/Screenshot-2024-12-23-223628.png', tags: ['Tyros Mutchado', 'Mr.T'] },
  { id: 'img-210', url: 'https://i.postimg.cc/HLWCGZxB/Screenshot-2025-06-09-041953.png', tags: ['Tyros Mutchado', 'Mr.T'] },
  { id: 'img-211', url: 'https://i.postimg.cc/zfG42ytg/image-(14).png', tags: ['Musab Alsultan', 'DO', 'SSF'] },
  { id: 'img-212', url: 'https://i.postimg.cc/yNptM72J/image-(15).png', tags: ['Musab Alsultan', 'DO', 'SSF'] },
  { id: 'img-213', url: 'https://i.postimg.cc/1tNCbwpf/image-(22).png', tags: ['Naser Al Anzi'] },
  { id: 'img-214', url: 'https://i.postimg.cc/7LRtBmTD/image-(23).png', tags: ['Naser Al Anzi'] },
  { id: 'img-215', url: 'https://i.postimg.cc/ZqnDF104/image-(24).png', tags: ['Naser Al Anzi'] },
  { id: 'img-216', url: 'https://i.postimg.cc/bvrFHKr6/image-(48).png', tags: ['Naser Al Anzi'] },
  { id: 'img-217', url: 'https://i.postimg.cc/mrk6N0kw/image-(49).png', tags: ['Naser Al Anzi'] },
  { id: 'img-218', url: 'https://i.postimg.cc/SN4TtXjs/Screenshot-2025-02-12-220335.png', tags: ['Kamnjah'] },
  { id: 'img-219', url: 'https://i.postimg.cc/TYx7HyhJ/Screenshot-2025-02-12-220715.png', tags: ['Kamnjah'] },
  { id: 'img-220', url: 'https://i.postimg.cc/2512BhXk/image-(63).png', tags: ['Ali Alnono'] },
  { id: 'img-221', url: 'https://i.postimg.cc/sgNJy1fq/faf708edf6ede461.jpg', tags: ['Dbiazah'] },
  { id: 'img-222', url: 'https://i.postimg.cc/tgnNgy78/image-(32).png', tags: ['Dbiazah'] },
  { id: 'img-223', url: 'https://i.postimg.cc/GhMFJ9Dw/image-(1).webp', tags: ['Hjhoj Alshamri'] },
  { id: 'img-224', url: 'https://i.postimg.cc/DyCrdmGh/image-(2).webp', tags: ['Hjhoj Alshamri'] },
  { id: 'img-225', url: 'https://i.postimg.cc/fRG0BdRJ/image-(30).png', tags: ['Abas Assad'] },
  { id: 'img-226', url: 'https://i.postimg.cc/63w4NNZd/image-(44).png', tags: ['Abas Assad'] },
  { id: 'img-227', url: 'https://i.postimg.cc/501QMMz3/image-(45).png', tags: ['Abas Assad'] },
  { id: 'img-228', url: 'https://i.postimg.cc/TYhLx0yM/2024-09-22-025104.png', tags: ['Sadon Saad'] },
  { id: 'img-229', url: 'https://i.postimg.cc/kXD6CsVP/IMG-3565.png', tags: ['Sadon Saad'] },
  { id: 'img-230', url: 'https://i.postimg.cc/ZK0BmHWG/IMG-6086.png', tags: ['Sadon Saad'] },
  { id: 'img-231', url: 'https://i.postimg.cc/hPJj6GYH/image-(33).png', tags: ['Abo Kyan'] },
  { id: 'img-232', url: 'https://i.postimg.cc/PJ7qNGLp/image-(43).png', tags: ['Abo Kyan'] },
  { id: 'img-233', url: 'https://i.postimg.cc/MHHTWZpL/image-(53).png', tags: ['Abo Kyan'] },
  { id: 'img-234', url: 'https://i.postimg.cc/L5Wshdqd/image-(61).png', tags: ['Abo Kyan'] },
  { id: 'img-235', url: 'https://i.postimg.cc/fbvTmS3d/image-(16).png', tags: ['Shaker Sheshah'] },
  { id: 'img-236', url: 'https://i.postimg.cc/k5yXKRV1/image-(17).png', tags: ['Shaker Sheshah'] },
  { id: 'img-237', url: 'https://i.postimg.cc/g2FY7H87/image-(47).png', tags: ['Akai', 'SSF', 'DO'] },
  { id: 'img-238', url: 'https://i.postimg.cc/pTTxjGMD/Screenshot-2025-01-15-063448.png', tags: ['Dema Alqhtani'] },
  { id: 'img-239', url: 'https://i.postimg.cc/wvvHNfYs/Screenshot-2025-01-15-065009.png', tags: ['Dema Alqhtani'] },
  { id: 'img-240', url: 'https://i.postimg.cc/wvvHNfYL/Screenshot-2025-01-15-065221.png', tags: ['Dema Alqhtani'] },
  { id: 'img-241', url: 'https://i.postimg.cc/4xQmbSqw/image-(55).png', tags: ['Jezy'] },
  { id: 'img-242', url: 'https://i.postimg.cc/nLVMd1tV/image-(56).png', tags: ['Jezy'] },
  { id: 'img-243', url: 'https://i.postimg.cc/VN7v2bYz/image-(57).png', tags: ['Jezy'] },
  { id: 'img-244', url: 'https://i.postimg.cc/2yW5qcnC/image-(50).png', tags: ['Antony Mutchado'] },
  { id: 'img-245', url: 'https://i.postimg.cc/rFSmMH8H/245245.png', tags: ['Abdulrahman Bin Mansour'] },
  { id: 'img-246', url: 'https://i.postimg.cc/hP9jcYS2/Screenshot-2024-11-28-020950.webp', tags: ['Abdulrahman Bin Mansour'] },
  { id: 'img-247', url: 'https://i.postimg.cc/ZRBbg77V/IMG-7665.jpg', tags: ['Bob Marley', 'SSF', 'DO'] },
  { id: 'img-248', url: 'https://i.postimg.cc/VLBY3bgL/image-(6).webp', tags: ['Saqr'] },
  { id: 'img-249', url: 'https://i.postimg.cc/Hs4pf7zJ/image-(7).webp', tags: ['Saqr'] },
  { id: 'img-250', url: 'https://i.postimg.cc/xCzQgk85/Screenshot-2025-04-20-035914.jpg', tags: ['Abo Jazan', 'SSF', 'DO'] },
  { id: 'img-251', url: 'https://i.postimg.cc/y88ztpWb/image-(1).png', tags: ['Abo Mi'] },
  { id: 'img-252', url: 'https://i.postimg.cc/Z55h2s00/image-(31).png', tags: ['Abo Mi'] },
  { id: 'img-253', url: 'https://i.postimg.cc/BnVRyqrj/image-(40).png', tags: ['Satam Alotaibi', 'SSF', 'DO'] },
  { id: 'img-254', url: 'https://i.postimg.cc/gJqSYdT6/5765.png', tags: ['Abo Samaan'] },
  { id: 'img-255', url: 'https://i.postimg.cc/bwsB17s6/image.webp', tags: ['Abo Samaan'] },
  { id: 'img-256', url: 'https://i.postimg.cc/6qMMvcw3/image-(52).png', tags: ['Abo Samaan'] },
  { id: 'img-257', url: 'https://i.postimg.cc/gjggZsdp/image-(6).png', tags: ['Abo Samaan'] },
  { id: 'img-258', url: 'https://i.postimg.cc/Kj8NxTLZ/77971740aa76771d.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-259', url: 'https://i.postimg.cc/T139fbmM/fy7t6h.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-260', url: 'https://i.postimg.cc/Kjp5zYrm/G7m-J-x-KWs-AAc-I5D.jpg', tags: ['Agent X', 'CIA'] },
  { id: 'img-261', url: 'https://i.postimg.cc/HnvtxL4n/image-32.png', tags: ['Agent X', 'CIA'] },
  { id: 'img-262', url: 'https://i.postimg.cc/vmwtDk9c/5e1fc59efbd0be15.jpg', tags: ['Eziar Qab', 'CIA'] },
  { id: 'img-263', url: 'https://i.postimg.cc/7hhgpkvK/azeezz.png', tags: ['Eziar Qab', 'CIA'] },
  { id: 'img-264', url: 'https://i.postimg.cc/B6q5BFmt/azez.png', tags: ['Eziar Qab', 'CIA'] },
  { id: 'img-265', url: 'https://i.postimg.cc/wB5cN2cb/G3AJLm-WEAAUj0r.jpg', tags: ['Eziar Qab', 'CIA'] },
  { id: 'img-266', url: 'https://i.postimg.cc/5tWSjTvX/G42vg-Gy-XQAEn-VGT.jpg', tags: ['Eziar Qab', 'CIA'] },
  { id: 'img-267', url: 'https://i.postimg.cc/bvf9dWbr/Gecvrw2X0AAXze-W.jpg', tags: ['Eziar Qab', 'CIA'] },
  { id: 'img-268', url: 'https://i.postimg.cc/8zMh843P/2025-06-22-142810.png', tags: ['Abdullah Turki', 'SSF', 'DO'] },
  { id: 'img-269', url: 'https://i.postimg.cc/JzZbwxg7/image.png', tags: ['Abdullah Turki', 'SSF', 'DO'] },
  { id: 'img-270', url: 'https://i.postimg.cc/t4Wh0kfZ/IMG-3370.png', tags: ['Abdullah Turki', 'SSF', 'DO'] },
  { id: 'img-271', url: 'https://i.postimg.cc/VknjygTk/IMG-7271.jpg', tags: ['Abdullah Turki', 'SSF', 'DO'] },
  { id: 'img-272', url: 'https://i.postimg.cc/BbR1kPBg/GSzd-G3DXYAA5u-Xi.png', tags: ['Shbeb Bin Shalfah'] },
  { id: 'img-273', url: 'https://i.postimg.cc/7hJ53Yrw/brave-b0FMjmuz-A3-more-Detail-8k-7615x8192-2pass-more-Detail-enhanced.png', tags: ['Saeed Akfah'] },
  { id: 'img-274', url: 'https://i.postimg.cc/J0HsN4Cy/image-(1).png', tags: ['Saeed Akfah'] },
  { id: 'img-275', url: 'https://i.postimg.cc/JzNBYnDG/q-KU1ebdl-jpg-small.jpg', tags: ['Saeed Akfah'] },
  { id: 'img-276', url: 'https://i.postimg.cc/XYfy1JGr/zy8ti4t-D-jpg-small.jpg', tags: ['Saeed Akfah'] },
  { id: 'img-277', url: 'https://i.postimg.cc/DyVrxRpf/E-8Ts-N5XIAQt-S11.png', tags: ['Abo Jalal'] },
  { id: 'img-278', url: 'https://i.postimg.cc/h4Q8bKr5/Go-WCZGm-XYAA45l-V.jpg', tags: ['Abo Jalal'] },
  { id: 'img-279', url: 'https://i.postimg.cc/bwg1Nrzm/image-(46).png', tags: ['Abo Jalal'] },
  { id: 'img-280', url: 'https://i.postimg.cc/50hCkF3Q/CUw-ADm-JR.jpg', tags: ['Mesh'] },
  { id: 'img-281', url: 'https://i.postimg.cc/vBJVS6zB/Ig-n-OYo-I.jpg', tags: ['Mesh'] },
  { id: 'img-282', url: 'https://i.postimg.cc/9M67Nqpz/kdj-K-8Xa.jpg', tags: ['Mesh'] },
  { id: 'img-283', url: 'https://i.postimg.cc/fLG9g0K2/m-NJy-D3Xm.jpg', tags: ['Mesh'] },
  { id: 'img-284', url: 'https://i.postimg.cc/rmBrYtJx/Pb-B8Ipk.jpg', tags: ['Mesh'] },
  { id: 'img-285', url: 'https://i.postimg.cc/rs5r6Fn1/q-Ly8g1YY.jpg', tags: ['Mesh'] },
  { id: 'img-286', url: 'https://i.postimg.cc/4xWhR0Ps/0d-Egoz-Wo.jpg', tags: ['Dr', 'Andrew', 'CIA'] },
  { id: 'img-287', url: 'https://i.postimg.cc/0yVJ14ns/cg-F3DAf0.jpg', tags: ['Dr', 'Andrew', 'CIA'] },
  { id: 'img-288', url: 'https://i.postimg.cc/fRz0FscN/In-BN51l-T.jpg', tags: ['Dr', 'Andrew', 'CIA'] },
  { id: 'img-289', url: 'https://i.postimg.cc/8cg7bgpx/ag-SFH7Wg.jpg', tags: ['Abdullah Al Falaj'] },
  { id: 'img-290', url: 'https://i.postimg.cc/BbfjCfSh/f-Xnf-Hj-QP.jpg', tags: ['Abdullah Al Falaj'] },
  { id: 'img-291', url: 'https://i.postimg.cc/8cg7bgpZ/Ht-GRr-Yu-B.jpg', tags: ['Abdullah Al Falaj'] },
  { id: 'img-292', url: 'https://i.postimg.cc/4N5Yp0rW/20250914-215732.webp', tags: ['Lil Wezy'] },
  { id: 'img-293', url: 'https://i.postimg.cc/FzvKLbG5/IMG-1111.png', tags: ['Lil Wezy'] },
  { id: 'img-294', url: 'https://i.postimg.cc/1zNR77Yp/fq-Ku-Xl-LS-jpg-large.jpg', tags: ['Bsher'] },
  { id: 'img-295', url: 'https://i.postimg.cc/HL7WvvP9/UCa-FFdbe-jpg-large.jpg', tags: ['Bsher'] },
  { id: 'img-296', url: 'https://i.postimg.cc/YqqrBCsY/G0a-Yx-Oy-WIAAo-S8g.jpg', tags: ['Jihad Al Atrash'] },
  { id: 'img-297', url: 'https://i.postimg.cc/MKK6JpF0/Gt-APWY2Ws-AAU0-q.jpg', tags: ['Jihad Al Atrash'] },
  { id: 'img-298', url: 'https://i.postimg.cc/4dgGLfcT/F7S0z-MNXk-AAJ5p-F.jpg', tags: ['Hmid'] },
  { id: 'img-299', url: 'https://i.postimg.cc/k589v62P/F8u7Wth-Wk-AA-j-Gz.jpg', tags: ['Hmid'] },
  { id: 'img-300', url: 'https://i.postimg.cc/g0RdHXx2/Gy12Rd-XW8AAUiy-A.png', tags: ['Hmid'] },
  { id: 'img-301', url: 'https://i.postimg.cc/L4vSDM8L/e-n885NS.png', tags: ['Abdullah Khaled', 'SSF', 'DO'] },
  { id: 'img-302', url: 'https://i.postimg.cc/Yq9Hyyvx/Fug-X9Zo-V.png', tags: ['Abdullah Khaled', 'SSF', 'DO'] },
  { id: 'img-303', url: 'https://i.postimg.cc/Twf8jk8j/G7pr-E0NWs-AA1crg.jpg', tags: ['Abo Fahda'] },
  { id: 'img-304', url: 'https://i.postimg.cc/PxTGb6GM/G7pu-LRZWw-AA1gm8.jpg', tags: ['Abo Fahda'] },
  { id: 'img-305', url: 'https://i.postimg.cc/63tsVHs0/s1Usd-WDA.jpg', tags: ['Abo Fahda'] },
  { id: 'img-306', url: 'https://i.postimg.cc/Dym9cJNY/G34Y4Jy-XUAIi7Dt.jpg', tags: ['Abo 3abd Qasima'] },
  { id: 'img-307', url: 'https://i.postimg.cc/zX3skbQ6/Gm-W3OYGWEAA3Hc1.jpg', tags: ['Abo 3abd Qasima'] },
  { id: 'img-308', url: 'https://i.postimg.cc/zfY45dfJ/Gh-WLn0LWQAAWSJd.jpg', tags: ['Leon Limony', 'Mutchado'] },
  { id: 'img-309', url: 'https://i.postimg.cc/SKbHqZKk/Gh-WLn0MWEAAjp-A4.jpg', tags: ['Leon Limony', 'Mutchado'] },
  { id: 'img-310', url: 'https://i.postimg.cc/KYhCF9Yb/Gh-WLn0MWUAA-2Tm.jpg', tags: ['Leon Limony', 'Mutchado'] },
  { id: 'img-311', url: 'https://i.postimg.cc/mkk5VJm3/e645b220fbcb6ac7.jpg', tags: ['س ع'] },
  { id: 'img-312', url: 'https://i.postimg.cc/C55QJXc4/Eq1We5KW8AA9zvn.jpg', tags: ['س ع'] },
  { id: 'img-313', url: 'https://i.postimg.cc/ZnnMj2wx/Screenshot-19.png', tags: ['س ع'] },
  { id: 'img-314', url: 'https://i.postimg.cc/Bv37RXm7/Screenshot-14.png', tags: ['Brof'] },
  { id: 'img-315', url: 'https://i.postimg.cc/xdQpBc6g/Screenshot-15.png', tags: ['Brof'] },
  { id: 'img-316', url: 'https://i.postimg.cc/d0FNgL55/Screenshot-16.png', tags: ['Brof'] },
  { id: 'img-317', url: 'https://i.postimg.cc/hjPyPNWr/G7p7h9lbs-AEZd-Yt.jpg', tags: ['Fahad Saad', 'SSF', 'DO'] },
  { id: 'img-318', url: 'https://i.postimg.cc/DzcphnDc/G7q-W5QOWMAA5fe7.jpg', tags: ['Fahad Saad', 'SSF', 'DO'] },
  { id: 'img-319', url: 'https://i.postimg.cc/wvv2dJD9/image.png', tags: ['Stavx'] },
  { id: 'img-320', url: 'https://i.postimg.cc/633cNRC9/image-(1).png', tags: ['Stavx'] },
  { id: 'img-321', url: 'https://i.postimg.cc/sXNcfX4b/image-(2).png', tags: ['Stavx'] },
  { id: 'img-322', url: 'https://i.postimg.cc/fk4fXrFr/Gq3Ap-Bf-WAAA9pn-J.jpg', tags: ['Waleed Fahad'] },
  { id: 'img-323', url: 'https://i.postimg.cc/Fsc2q59D/Gmwko4l-XMAA-ig8.jpg', tags: ['Kane'] },
  { id: 'img-324', url: 'https://i.postimg.cc/RZBjxsF7/Gp-A4b-RSXs-AAWX-t.jpg', tags: ['Kane'] },
  { id: 'img-325', url: 'https://i.postimg.cc/xTHW7D0M/Gu-ZKBFp-XAAAo-QQZ.jpg', tags: ['Kane'] },
  { id: 'img-326', url: 'https://i.postimg.cc/c4YVjysF/Gun-JQ7g-XEAAJZWk.jpg', tags: ['Kane'] },
  { id: 'img-327', url: 'https://i.postimg.cc/sXqN6KqJ/Screenshot-2025-07-07-031003.png', tags: ['Vladimir Antonios'] },
  { id: 'img-328', url: 'https://i.postimg.cc/zB6ctp6C/Screenshot-2025-07-07-033923.png', tags: ['Vladimir Antonios'] },
  { id: 'img-329', url: 'https://i.postimg.cc/KzRWDCqB/Screenshot-2025-07-07-033959.png', tags: ['Vladimir Antonios'] },
  { id: 'img-330', url: 'https://i.postimg.cc/L820bJCG/Fy-SYZz-QXw-AAu-QWc.jpg', tags: ['Abo Shae3'] },
  { id: 'img-331', url: 'https://i.postimg.cc/3xYbckfQ/Grvq-v-WMAA9Hhq.jpg', tags: ['Abo Shae3'] },
  { id: 'img-332', url: 'https://i.postimg.cc/9QCNnDgF/Gv-Nt3p-XMAEaap-Z.png', tags: ['Abo Shae3'] },
  { id: 'img-333', url: 'https://i.postimg.cc/nzjdDBrF/GNAKkd-MXQAA7U-k.png', tags: ['Sadani'] },
  { id: 'img-334', url: 'https://i.postimg.cc/y81vTwx5/Gj-G9v9SWw-AAx43K.jpg', tags: ['Abo Swe7an'] },
  { id: 'img-335', url: 'https://i.postimg.cc/t4q2zLJw/Gj-Nkxe6Ws-AAJy7a.jpg', tags: ['Abo Swe7an'] },
  { id: 'img-336', url: 'https://i.postimg.cc/BnSMCdbV/Gj-Nkxe6XEAAWA0t.jpg', tags: ['Abo Swe7an'] },
  { id: 'img-337', url: 'https://i.postimg.cc/ZY6HzTdK/G02Ox-Aj-WAAA7K0T.jpg', tags: ['Zeeyad Al Shamei', 'SSF', 'DO'] },
  { id: 'img-338', url: 'https://i.postimg.cc/Pf1yntw8/G1AY-e9WQAAg6-D.jpg', tags: ['Zeeyad Al Shamei', 'SSF', 'DO'] },
  { id: 'img-339', url: 'https://i.postimg.cc/VL1RY3qs/G3U-a-OWg-AAr2h-W.png', tags: ['Zeeyad Al Shamei', 'SSF', 'DO'] },
  { id: 'img-340', url: 'https://i.postimg.cc/J7jxC1kn/Gze-Gr0l-Xo-AA63FS.jpg', tags: ['Zeeyad Al Shamei', 'SSF', 'DO'] },
];

export const voteCharacters: VoteCharacter[] = [
    {
        id: 'char-1',
        name: 'The Don',
        role: 'Criminal',
        faction: 'Scrap_Gang',
        rank: 'Leader',
        note: 'Controls the industrial district iron fist.',
        image: 'https://picsum.photos/seed/godfather/400/500',
        votes: 0,
        tags: ['Leader'],
        social: {
            twitter: '#',
            discord: '#'
        }
    }
];

export const threadsData: Thread[] = [
  {
    id: 'thread-1',
    owner: 'System',
    title: 'Welcome to MTNEWS',
    description: 'Start exploring the server news and updates.',
    image: 'https://i.postimg.cc/PrqvJ5RX/IMG-7993.png',
    date: '2024-01-01',
    tags: ['Announcement'],
    sections: [
      { content: 'Welcome to the new MTNEWS portal. Here you will find all information related to MTRP.' }
    ],
    socials: {
        twitter: 'https://x.com/mtnews_?s=21'
    }
  }
];

export const linksData: LinkData[] = [
  { id: 'link-1', platform: 'Twitter', url: 'https://twitter.com/MT_FiveM' },
  { id: 'link-2', platform: 'Discord', url: 'https://discord.gg/mt' },
  { id: 'link-3', platform: 'YouTube', url: 'https://www.youtube.com/@MT_FiveM' },
  { id: 'link-4', platform: 'TikTok', url: 'https://www.tiktok.com/@mysterytown.gg?is_from_webapp=1&sender_device=pc' },
];

export const creditsData: CreditPerson[] = [
  {
    name: 'MTNEWS',
    roleKey: 'founder',
    image: 'https://i.postimg.cc/PrqvJ5RX/IMG-7993.png',
    socials: [
      { platform: 'Twitter', url: 'https://x.com/mtnews_?s=21' },
      { platform: 'Kick', url: 'https://kick.com/MTNEWS' },
    ],
  },
  {
    name: 'Mohammed',
    roleKey: 'developer',
    image: 'https://i.postimg.cc/vmGs8c0W/91106cac524b2ae1dfe17ea8ff2b46d6.png',
    socials: [
      { platform: 'Twitter', url: 'https://x.com/i_mohammedqht?s=21' },
      { platform: 'Discord', url: '221.k' },
    ],
  },
  {
    name: 'Silver',
    roleKey: 'contributor',
    image: 'https://i.postimg.cc/76WFvqGZ/photo-2025-07-10-17-32-30.jpg',
    socials: [{ platform: 'Twitter', url: 'https://x.com/_silver_rm_?=21' }],
  },
  {
    name: 'Badr',
    roleKey: 'contributor',
    image: 'https://i.postimg.cc/PqrfTrx9/batman-red-2732x2732-19038.jpg$0',
    socials: [
      { platform: 'Twitter', url: 'https://x.com/1liBadr?=21' },
      { platform: 'Kick', url: 'https://kick.com/iiiBADR'}
      ],
  },
  {
    name: 'iWe',
    roleKey: 'contributor',
    image: 'https://i.postimg.cc/Hk1QYgdn/6c8213ca5d58b44b7921288439f38fcb.png',
    socials: [
      { platform: 'Twitter', url: 'https://x.com/1iwep?s=21' },
    ],
  }
];
