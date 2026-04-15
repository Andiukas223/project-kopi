// ---------------------------------------------------------------------------
// All system roles. The full list drives the active workspace label,
// role-aware demo filtering, and the Admin permission grid.
// ---------------------------------------------------------------------------
export const roles = [
  { id: "service",   label: "Service workspace",    description: "Service engineers: create cases, log diagnostics/repair, upload signed documents." },
  { id: "svcmgr",   label: "Service Mgr workspace", description: "Service Manager: approves parts requests, assigns and controls engineers." },
  { id: "sales",     label: "Sales workspace",       description: "Sales: commercial offers, customer approval, and service handoff." },
  { id: "finance",   label: "Finance workspace",     description: "Finance: invoice register, uploaded invoice files, and payment status." },
  { id: "office",    label: "Office Mgr workspace",  description: "Office Manager: customer registry, contacts, calendar, case creation, reminders." },
  { id: "logistics", label: "Logistics workspace",   description: "Logistics Manager: parts delivery, vendor returns, logistics issue resolution." },
  { id: "warehouse", label: "Warehouse workspace",   description: "Warehouse: stock confirmation, parts arrival, inventory management." },
  { id: "manager",   label: "Manager workspace",     description: "Manager: read-only overview across all modules and reports." },
  { id: "admin",     label: "Admin workspace",       description: "Admin: full control, user permissions, workflow config, case close, contract archive management." }
];

// Permission definitions — used by the Admin page permission grid.
export const allPermissions = [
  { id: "createCase",       label: "Create service case" },
  { id: "viewAllDocs",      label: "View all documents" },
  { id: "approveParts",     label: "Approve parts requests" },
  { id: "manageContracts",  label: "Manage contracts" },
  { id: "viewAllCalendar",  label: "View all calendars" },
  { id: "assignWork",       label: "Assign work to users" },
  { id: "closeCases",       label: "Close and archive cases" },
  { id: "editArchivedDocs", label: "Edit archived documents" },
  { id: "generateInvoice",  label: "Generate and upload invoices" },
  { id: "configSystem",     label: "Configure system settings" }
];

// ---------------------------------------------------------------------------
// Users with role assignments and per-user permission overrides.
// ---------------------------------------------------------------------------
export const users = [
  {
    id: "u1",
    name: "Rokas Petrauskas",
    initials: "RP",
    roles: ["service"],
    permissions: {
      createCase: true,  viewAllDocs: false, approveParts: false, manageContracts: false,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u2",
    name: "Marius Vaitkus",
    initials: "MV",
    roles: ["service", "svcmgr"],
    permissions: {
      createCase: true,  viewAllDocs: true,  approveParts: true, manageContracts: false,
      viewAllCalendar: true, assignWork: true, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u3",
    name: "Aurelija Jankauske",
    initials: "AJ",
    roles: ["service"],
    permissions: {
      createCase: true,  viewAllDocs: false, approveParts: false, manageContracts: false,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u4",
    name: "Vita Klimaite",
    initials: "VK",
    roles: ["sales", "finance"],
    permissions: {
      createCase: false, viewAllDocs: true,  approveParts: false, manageContracts: true,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: true, configSystem: false
    }
  },
  {
    id: "u5",
    name: "Ingrida Mazure",
    initials: "IM",
    roles: ["office"],
    permissions: {
      createCase: true,  viewAllDocs: true,  approveParts: false, manageContracts: false,
      viewAllCalendar: true, assignWork: true, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u6",
    name: "Tomas Gruodis",
    initials: "TG",
    roles: ["logistics", "warehouse"],
    permissions: {
      createCase: false, viewAllDocs: false, approveParts: false, manageContracts: false,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u7",
    name: "Andrejus Lomovas",
    initials: "AL",
    roles: ["admin"],
    permissions: {
      createCase: true,  viewAllDocs: true,  approveParts: true, manageContracts: true,
      viewAllCalendar: true, assignWork: true, closeCases: true, editArchivedDocs: true,
      generateInvoice: true, configSystem: true
    }
  }
];

// ---------------------------------------------------------------------------
// Bug / feedback reports captured from the live UI.
// Loaded from document-service feedback backend; visible only to active admin role.
// ---------------------------------------------------------------------------
export const bugReports = [];

// ---------------------------------------------------------------------------
// Company profiles used by document generation.
// Viva Medical details are sourced from Rekvizitai.lt on 2026-04-14:
// https://rekvizitai.vz.lt/en/company/viva_medical/
// ---------------------------------------------------------------------------
export const companyProfiles = [
  {
    id: "seller-viva-medical",
    name: "Viva Medical, UAB",
    displayName: "Viva Medical",
    registrationCode: "302820861",
    vatCode: "LT100007018811",
    shareCapital: "2 896 EUR",
    address: "Santariskiu g. 5, LT-08406 Vilnius",
    phone: "+370 699 32161",
    website: "http://www.vivamedical.lt/",
    bankName: "",
    bankAccount: "",
    source: "Rekvizitai.lt / UAB Verslo zinios",
    sourceUrl: "https://rekvizitai.vz.lt/en/company/viva_medical/",
    verifiedAt: "2026-04-14"
  }
];

// ---------------------------------------------------------------------------
// Representative hospital sample registry for document layout/testing.
// Names are taken from a Ministry of Health published hospital list, but
// registry codes and VAT fields below are intentionally demo placeholders
// until each institution is verified against Rekvizitai.lt or official pages.
// Source list:
// https://sam.lrv.lt/en/cooperation/lithuanian-swiss-cooperation-programme-financial-support-for-the-health-sector/lithuanian-hospitals-participating-in-the-programme/
// ---------------------------------------------------------------------------
export const hospitalRequisiteSamples = [
  {
    id: "CUST-SAM-01",
    name: "Alytus Region S. Kudirkos hospital",
    shortCode: "ALY",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.alytus@example.test",
    phone: "+370 000 10001",
    address: "Demo address 1, LT-00001 Alytus",
    legalName: "Alytus Region S. Kudirkos hospital",
    companyCode: "DEMO-200001",
    vatCode: "DEMO-LT200001",
    documentAddress: "Demo address 1, LT-00001 Alytus",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0001",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 1,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-02",
    name: "Jonava hospital",
    shortCode: "JON",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.jonava@example.test",
    phone: "+370 000 10002",
    address: "Demo address 2, LT-00002 Jonava",
    legalName: "Jonava hospital",
    companyCode: "DEMO-200002",
    vatCode: "DEMO-LT200002",
    documentAddress: "Demo address 2, LT-00002 Jonava",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0002",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 2,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-03",
    name: "Kaunas Clinical hospital",
    shortCode: "KCH",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.kaunas-clinical@example.test",
    phone: "+370 000 10003",
    address: "Demo address 3, LT-00003 Kaunas",
    legalName: "Kaunas Clinical hospital",
    companyCode: "DEMO-200003",
    vatCode: "DEMO-LT200003",
    documentAddress: "Demo address 3, LT-00003 Kaunas",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0003",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 3,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-04",
    name: "Kedainiai hospital",
    shortCode: "KED",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.kedainiai@example.test",
    phone: "+370 000 10004",
    address: "Demo address 4, LT-00004 Kedainiai",
    legalName: "Kedainiai hospital",
    companyCode: "DEMO-200004",
    vatCode: "DEMO-LT200004",
    documentAddress: "Demo address 4, LT-00004 Kedainiai",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0004",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 4,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-05",
    name: "Klaipeda University hospital",
    shortCode: "KUH",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.klaipeda-university@example.test",
    phone: "+370 000 10005",
    address: "Demo address 5, LT-00005 Klaipeda",
    legalName: "Klaipeda University hospital",
    companyCode: "DEMO-200005",
    vatCode: "DEMO-LT200005",
    documentAddress: "Demo address 5, LT-00005 Klaipeda",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0005",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 5,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-06",
    name: "Kaunas Republican hospital",
    shortCode: "KRH",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.kaunas-republican@example.test",
    phone: "+370 000 10006",
    address: "Demo address 6, LT-00006 Kaunas",
    legalName: "Kaunas Republican hospital",
    companyCode: "DEMO-200006",
    vatCode: "DEMO-LT200006",
    documentAddress: "Demo address 6, LT-00006 Kaunas",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0006",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 6,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-07",
    name: "Lithuanian Health Science University hospital Kaunas clinics",
    shortCode: "LSMU",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.lsmu@example.test",
    phone: "+370 000 10007",
    address: "Demo address 7, LT-00007 Kaunas",
    legalName: "Lithuanian Health Science University hospital Kaunas clinics",
    companyCode: "DEMO-200007",
    vatCode: "DEMO-LT200007",
    documentAddress: "Demo address 7, LT-00007 Kaunas",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0007",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 7,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-08",
    name: "Marijampole hospital",
    shortCode: "MAR",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.marijampole@example.test",
    phone: "+370 000 10008",
    address: "Demo address 8, LT-00008 Marijampole",
    legalName: "Marijampole hospital",
    companyCode: "DEMO-200008",
    vatCode: "DEMO-LT200008",
    documentAddress: "Demo address 8, LT-00008 Marijampole",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0008",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 8,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-09",
    name: "Mazeikiai hospital",
    shortCode: "MAZ",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.mazeikiai@example.test",
    phone: "+370 000 10009",
    address: "Demo address 9, LT-00009 Mazeikiai",
    legalName: "Mazeikiai hospital",
    companyCode: "DEMO-200009",
    vatCode: "DEMO-LT200009",
    documentAddress: "Demo address 9, LT-00009 Mazeikiai",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0009",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 9,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-10",
    name: "P. Mazylis Maternity home",
    shortCode: "MAZYLIS",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.mazylis@example.test",
    phone: "+370 000 10010",
    address: "Demo address 10, LT-00010 Kaunas",
    legalName: "P. Mazylis Maternity home",
    companyCode: "DEMO-200010",
    vatCode: "DEMO-LT200010",
    documentAddress: "Demo address 10, LT-00010 Kaunas",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0010",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 10,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-11",
    name: "Pasvalys hospital",
    shortCode: "PAS",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.pasvalys@example.test",
    phone: "+370 000 10011",
    address: "Demo address 11, LT-00011 Pasvalys",
    legalName: "Pasvalys hospital",
    companyCode: "DEMO-200011",
    vatCode: "DEMO-LT200011",
    documentAddress: "Demo address 11, LT-00011 Pasvalys",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0011",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 11,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-12",
    name: "Raseiniai hospital",
    shortCode: "RAS",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.raseiniai@example.test",
    phone: "+370 000 10012",
    address: "Demo address 12, LT-00012 Raseiniai",
    legalName: "Raseiniai hospital",
    companyCode: "DEMO-200012",
    vatCode: "DEMO-LT200012",
    documentAddress: "Demo address 12, LT-00012 Raseiniai",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0012",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 12,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-13",
    name: "Panevezys Republican hospital",
    shortCode: "PAN",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.panevezys@example.test",
    phone: "+370 000 10013",
    address: "Demo address 13, LT-00013 Panevezys",
    legalName: "Panevezys Republican hospital",
    companyCode: "DEMO-200013",
    vatCode: "DEMO-LT200013",
    documentAddress: "Demo address 13, LT-00013 Panevezys",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0013",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 13,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-14",
    name: "Siauliai Republican hospital",
    shortCode: "SIA",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.siauliai@example.test",
    phone: "+370 000 10014",
    address: "Demo address 14, LT-00014 Siauliai",
    legalName: "Siauliai Republican hospital",
    companyCode: "DEMO-200014",
    vatCode: "DEMO-LT200014",
    documentAddress: "Demo address 14, LT-00014 Siauliai",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0014",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 14,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-15",
    name: "Silute hospital",
    shortCode: "SIL",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.silute@example.test",
    phone: "+370 000 10015",
    address: "Demo address 15, LT-00015 Silute",
    legalName: "Silute hospital",
    companyCode: "DEMO-200015",
    vatCode: "DEMO-LT200015",
    documentAddress: "Demo address 15, LT-00015 Silute",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0015",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 15,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-16",
    name: "Rokiskis hospital",
    shortCode: "ROK",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.rokiskis@example.test",
    phone: "+370 000 10016",
    address: "Demo address 16, LT-00016 Rokiskis",
    legalName: "Rokiskis hospital",
    companyCode: "DEMO-200016",
    vatCode: "DEMO-LT200016",
    documentAddress: "Demo address 16, LT-00016 Rokiskis",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0016",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 16,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-17",
    name: "Telsiai Regional hospital",
    shortCode: "TEL",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.telsiai@example.test",
    phone: "+370 000 10017",
    address: "Demo address 17, LT-00017 Telsiai",
    legalName: "Telsiai Regional hospital",
    companyCode: "DEMO-200017",
    vatCode: "DEMO-LT200017",
    documentAddress: "Demo address 17, LT-00017 Telsiai",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0017",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 17,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-18",
    name: "Taurage hospital",
    shortCode: "TAU",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.taurage@example.test",
    phone: "+370 000 10018",
    address: "Demo address 18, LT-00018 Taurage",
    legalName: "Taurage hospital",
    companyCode: "DEMO-200018",
    vatCode: "DEMO-LT200018",
    documentAddress: "Demo address 18, LT-00018 Taurage",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0018",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 18,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-19",
    name: "Trakai hospital",
    shortCode: "TRA",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.trakai@example.test",
    phone: "+370 000 10019",
    address: "Demo address 19, LT-00019 Trakai",
    legalName: "Trakai hospital",
    companyCode: "DEMO-200019",
    vatCode: "DEMO-LT200019",
    documentAddress: "Demo address 19, LT-00019 Trakai",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0019",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 19,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  },
  {
    id: "CUST-SAM-20",
    name: "Ukmerge hospital",
    shortCode: "UKM",
    type: "Hospital",
    contact: "Biomedicine team",
    contactRole: "Biomedical Engineering",
    email: "biomed.ukmerge@example.test",
    phone: "+370 000 10020",
    address: "Demo address 20, LT-00020 Ukmerge",
    legalName: "Ukmerge hospital",
    companyCode: "DEMO-200020",
    vatCode: "DEMO-LT200020",
    documentAddress: "Demo address 20, LT-00020 Ukmerge",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 0020",
    requisitesStatus: "demo-placeholder",
    sourceOrder: 20,
    openJobs: 0,
    equipmentCount: 0,
    outstandingDocs: 0,
    activeContracts: 0
  }
];

// ---------------------------------------------------------------------------
// Customers — hospitals, clinics, and private medical institutions.
// ---------------------------------------------------------------------------
export const customers = [
  {
    id: "CUST-01",
    name: "Vilnius Clinical Hospital",
    shortCode: "VCH",
    type: "Hospital",
    contact: "Jonas Kazlauskas",
    contactRole: "Biomedical Engineer",
    email: "j.kazlauskas@vch.lt",
    phone: "+370 5 236 5555",
    address: "Šiltnamių g. 29, LT-04130 Vilnius",
    legalName: "Vilnius Clinical Hospital",
    companyCode: "DEMO-100001",
    vatCode: "DEMO-LT100001",
    documentAddress: "Šiltnamių g. 29, LT-04130 Vilnius",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 1001",
    requisitesStatus: "demo-placeholder",
    openJobs: 3,
    equipmentCount: 5,
    outstandingDocs: 2,
    activeContracts: 2
  },
  {
    id: "CUST-02",
    name: "Baltic Cardio Center",
    shortCode: "BCC",
    type: "Clinic",
    contact: "Rima Vaitkiene",
    contactRole: "Technical Manager",
    email: "r.vaitkiene@bcc.lt",
    phone: "+370 5 250 0100",
    address: "Pamenkalnio g. 5, LT-01114 Vilnius",
    legalName: "Baltic Cardio Center",
    companyCode: "DEMO-100002",
    vatCode: "DEMO-LT100002",
    documentAddress: "Pamenkalnio g. 5, LT-01114 Vilnius",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 1002",
    requisitesStatus: "demo-placeholder",
    openJobs: 1,
    equipmentCount: 2,
    outstandingDocs: 1,
    activeContracts: 1
  },
  {
    id: "CUST-03",
    name: "Kaunas Diagnostics",
    shortCode: "KDX",
    type: "Diagnostics Center",
    contact: "Arturas Jonaitis",
    contactRole: "IT Administrator",
    email: "a.jonaitis@kdx.lt",
    phone: "+370 37 321 000",
    address: "Jonavos g. 2, LT-44192 Kaunas",
    legalName: "Kaunas Diagnostics",
    companyCode: "DEMO-100003",
    vatCode: "DEMO-LT100003",
    documentAddress: "Jonavos g. 2, LT-44192 Kaunas",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 1003",
    requisitesStatus: "demo-placeholder",
    openJobs: 1,
    equipmentCount: 3,
    outstandingDocs: 1,
    activeContracts: 1
  },
  {
    id: "CUST-04",
    name: "Northway Clinic",
    shortCode: "NWC",
    type: "Private Clinic",
    contact: "Laura Bakiene",
    contactRole: "Equipment Coordinator",
    email: "l.bakiene@northway.lt",
    phone: "+370 5 264 4466",
    address: "Visorių g. 1, LT-08300 Vilnius",
    legalName: "Northway Clinic",
    companyCode: "DEMO-100004",
    vatCode: "DEMO-LT100004",
    documentAddress: "Visorių g. 1, LT-08300 Vilnius",
    bankName: "Demo bank",
    bankAccount: "LT00 0000 0000 0000 1004",
    requisitesStatus: "demo-placeholder",
    openJobs: 1,
    equipmentCount: 2,
    outstandingDocs: 1,
    activeContracts: 1
  },
  ...hospitalRequisiteSamples
];

// ---------------------------------------------------------------------------
// Installed systems (equipment). One record per physical unit.
// supportEnabled drives the Support Portal feature — when true, unique URLs
// are generated for hospital staff to report faults without logging in.
// ---------------------------------------------------------------------------
export const equipment = [
  {
    id: "EQ-501",
    name: "ARIETTA 850 DeepInsight",
    manufacturer: "GE Healthcare",
    category: "Ultrasound",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    serial: "US-850-0192",
    partNumber: "US-850-PN-01",
    idGE: "GE-0192",
    location: "Radiology Dept, Room 204",
    installedDate: "2024-03-15",
    yearOfManufacture: "2023",
    sellerInvoice: "INV-2024-0312",
    warrantyEndManufacturer: "2027-03-15",
    warrantyEndHospital: "2026-03-15",
    acceptanceDate: "2024-03-20",
    acceptanceInvoice: "ACC-2024-0320",
    status: "Under service",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "VCH Radiology",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "support@gehealthcare.com",
      hospital: "biomed@vch.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/US-850-0192",
      hospital: "https://support.vivamedical.lt/h/vch",
      group: "https://support.vivamedical.lt/g/vch-radiology"
    }
  },
  {
    id: "EQ-502",
    name: "WASSENBURG WD440 Endoscope Washer",
    manufacturer: "Wassenburg Medical",
    category: "Endoscopy",
    customer: "Kaunas Diagnostics",
    customerId: "CUST-03",
    serial: "WB-7720",
    partNumber: "WD440-PN-03",
    idGE: "",
    location: "Endoscopy Unit, Floor 2",
    installedDate: "2023-07-10",
    yearOfManufacture: "2023",
    sellerInvoice: "INV-2023-0710",
    warrantyEndManufacturer: "2026-07-10",
    warrantyEndHospital: "2025-07-10",
    acceptanceDate: "2023-07-15",
    acceptanceInvoice: "ACC-2023-0715",
    status: "Parts pending",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "KDX Endoscopy",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "service@wassenburg.com",
      hospital: "tech@kdx.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/WB-7720",
      hospital: "https://support.vivamedical.lt/h/kdx",
      group: "https://support.vivamedical.lt/g/kdx-endoscopy"
    }
  },
  {
    id: "EQ-503",
    name: "ARJO Maxi Move Patient Lift",
    manufacturer: "ARJO",
    category: "Patient Handling",
    customer: "Northway Clinic",
    customerId: "CUST-04",
    serial: "ARJ-2190",
    partNumber: "ARJO-MM-PN",
    idGE: "",
    location: "Rehabilitation Ward",
    installedDate: "2022-11-01",
    yearOfManufacture: "2022",
    sellerInvoice: "INV-2022-1101",
    warrantyEndManufacturer: "2025-11-01",
    warrantyEndHospital: "2024-11-01",
    acceptanceDate: "2022-11-05",
    acceptanceInvoice: "ACC-2022-1105",
    status: "Final check",
    isDemo: false,
    isOutdated: false,
    supportEnabled: false,
    supportGroupName: "",
    supportEmails: { company: "", manufacturer: "", hospital: "" },
    webLinks: { system: "", hospital: "", group: "" }
  },
  {
    id: "EQ-504",
    name: "COR-KNOT Device",
    manufacturer: "LSI Solutions",
    category: "Cardiac Surgery",
    customer: "Baltic Cardio Center",
    customerId: "CUST-02",
    serial: "CK-4418",
    partNumber: "CK-PN-4418",
    idGE: "",
    location: "OR Suite 1",
    installedDate: "2025-01-20",
    yearOfManufacture: "2024",
    sellerInvoice: "INV-2025-0120",
    warrantyEndManufacturer: "2028-01-20",
    warrantyEndHospital: "2027-01-20",
    acceptanceDate: "2025-01-22",
    acceptanceInvoice: "ACC-2025-0122",
    status: "Active",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "BCC Cardiac",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "support@lsisolutions.com",
      hospital: "tech@bcc.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/CK-4418",
      hospital: "https://support.vivamedical.lt/h/bcc",
      group: "https://support.vivamedical.lt/g/bcc-cardiac"
    }
  },
  {
    id: "EQ-505",
    name: "ARIETTA 750 BioSound",
    manufacturer: "GE Healthcare",
    category: "Ultrasound",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    serial: "US-750-0041",
    partNumber: "US-750-PN-01",
    idGE: "GE-0041",
    location: "Cardiology Dept, Room 108",
    installedDate: "2023-09-01",
    yearOfManufacture: "2023",
    sellerInvoice: "INV-2023-0901",
    warrantyEndManufacturer: "2026-09-01",
    warrantyEndHospital: "2025-09-01",
    acceptanceDate: "2023-09-05",
    acceptanceInvoice: "ACC-2023-0905",
    status: "Active",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "VCH Radiology",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "support@gehealthcare.com",
      hospital: "biomed@vch.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/US-750-0041",
      hospital: "https://support.vivamedical.lt/h/vch",
      group: "https://support.vivamedical.lt/g/vch-radiology"
    }
  }
];

// ---------------------------------------------------------------------------
// Service contracts. Each repair on a service contract deducts from
// the remaining balance. The system warns when repair cost exceeds remaining.
// ---------------------------------------------------------------------------
export const contracts = [
  {
    id: "CTR-101",
    type: "Service",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    equipment: "ARIETTA 850 DeepInsight",
    equipmentId: "EQ-501",
    value: 45000,
    consumed: 6500,
    remaining: 38500,
    currency: "EUR",
    start: "2025-01-01",
    end: "2027-12-31",
    status: "Active",
    pmPerYear: 2,
    notes: "Covers preventive maintenance and repairs. Parts not included above agreed threshold."
  },
  {
    id: "CTR-102",
    type: "PM",
    customer: "Kaunas Diagnostics",
    customerId: "CUST-03",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    equipmentId: "EQ-502",
    value: 8000,
    consumed: 2000,
    remaining: 6000,
    currency: "EUR",
    start: "2025-04-01",
    end: "2026-03-31",
    status: "Active",
    pmPerYear: 4,
    notes: "Quarterly preventive maintenance. Emergency call-outs billed separately."
  },
  {
    id: "CTR-103",
    type: "Service",
    customer: "Baltic Cardio Center",
    customerId: "CUST-02",
    equipment: "COR-KNOT Device",
    equipmentId: "EQ-504",
    value: 12000,
    consumed: 0,
    remaining: 12000,
    currency: "EUR",
    start: "2025-02-01",
    end: "2026-01-31",
    status: "Active",
    pmPerYear: 2,
    notes: "Full service coverage including parts replacement up to €3,000 per incident."
  }
];

// ---------------------------------------------------------------------------
// Sales quotations / commercial offers.
// Pipeline: Draft → Sent → Awaiting approval → Approved → Handed off
//           (or Rejected at any point after Sent)
// ---------------------------------------------------------------------------
export const quotations = [
  {
    id: "QTE-501",
    customer: "Baltic Cardio Center",
    customerId: "CUST-02",
    equipment: "COR-KNOT Device",
    equipmentId: "EQ-504",
    type: "Repair",
    amount: 4200,
    currency: "EUR",
    status: "Awaiting approval",
    created: "2026-04-08",
    due: "2026-04-18",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    notes: "Parts and labor for COR-KNOT calibration and seal replacement. Site visit included.",
    approvalDate: null,
    approvalContact: "Rima Vaitkiene",
    contractScope: "",
    warrantyStart: "",
    warrantyEnd: "",
    pmPerYear: 0,
    contractId: null,
    handedOffJobId: null
  },
  {
    id: "QTE-502",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    equipment: "ARIETTA 850 DeepInsight",
    equipmentId: "EQ-501",
    type: "PM Contract",
    amount: 18500,
    currency: "EUR",
    status: "Draft",
    created: "2026-04-10",
    due: "2026-04-25",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    notes: "Annual PM contract renewal. 2 visits per year, parts not included above threshold.",
    approvalDate: null,
    approvalContact: "Jonas Kazlauskas",
    contractScope: "Preventive maintenance 2×/year. Emergency call-outs billed separately.",
    warrantyStart: "2026-05-01",
    warrantyEnd: "2027-04-30",
    pmPerYear: 2,
    contractId: null,
    handedOffJobId: null
  },
  {
    id: "QTE-503",
    customer: "Northway Clinic",
    customerId: "CUST-04",
    equipment: "ARJO Maxi Move Patient Lift",
    equipmentId: "EQ-503",
    type: "Installation",
    amount: 32000,
    currency: "EUR",
    status: "Approved",
    created: "2026-03-20",
    due: "2026-04-30",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    notes: "New unit installation including acceptance protocol and warranty registration.",
    approvalDate: "2026-04-02",
    approvalContact: "Marta Stonkiene",
    contractScope: "Full installation and commissioning. Acceptance act required before warranty start.",
    warrantyStart: "2026-05-15",
    warrantyEnd: "2028-05-14",
    pmPerYear: 0,
    contractId: "CTR-103",
    handedOffJobId: null
  },
  {
    id: "QTE-504",
    customer: "Kaunas Diagnostics",
    customerId: "CUST-03",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    equipmentId: "EQ-502",
    type: "Repair",
    amount: 1850,
    currency: "EUR",
    status: "Handed off",
    created: "2026-03-15",
    due: "2026-03-28",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    notes: "Valve assembly replacement. Parts under partial warranty coverage.",
    approvalDate: "2026-03-22",
    approvalContact: "Arturas Jonaitis",
    contractScope: "",
    warrantyStart: "",
    warrantyEnd: "",
    pmPerYear: 0,
    contractId: null,
    handedOffJobId: "VM-SV-1026"
  }
];

// ---------------------------------------------------------------------------
// Parts requests. Flows from Engineer → Service Manager approval →
// Logistics/Warehouse fulfillment → delivery decision → repair proceeds.
// ---------------------------------------------------------------------------
export const partsRequests = [
  {
    id: "PR-201",
    jobId: "VM-SV-1026",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    part: "Valve assembly VAL-7720",
    partNumber: "WD-VAL-7720",
    quantity: 1,
    description: "Main inlet valve leaking during wash cycle. Needs immediate replacement to unblock repair.",
    status: "Pending approval",
    requestedBy: "A. Jankauske",
    approvedBy: null,
    edd: "2026-04-20",
    delivery: null,
    deliveryAddress: null,
    deliveryContact: null
  },
  {
    id: "PR-202",
    jobId: "VM-SV-1024",
    equipment: "ARIETTA 850 DeepInsight",
    part: "Transducer cable C1-5-D",
    partNumber: "GE-C1-5D-CBL",
    quantity: 1,
    description: "Transducer cable damaged during diagnostics check. System cannot complete scan.",
    status: "Approved",
    requestedBy: "R. Petrauskas",
    approvedBy: "M. Vaitkus",
    edd: "2026-04-18",
    delivery: null,
    deliveryAddress: null,
    deliveryContact: null
  },
  {
    id: "PR-203",
    jobId: "VM-SV-1025",
    equipment: "COR-KNOT Device",
    part: "Actuator spring set AS-CK4",
    partNumber: "CK-SPRING-SET",
    quantity: 2,
    description: "Springs worn after extended use. Required for quotation repair scope.",
    status: "In transit",
    requestedBy: "M. Vaitkus",
    approvedBy: "M. Vaitkus",
    edd: "2026-04-16",
    delivery: "Deliver to site",
    deliveryAddress: "Pamenkalnio g. 5, LT-01114 Vilnius",
    deliveryContact: "Rima Vaitkiene — +370 5 250 0100"
  },
  {
    id: "PR-204",
    jobId: "VM-SV-1027",
    equipment: "ARJO Maxi Move Patient Lift",
    part: "Battery pack ARJO-BP-220",
    partNumber: "ARJO-BP-220",
    quantity: 1,
    description: "Battery degraded, lift cannot hold charge for full session.",
    status: "Arrived at warehouse",
    requestedBy: "R. Petrauskas",
    approvedBy: "M. Vaitkus",
    edd: "2026-04-13",
    delivery: null,
    deliveryAddress: null,
    deliveryContact: null
  }
];

// ---------------------------------------------------------------------------
// Vendor return cases created from Parts requests / repair exchange handling.
// ---------------------------------------------------------------------------
export const vendorReturns = [];

// ---------------------------------------------------------------------------
// Service jobs
// ---------------------------------------------------------------------------
export const jobs = [
  {
    id: "VM-SV-1024",
    customer: "Vilnius Clinical Hospital",
    equipment: "ARIETTA 850 DeepInsight",
    serial: "US-850-0192",
    owner: "R. Petrauskas",
    priority: "High",
    stage: "Diagnostics",
    status: "Open",
    due: "2026-04-15",
    documentStatus: "Draft"
  },
  {
    id: "VM-SV-1025",
    customer: "Baltic Cardio Center",
    equipment: "COR-KNOT Device",
    serial: "CK-4418",
    owner: "M. Vaitkus",
    priority: "Normal",
    stage: "Waiting for quotation",
    status: "Pending",
    due: "2026-04-17",
    documentStatus: "Review"
  },
  {
    id: "VM-SV-1026",
    customer: "Kaunas Diagnostics",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    serial: "WB-7720",
    owner: "A. Jankauske",
    priority: "High",
    stage: "Parts pending",
    status: "Blocked",
    due: "2026-04-14",
    documentStatus: "Customer"
  },
  {
    id: "VM-SV-1027",
    customer: "Northway Clinic",
    equipment: "ARJO Maxi Move Patient Lift",
    serial: "ARJ-2190",
    owner: "R. Petrauskas",
    priority: "Normal",
    stage: "Final documents",
    status: "Open",
    due: "2026-04-19",
    documentStatus: "Signature"
  }
];

// ---------------------------------------------------------------------------
// Documents pipeline
// ---------------------------------------------------------------------------
export const documents = [
  {
    id: "DOC-3108",
    type: "Service act",
    jobId: "VM-SV-1024",
    customer: "Vilnius Clinical Hospital",
    owner: "Service",
    createdBy: "Rokas Petrauskas",
    createdByInitials: "RP",
    status: "Draft",
    due: "2026-04-15",
    pipelineStep: "Draft"
  },
  {
    id: "DOC-3109",
    type: "Quotation",
    jobId: "VM-SV-1025",
    customer: "Baltic Cardio Center",
    owner: "Sales",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    status: "Review",
    due: "2026-04-11",
    pipelineStep: "Review"
  },
  {
    id: "DOC-3110",
    type: "Parts request",
    jobId: "VM-SV-1026",
    customer: "Kaunas Diagnostics",
    owner: "Service",
    createdBy: "Rokas Petrauskas",
    createdByInitials: "RP",
    status: "Customer",
    due: "2026-04-10",
    pipelineStep: "Customer"
  },
  {
    id: "DOC-3111",
    type: "Acceptance report",
    jobId: "VM-SV-1027",
    customer: "Northway Clinic",
    owner: "Admin",
    createdBy: "Andrejus Lomovas",
    createdByInitials: "AL",
    status: "Signature",
    due: "2026-04-19",
    pipelineStep: "Signature"
  }
];

// ---------------------------------------------------------------------------
// Finance invoices. Finance owns invoice generation/upload and payment status.
// ---------------------------------------------------------------------------
export const invoices = [
  {
    id: "INV-9001",
    jobId: "VM-SV-1024",
    documentId: null,
    customer: "Vilnius Clinical Hospital",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    amount: 1250,
    currency: "EUR",
    invoiceNo: null,
    status: "Draft",
    paymentStatus: "Pending",
    due: "2026-04-22",
    generatedAt: null,
    notes: "Diagnostics and initial corrective work. Generate invoice after service act review."
  },
  {
    id: "INV-9002",
    jobId: "VM-SV-1026",
    documentId: "DOC-3110",
    customer: "Kaunas Diagnostics",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    amount: 1850,
    currency: "EUR",
    invoiceNo: "VM-2026-0410",
    status: "Generated",
    paymentStatus: "Pending",
    due: "2026-04-20",
    generatedAt: "2026-04-10",
    notes: "Valve assembly replacement pending customer payment."
  },
  {
    id: "INV-9003",
    jobId: "VM-SV-1027",
    documentId: "DOC-3111",
    customer: "Northway Clinic",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    amount: 32000,
    currency: "EUR",
    invoiceNo: "VM-2026-0328",
    status: "Generated",
    paymentStatus: "Paid",
    due: "2026-04-12",
    generatedAt: "2026-03-28",
    notes: "Installation invoice paid. Acceptance report waiting for signature."
  },
  {
    id: "INV-9004",
    jobId: "VM-SV-1025",
    documentId: null,
    customer: "Baltic Cardio Center",
    owner: "V. Klimaite",
    createdBy: "Vita Klimaite",
    createdByInitials: "VK",
    amount: 4200,
    currency: "EUR",
    invoiceNo: null,
    status: "Draft",
    paymentStatus: "Cancelled",
    due: "2026-04-18",
    generatedAt: null,
    notes: "Customer requested revised quotation before invoicing."
  }
];

// ---------------------------------------------------------------------------
// Document templates (Carbone mock; real generation is backend phase 4B)
// ---------------------------------------------------------------------------
export const templates = [
  {
    id: "tpl-service-act",
    name: "Service act",
    format: "ODT/DOCX/PDF",
    owner: "Service",
    body: "Work act for service visits. Include customer, equipment, serial number, work performed, parts used, duration, engineer, and customer signature.",
    defaultBody: "Work act for service visits. Include customer, equipment, serial number, work performed, parts used, duration, engineer, and customer signature."
  },
  {
    id: "tpl-diagnostic",
    name: "Diagnostic report",
    format: "ODT/DOCX/PDF",
    owner: "Service",
    body: "Diagnostic report for technical cases. Include reported symptom, inspection notes, root cause, recommended action, risk level, and diagnosing engineer.",
    defaultBody: "Diagnostic report for technical cases. Include reported symptom, inspection notes, root cause, recommended action, risk level, and diagnosing engineer."
  },
  {
    id: "tpl-quotation",
    name: "Commercial offer",
    format: "DOCX/PDF",
    owner: "Sales",
    body: "Commercial offer for service, parts, PM contract, or installation. Include scope, equipment, price, validity date, payment terms, and approval signature.",
    defaultBody: "Commercial offer for service, parts, PM contract, or installation. Include scope, equipment, price, validity date, payment terms, and approval signature."
  },
  {
    id: "tpl-defect-act",
    name: "Defect act",
    format: "ODT/DOCX/PDF",
    owner: "Service",
    body: "Defect act for equipment findings. Include customer, equipment, serial number, reported defect, engineer findings, recommended correction, and customer acknowledgement.",
    defaultBody: "Defect act for equipment findings. Include customer, equipment, serial number, reported defect, engineer findings, recommended correction, and customer acknowledgement."
  },
  {
    id: "tpl-acceptance",
    name: "Acceptance report",
    format: "ODT/PDF",
    owner: "Admin",
    body: "Installation acceptance report. Include installed equipment, serial number, installation date, acceptance criteria, training confirmation, and warranty start.",
    defaultBody: "Installation acceptance report. Include installed equipment, serial number, installation date, acceptance criteria, training confirmation, and warranty start."
  },
  {
    id: "tpl-vendor-return",
    name: "Vendor return note",
    format: "DOCX/PDF",
    owner: "Service",
    body: "Vendor return note for defective or incorrect parts. Include part number, description, job reference, reason for return, destination, and authorisation.",
    defaultBody: "Vendor return note for defective or incorrect parts. Include part number, description, job reference, reason for return, destination, and authorisation."
  },
  {
    id: "tpl-generic-document",
    name: "Generic document",
    format: "ODT/DOCX/PDF",
    owner: "Admin",
    body: "General document layout for records that do not yet have a dedicated output layout. Include document type, reference, customer, owner, notes, and delivery state.",
    defaultBody: "General document layout for records that do not yet have a dedicated output layout. Include document type, reference, customer, owner, notes, and delivery state."
  }
];

export const documentTemplateBlueprints = {
  "tpl-service-act": {
    title: "Work Act editor",
    mergeFields: ["documentId", "workActNumber", "documentDateLt", "sellerDisplayName", "sellerRequisitesText", "buyerName", "buyerCompanyCode", "buyerVatCode", "buyerAddress", "buyerRequisitesText", "contractNumber", "workLocation", "contact", "jobId", "equipmentItemsText", "notes", "workActRowsText", "reportOptionsText", "owner"],
    sections: [
      {
        id: "header",
        label: "Header",
        value: "{d.sellerDisplayName}\n{d.sellerRequisitesText}\n\nATLIKTU DARBU AKTAS Nr. {d.workActNumber}\n{d.documentDateLt}\nSutartis nr. {d.contractNumber}"
      },
      {
        id: "customer",
        label: "Customer block",
        value: "UZSAKOVAS: {d.buyerName}\nIm. kodas: {d.buyerCompanyCode}\nPVM kodas: {d.buyerVatCode}\nDarbu atlikimo vieta: {d.workLocation}\nKontaktas: {d.contact}"
      },
      {
        id: "equipment",
        label: "Equipment block",
        value: "Susijes darbas: {d.jobId}\nIranga:\n{d.equipmentItemsText}"
      },
      {
        id: "work",
        label: "Work block",
        value: "Atlikti darbai:\n{d.notes}\n\nDarbu sarasas:\n{d.workActRowsText}"
      },
      {
        id: "signatures",
        label: "Signatures",
        value: "Atsakingas inzinierius: ________________________________\nKliento atstovas: ________________________________"
      }
    ]
  },
  "tpl-quotation": {
    title: "Commercial Offer editor",
    mergeFields: ["documentId", "documentDateLt", "sellerDisplayName", "sellerRequisitesText", "buyerName", "buyerCompanyCode", "buyerVatCode", "buyerAddress", "buyerRequisitesText", "contractNumber", "contact", "jobId", "equipment", "serial", "notes", "quotationAmount", "quotationDue", "owner", "commercialOfferNumber", "commercialOfferHeaderText", "commercialOfferFooterText", "commercialOfferScopeText", "commercialOfferRecipient", "commercialOfferContract", "commercialOfferInvoiceId"],
    sections: [
      {
        id: "header",
        label: "Header",
        value: "{d.sellerDisplayName}\n{d.sellerRequisitesText}\n\nKOMERCINIS PASIULYMAS Nr. {d.commercialOfferNumber}\n{d.documentDateLt}\nSutartis nr. {d.contractNumber}"
      },
      {
        id: "customer",
        label: "Customer block",
        value: "PIRKEJAS: {d.buyerName}\nIm. kodas: {d.buyerCompanyCode}\nPVM kodas: {d.buyerVatCode}\nAdresas: {d.buyerAddress}\nKontaktas: {d.contact}"
      },
      {
        id: "scope",
        label: "Scope",
        value: "Susijes darbas: {d.jobId}\nIranga: {d.equipment}\nSerijos Nr.: {d.serial}\n\nApimtis:\n{d.notes}"
      },
      {
        id: "terms",
        label: "Price and terms",
        value: "Suma: {d.quotationAmount}\nGalioja iki: {d.quotationDue}"
      },
      {
        id: "signatures",
        label: "Signatures",
        value: "Parenge: ________________________________\nKliento patvirtinimas: ________________________________"
      }
    ]
  },
  "tpl-defect-act": {
    title: "Defect Act editor",
    mergeFields: ["documentId", "documentDateLt", "sellerDisplayName", "sellerRequisitesText", "buyerName", "buyerCompanyCode", "buyerVatCode", "buyerAddress", "buyerRequisitesText", "contractNumber", "workLocation", "contact", "jobId", "equipment", "serial", "defectDescription", "defectActVisitsText", "owner"],
    sections: [
      {
        id: "header",
        label: "Header",
        value: "{d.sellerDisplayName}\n{d.sellerRequisitesText}\n\nDEFEKTINIS AKTAS Nr. {d.documentId}\n{d.documentDateLt}\nSutartis nr. {d.contractNumber}"
      },
      {
        id: "customer",
        label: "Customer block",
        value: "UZSAKOVAS: {d.buyerName}\nIm. kodas: {d.buyerCompanyCode}\nPVM kodas: {d.buyerVatCode}\nDarbu atlikimo vieta: {d.workLocation}\nKontaktas: {d.contact}"
      },
      {
        id: "equipment",
        label: "Equipment block",
        value: "Susijes darbas: {d.jobId}\nIranga: {d.equipment}\nSerijos Nr.: {d.serial}"
      },
      {
        id: "defect",
        label: "Defect block",
        value: "Gedimo / defekto aprasymas:\n{d.defectDescription}"
      },
      {
        id: "signatures",
        label: "Signatures",
        value: "Atsakingas asmuo: ________________________________\nKliento atstovas: ________________________________"
      }
    ]
  }
};

// ---------------------------------------------------------------------------
// Templates copied into concrete Work Act drafts.
// These are equipment/procedure checklists, not final Carbone document layouts.
// ---------------------------------------------------------------------------
export const workListTemplates = [
  {
    id: "wlt-ultrasound-pm",
    name: "Ultrasound PM / technine prieziura",
    equipmentCategory: "Ultrasound",
    serviceType: "PM",
    linkedServiceTypes: ["PM"],
    linkedEquipmentIds: ["EQ-501", "EQ-505"],
    linkedHospitalIds: ["CUST-01"],
    linkedWorkEquipmentIds: ["ultrasound-probes", "printer-export"],
    entryPerson: "Rokas Petrauskas",
    entryDate: "2026-04-13",
    language: "lt",
    bodyText: "Technines prieziuros metu atlikti ultragarso sistemos patikrinimai.",
    workRows: [
      "Vizualiai patikrintas aparatas, laidai, davikliai ir maitinimo kabeliai.",
      "Isvalytas aparatas, oro filtrai ir isoriniai pavirsiai.",
      "Patikrintas sistemos uzsikrovimas, data/laikas ir klaidu pranesimai.",
      "Patikrintas vaizdo gavimas su turimais davikliais.",
      "Patikrintas spausdintuvas / eksportas, jeigu taikoma.",
      "Aparatas paliktas veikiantis ir tinkamas naudojimui."
    ]
  },
  {
    id: "wlt-endoscopy-pm",
    name: "Endoscope washer PM / technine prieziura",
    equipmentCategory: "Endoscopy",
    serviceType: "PM",
    linkedServiceTypes: ["PM"],
    linkedEquipmentIds: ["EQ-502"],
    linkedHospitalIds: ["CUST-03"],
    linkedWorkEquipmentIds: ["water-supply", "chemistry-dosing"],
    entryPerson: "Marius Vaitkus",
    entryDate: "2026-04-13",
    language: "lt",
    bodyText: "Technines prieziuros metu atlikti endoskopu plovyklos patikrinimai.",
    workRows: [
      "Vizualiai patikrinta irangos bukle, pajungimai ir saugumo zymejimai.",
      "Patikrinti filtrai, vandens padavimas ir drenazo sistema.",
      "Patikrintas ciklo paleidimas ir ciklo pabaigos registravimas.",
      "Patikrinti chemijos lygiai ir dozavimo grandine.",
      "Patikrinti klaidu pranesimai ir sistemos zurnalas.",
      "Iranga palikta veikianti ir tinkama naudojimui."
    ]
  },
  {
    id: "wlt-patient-lift-check",
    name: "Patient lift safety check",
    equipmentCategory: "Patient Handling",
    serviceType: "Service",
    linkedServiceTypes: ["Service", "Repair"],
    linkedEquipmentIds: ["EQ-503"],
    linkedHospitalIds: ["CUST-04"],
    linkedWorkEquipmentIds: ["battery-charger", "safety-load"],
    entryPerson: "Aurelija Jankauske",
    entryDate: "2026-04-12",
    language: "lt",
    bodyText: "Atliktas paciento keltuvo funkciniu ir saugos tasku patikrinimas.",
    workRows: [
      "Vizualiai patikrinta konstrukcija, ratai, stabdziai ir dirzai.",
      "Patikrintas valdymo pultas ir avarinis sustabdymas.",
      "Patikrintas akumuliatoriaus ikrovimas ir kroviklio veikimas.",
      "Atliktas pakelimo / nuleidimo funkcijos bandymas be apkrovos.",
      "Patikrinti saugos lipdukai ir identifikaciniai duomenys.",
      "Iranga palikta saugi naudojimui arba pazymeti apribojimai komentaruose."
    ]
  },
  {
    id: "wlt-generic-service",
    name: "Bendrinis serviso darbu sarasas",
    equipmentCategory: "General",
    serviceType: "Service",
    linkedServiceTypes: ["Service", "Repair", "Installation"],
    linkedEquipmentIds: [],
    linkedHospitalIds: [],
    linkedWorkEquipmentIds: [],
    entryPerson: "Marius Vaitkus",
    entryDate: "2026-04-12",
    language: "lt",
    bodyText: "Atlikti bendriniai serviso darbai pagal registruota gedima.",
    workRows: [
      "Išklausytas vartotojo gedimo aprasymas ir patikrinta registruota problema.",
      "Atlikta irangos apziura ir funkcine diagnostika.",
      "Atlikti korekciniai darbai arba pateiktos rekomendacijos.",
      "Patikrintas irangos veikimas po atliktu darbu.",
      "Klientas informuotas apie atliktus darbus ir tolimesnius veiksmus."
    ]
  }
];

// Work Act drafts generated from service jobs or created manually in the UI.
export const workActs = [];

// Defect Act drafts generated from service jobs or created manually in the UI.
export const defectActs = [];

// Commercial Offer drafts generated from quotations or created manually in the UI.
export const commercialOfferDrafts = [];

// ---------------------------------------------------------------------------
// Pipeline stages for document pipeline board
// ---------------------------------------------------------------------------
export const pipelineStages = ["Draft", "Review", "Customer", "Signature", "Approved"];

// ---------------------------------------------------------------------------
// Manual calendar events (sales meetings, demos, logistics).
// PM visits are auto-generated from contracts in render.js.
// ---------------------------------------------------------------------------
export const calendarEvents = [
  { id: "EV-01", date: "2026-04-08", title: "Sales demo — VCH ultrasound",  type: "sales",     userId: "u4" },
  { id: "EV-02", date: "2026-04-10", title: "Meeting — Baltic Cardio",       type: "sales",     userId: "u4" },
  { id: "EV-03", date: "2026-04-14", title: "Parts delivery KDX",            type: "logistics", userId: "u6" },
  { id: "EV-04", date: "2026-04-16", title: "PM visit — VCH ARIETTA 850",    type: "pm",        userId: "u1" },
  { id: "EV-05", date: "2026-04-20", title: "PM visit — KDX WASSENBURG",     type: "pm",        userId: "u3" },
  { id: "EV-06", date: "2026-04-23", title: "Contract review — CTR-101",     type: "contract",  userId: "u5" },
  { id: "EV-07", date: "2026-04-25", title: "New system demo — Northway",    type: "sales",     userId: "u4" }
];
