// Nyanza District - Southern Province, Rwanda
// Administrative hierarchy: Sector -> Cell -> Village

export interface NyanzaVillage {
  name: string;
}

export interface NyanzaCell {
  name: string;
  villages: string[];
}

export interface NyanzaSector {
  name: string;
  cells: NyanzaCell[];
}

export const NYANZA_SECTORS: NyanzaSector[] = [
  {
    name: "Busasamana",
    cells: [
      {
        name: "Gahondo",
        villages: [
          "Bigega",
          "Bugura",
          "Kamatovu",
          "Karama",
          "Kavumu",
          "Kibaga",
          "Kiberinka",
          "Nyakwibereka",
          "Nyarutovu",
        ],
      },
      {
        name: "Kavumu",
        villages: [
          "Akirabo",
          "Gihisi A",
          "Gihisi B",
          "Karukoranya A",
          "Karukoranya B",
          "Majyambere",
          "Mugandamure A",
          "Mugandamure B",
          "Mukoni",
          "Nyagatovu",
          "Nyamagana B",
          "Rukandiro",
          "Ruvumera",
          "Kavumu",
          "Nyamagana A",
        ],
      },
      {
        name: "Kibinja",
        villages: [
          "Kabuzuru",
          "Kigarama",
          "Mukindo",
          "Ngorongari",
          "Rebero",
          "Rugarama",
          "Rugari A",
          "Rugari B",
        ],
      },
      {
        name: "Nyanza",
        villages: [
          "Bunyeshywa",
          "Gakenyeri A",
          "Gakenyeri B",
          "Gatare",
          "Gatsinsino",
          "Gatunguru",
          "Gishike",
          "Kavumu",
          "Kigarama",
          "Kivumu",
          "Mugonzi",
          "Nyanza",
          "Nyarunyinya",
          "Rubona",
        ],
      },
      {
        name: "Rwesero",
        villages: [
          "Bukinankwavu",
          "Gahanda",
          "Gisando",
          "Kabona",
          "Kidaturwa",
          "Murambi",
          "Mwima",
          "Nyabisindu",
          "Rugarama",
          "Rukari",
          "Rwesero",
          "Taba",
        ],
      },
    ],
  },
  {
    name: "Busoro",
    cells: [
      {
        name: "Gitovu",
        villages: [
          "Gitega",
          "Kabeza",
          "Kayenzi",
          "Muhindo",
          "Musumba",
          "Nazareti",
          "Nyacyonga",
          "Nyagasambu",
          "Rushoka",
        ],
      },
      {
        name: "Kimirama",
        villages: [
          "Gitwa",
          "Kimirama",
          "Kireranyana",
          "Ndamira",
          "Nyamiyonga",
          "Nyarugenge",
          "Rugarama",
        ],
      },
      {
        name: "Masangano",
        villages: [
          "Busoro",
          "Bweramana",
          "Gikombe",
          "Masangano",
          "Murambi",
          "Nyarugunga",
          "Runyonza",
          "Shinga",
        ],
      },
      {
        name: "Munyinya",
        villages: ["Kagarama", "Karambi", "Kigali", "Kivugiza", "Rwara"],
      },
      {
        name: "Rukingiro",
        villages: [
          "Cyamugani",
          "Cyuriro",
          "Gasambu",
          "Runazi",
          "Rwanamiza",
          "Rwangoga",
        ],
      },
      {
        name: "Shyira",
        villages: [
          "Gahogo",
          "Kinkanga",
          "Nyamoyaga",
          "Rucyamo",
          "Rusharu",
          "Saruduha",
        ],
      },
    ],
  },
  {
    name: "Cyabakamyi",
    cells: [
      {
        name: "Kadaho",
        villages: [
          "Gahengeri",
          "Gasenyi",
          "Gataba",
          "Gitega",
          "Kabere",
          "Kabeza",
          "Kadaho",
          "Nyabisazi",
          "Nyabyiyoni",
        ],
      },
      {
        name: "Karama",
        villages: [
          "Butembo",
          "Cyarera",
          "Gahondo",
          "Gatongati",
          "Kamabuye",
          "Kamonyi",
          "Karama",
          "Nyabinombe",
        ],
      },
      {
        name: "Nyabinyenga",
        villages: [
          "Kabuga",
          "Kandihe",
          "Karehe",
          "Kimiyumbu",
          "Nyabinyenga",
          "Rugwa",
          "Rwamagana",
          "Taba",
        ],
      },
      {
        name: "Nyarurama",
        villages: [
          "Kabyuma",
          "Kigarama",
          "Kirombozi",
          "Nyakabingo",
          "Rugote",
          "Ruvuzo",
          "Rwabatwa",
          "Rwamiko",
        ],
      },
      {
        name: "Rubona",
        villages: [
          "Bikombe",
          "Bugarama",
          "Gahunga",
          "Karambo",
          "Kavumu",
          "Murambi",
          "Nyabishike",
          "Nyaminazi",
          "Nyarutovu",
          "Rugendabari",
        ],
      },
    ],
  },
  {
    name: "Kibilizi",
    cells: [
      {
        name: "Cyeru",
        villages: [
          "Gasagara",
          "Gisika",
          "Kamatamu",
          "Karama",
          "Matara",
          "Muyebe",
          "Nyamunini",
          "Rutete",
        ],
      },
      {
        name: "Mbuye",
        villages: [
          "Binyana",
          "Gako",
          "Gihama",
          "Karambi",
          "Karehe",
          "Kigarama",
          "Mukoni",
          "Rukore",
        ],
      },
      {
        name: "Mututu",
        villages: [
          "Gatongati",
          "Gicumbi",
          "Kabeza",
          "Kanyinya",
          "Kivugiza",
          "Masangano",
        ],
      },
      {
        name: "Rwotso",
        villages: [
          "Bigarama",
          "Kabuga",
          "Kibilizi",
          "Mubano",
          "Mubuga",
          "Mutima",
          "Nyarurama",
          "Runyonza",
          "Rusagara",
          "Saruhembe",
        ],
      },
    ],
  },
  {
    name: "Kigoma",
    cells: [
      {
        name: "Butansinda",
        villages: [
          "Butatsinda",
          "Gitare",
          "Shusho",
          "Karama",
          "Karambo",
          "Kayange",
          "Kibaza",
          "Kigoma",
          "Marongi",
          "Mataba",
          "Nyesonga",
        ],
      },
      {
        name: "Butara",
        villages: [
          "Buruba",
          "Butara",
          "Gasharu",
          "Kavumu",
          "Kigufi",
          "Kirundo",
          "Nyabusheshe",
          "Runyinya",
        ],
      },
      {
        name: "Gahombo",
        villages: [
          "Birembo",
          "Cyingina",
          "Gashikiri",
          "Gicunshu",
          "Gisore",
          "Karugando",
          "Kaziba",
          "Kirerabana",
          "Nyagacyamo",
          "Rugarama",
          "Serivise",
        ],
      },
      {
        name: "Gasoro",
        villages: [
          "Bugarura",
          "Bwambika",
          "Gisoro",
          "Giturwa",
          "Kabacuzi",
          "Kajevuba",
          "Kinene",
          "Mutende",
          "Nyabubare",
          "Nyakabungo",
          "Runyanzige",
          "Sholi",
        ],
      },
      {
        name: "Mulinja",
        villages: [
          "Akana Ka Mulinja",
          "Akintare",
          "Buharankakara",
          "Buhoro",
          "Burambi",
          "Karama",
          "Kigarama",
          "Muramba",
          "Nyarukurazo",
          "Sabununga",
        ],
      },
    ],
  },
  {
    name: "Mukingo",
    cells: [
      {
        name: "Cyerezo",
        villages: [
          "Birambo",
          "Bweramana",
          "Cyerezo",
          "Cyikirehe",
          "Cyumba",
          "Gasharu",
          "Kamabuye",
          "Karambi",
          "Nyarutovu",
        ],
      },
      {
        name: "Gatagara",
        villages: [
          "Cyahafi",
          "Gatagara",
          "Kamushatsi",
          "Karama",
          "Karuhwanya",
          "Kinyogoto",
          "Muhororo",
          "Nyamiyaga",
          "Nyamuko",
        ],
      },
      {
        name: "Kiruli",
        villages: [
          "Gahoko",
          "Kaganza",
          "Kiganda",
          "Kigarama",
          "Masambu",
          "Muganza",
          "Murehe",
          "Muturirwa",
          "Nkiko",
          "Nyabishinge",
          "Nyankunamirwa",
        ],
      },
      {
        name: "Mpanga",
        villages: [
          "Birembo",
          "Karambi",
          "Kinyinya",
          "Mataba",
          "Nkinda",
          "Nyakabuye",
          "Nyamazi",
          "Remera",
        ],
      },
      {
        name: "Ngwa",
        villages: [
          "Bikire",
          "Biroro",
          "Gasiza",
          "Kagwa A",
          "Karambi A",
          "Karenge",
          "Kidaturwa",
          "Kigarama",
          "Mwanabiri",
          "Nyarunyinya A",
          "Rutete",
        ],
      },
      {
        name: "Nkomero",
        villages: [
          "Cyimana",
          "Gisuma",
          "Kabarima",
          "Kibonde",
          "Kigarama",
          "Nyacyoma",
          "Nyakabungo",
          "Nyankokoma",
          "Nzuki",
          "Ruhosha",
        ],
      },
    ],
  },
  {
    name: "Muyira",
    cells: [
      {
        name: "Gati",
        villages: [
          "Buhaza",
          "Kimfizi",
          "Kinyoni",
          "Ruyenzi",
          "Rwabihanga",
        ],
      },
      {
        name: "Migina",
        villages: [
          "Bugina",
          "Kalilisi",
          "Kavumu",
          "Kinyana",
          "Musenyi",
        ],
      },
      {
        name: "Nyamiyaga",
        villages: ["Gihama", "Kabuye", "Kiniga", "Nzovi", "Rugese"],
      },
      {
        name: "Nyamure",
        villages: [
          "Cyegera",
          "Gatare",
          "Gituza",
          "Kanyundo",
          "Nyarugunga",
        ],
      },
      {
        name: "Nyundo",
        villages: ["Jari", "Nyundo", "Mugari", "Muyira", "Nzoga"],
      },
    ],
  },
  {
    name: "Ntyazo",
    cells: [
      {
        name: "Bugali",
        villages: [
          "Gakindo",
          "Gisayura",
          "Kabusheja",
          "Kiruhura",
          "Marabage",
          "Ndago",
          "Nkomane",
          "Nyabitare",
          "Rugarama",
        ],
      },
      {
        name: "Cyotamakara",
        villages: [
          "Bayi",
          "Kankima",
          "Karuyumbo",
          "Misasa",
          "Mpande",
          "Nyabigugu",
          "Nyarutovu",
          "Ruyenzi",
          "Rwimpundu",
        ],
      },
      {
        name: "Kagunga",
        villages: [
          "Bukinanyana",
          "Kamabuye",
          "Kimigunga",
          "Ntebe",
          "Nyakabungo",
          "Nyamirama",
          "Nyamirambo",
          "Nyamizi",
          "Nyarubuye",
          "Rusasa",
          "Samuduha",
        ],
      },
      {
        name: "Katarara",
        villages: [
          "Gasharu",
          "Kagarama",
          "Kamabuye",
          "Muhero",
          "Munyiginya",
          "Muyenzi",
          "Nkombe",
          "Rebero",
          "Rukoma",
          "Rusebeya",
        ],
      },
    ],
  },
  {
    name: "Nyagisozi",
    cells: [
      {
        name: "Gahunga",
        villages: [
          "Gatare",
          "Gihara",
          "Gituntu",
          "Kagarama",
          "Kigohe",
          "Mweya",
          "Nyamugari",
          "Uwarukara",
        ],
      },
      {
        name: "Kabirizi",
        villages: [
          "Cyahafi",
          "Gihimbi",
          "Kabuye",
          "Muhaga",
          "Nyagatovu",
          "Nyamabuye",
          "Nyaruvumu",
        ],
      },
      {
        name: "Kabuga",
        villages: [
          "Gatoki",
          "Mirehe",
          "Murandaryi",
          "Mwokora",
          "Nyamitobo",
          "Uwabushingwe",
          "Uwagisozi",
          "Uwimpura",
        ],
      },
      {
        name: "Kirambi",
        villages: [
          "Busenyeye",
          "Bweru",
          "Gasharu",
          "Gasiza",
          "Jarama",
          "Mpaza",
          "Murende",
          "Mwezi",
          "Rwankuba",
          "Rwimbazi",
        ],
      },
      {
        name: "Rurangazi",
        villages: [
          "Gashyenzi",
          "Kami",
          "Kigarama",
          "Musongati",
          "Nyamagana",
          "Nyarutovu",
          "Nyaruvumu",
          "Rugarama",
        ],
      },
    ],
  },
  {
    name: "Rwabicuma",
    cells: [
      {
        name: "Gacu",
        villages: ["Bisambu", "Gisake", "Karehe", "Nyamiyaga"],
      },
      {
        name: "Gishike",
        villages: [
          "Gakoni",
          "Gasiza A",
          "Gasiza B",
          "Karambo A",
          "Karambo B",
          "Karusimbi",
          "Rwamushumba",
        ],
      },
      {
        name: "Mubuga",
        villages: ["Kabisine", "Kadusenyi", "Karwiru", "Nyamiseke"],
      },
      {
        name: "Mushirarungu",
        villages: [
          "Kirwa",
          "Nyabubare",
          "Nyamivumu A",
          "Nyamuvumu B",
        ],
      },
      {
        name: "Nyarusange",
        villages: [
          "Cyarwa",
          "Kamushi",
          "Kamuvunyi A",
          "Kamuvunyi B",
          "Karambi",
          "Kavumu A",
          "Kavumu B",
        ],
      },
      {
        name: "Runga",
        villages: [
          "Kigarama",
          "Murambi",
          "Ndago",
          "Rugarama A",
          "Rugarama B",
        ],
      },
    ],
  },
];

// Helper functions
export function getSectorNames(): string[] {
  return NYANZA_SECTORS.map((s) => s.name);
}

export function getCellsBySector(sectorName: string): string[] {
  const sector = NYANZA_SECTORS.find(
    (s) => s.name.toLowerCase() === sectorName.toLowerCase()
  );
  return sector ? sector.cells.map((c) => c.name) : [];
}

export function getVillagesByCell(
  sectorName: string,
  cellName: string
): string[] {
  const sector = NYANZA_SECTORS.find(
    (s) => s.name.toLowerCase() === sectorName.toLowerCase()
  );
  if (!sector) return [];
  const cell = sector.cells.find(
    (c) => c.name.toLowerCase() === cellName.toLowerCase()
  );
  return cell ? cell.villages : [];
}

